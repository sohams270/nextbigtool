import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

/* ─── Stop words to skip when tokenising the query ───────────────────── */
const STOP = new Set([
  "a","an","the","is","it","for","to","of","in","on","at","by","i","me",
  "my","we","our","and","or","but","that","this","with","want","need",
  "looking","find","show","me","can","any","some","do","does","has","have",
  "use","used","using","something","tool","app","software","platform",
]);

export type SearchResult = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  pricing: string;
  upvote_count: number;
  tool_tags: { tags: { name: string } | null }[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) return Response.json({ results: [], total: 0 });

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  /* ── Tokenise ── */
  const words = q
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .slice(0, 6);

  // If all tokens were stop words, fall back to full query string
  const tokens = words.length > 0 ? words : [q.toLowerCase()];

  /* ── 1. Search tools (name + tagline + description) ── */
  const toolFilter = tokens
    .flatMap((w) => [
      `name.ilike.%${w}%`,
      `tagline.ilike.%${w}%`,
      `description.ilike.%${w}%`,
    ])
    .join(",");

  const { data: toolRows } = await supabase
    .from("tools")
    .select("id, slug, name, tagline, logo_url, pricing, upvote_count, tool_tags(tags(name))")
    .eq("status", "approved")
    .or(toolFilter)
    .order("upvote_count", { ascending: false })
    .limit(8);

  const toolResults = (toolRows ?? []) as unknown as SearchResult[];

  /* ── 2. Search by tag names → find additional tool_ids ── */
  const tagFilter = tokens.map((w) => `name.ilike.%${w}%`).join(",");

  const { data: matchedTags } = await supabase
    .from("tags")
    .select("id")
    .or(tagFilter)
    .limit(20);

  let extraResults: SearchResult[] = [];

  if (matchedTags && matchedTags.length > 0) {
    const tagIds = matchedTags.map((t: { id: string }) => t.id);
    const { data: junctionRows } = await supabase
      .from("tool_tags")
      .select("tool_id")
      .in("tag_id", tagIds)
      .limit(30);

    const alreadyFound = new Set(toolResults.map((t) => t.id));
    const newIds = [
      ...new Set((junctionRows ?? []).map((r: { tool_id: string }) => r.tool_id)),
    ].filter((id) => !alreadyFound.has(id));

    if (newIds.length > 0) {
      const { data: tagToolRows } = await supabase
        .from("tools")
        .select("id, slug, name, tagline, logo_url, pricing, upvote_count, tool_tags(tags(name))")
        .eq("status", "approved")
        .in("id", newIds)
        .order("upvote_count", { ascending: false })
        .limit(4);

      extraResults = (tagToolRows ?? []) as unknown as SearchResult[];
    }
  }

  /* ── 3. Merge & score ── */
  const allResults = [...toolResults, ...extraResults];

  // Score: name match = 3pts, tagline match = 2pts, else = 1pt, +upvote bonus
  const lq = q.toLowerCase();
  const scored = allResults.map((t) => {
    const nameLow    = t.name.toLowerCase();
    const taglineLow = t.tagline.toLowerCase();
    let score = 0;
    if (nameLow === lq)               score += 10;
    else if (nameLow.startsWith(lq))  score += 6;
    else if (nameLow.includes(lq))    score += 4;
    if (taglineLow.includes(lq))      score += 2;
    tokens.forEach((w) => {
      if (nameLow.includes(w))    score += 3;
      if (taglineLow.includes(w)) score += 2;
    });
    score += Math.log1p(t.upvote_count) * 0.5;
    return { ...t, _score: score };
  });

  scored.sort((a, b) => b._score - a._score);
  const results = scored.slice(0, 6).map(({ _score: _s, ...rest }) => rest);

  return Response.json({ results, total: allResults.length });
}
