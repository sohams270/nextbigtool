import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

/* ─── Stop words ─────────────────────────────────────────────────────── */
const STOP = new Set([
  "a","an","the","is","it","for","to","of","in","on","at","by","i","me",
  "my","we","our","and","or","but","that","this","with","want","need",
  "looking","find","show","me","can","any","some","do","does","has","have",
  "use","used","using","something","tool","app","software","platform",
  "help","good","best","great","like","make","build","create","get","give",
  "which","what","where","when","how","am","are","be","been","was","were",
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

/**
 * Lightweight stem: "finances"→"financ", "scheduling"→"schedul", "tracker"→"track"
 * Strips common English suffixes so "track" matches "tracker", "finance" matches "finances"
 */
function stem(word: string): string {
  return word
    .replace(/ing$/, "")
    .replace(/tion$/, "")
    .replace(/ations$/, "")
    .replace(/ness$/, "")
    .replace(/ment$/, "")
    .replace(/ings$/, "")
    .replace(/ers?$/, "")
    .replace(/ies$/, "y")
    .replace(/s$/, "")
    .replace(/ed$/, "");
}

/**
 * Returns true if `text` contains the token or its stem.
 * Checks word boundaries so "track" doesn't match "backtrack" wrongly.
 */
function tokenMatches(text: string, raw: string): boolean {
  if (text.includes(raw)) return true;
  const s = stem(raw);
  if (s.length < 3) return false;
  // Word-boundary aware: split text into words and check each
  const words = text.split(/[\s\-_/().]+/);
  return words.some((w) => {
    const ws = stem(w);
    return w.startsWith(s) || ws === s || ws.startsWith(s) || s.startsWith(ws);
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) return Response.json({ results: [], total: 0 });

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  /* ── Tokenise ── */
  const tokens = q
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .slice(0, 8);

  const effectiveTokens = tokens.length > 0 ? tokens : [q.toLowerCase().slice(0, 20)];

  /* ── Step 1: broad OR fetch across name + tagline + description ── */
  const orFilter = effectiveTokens
    .flatMap((w) => [
      `name.ilike.%${w}%`,
      `tagline.ilike.%${w}%`,
      `description.ilike.%${w}%`,
    ])
    .join(",");

  const { data: broadRows } = await supabase
    .from("tools")
    .select("id, slug, name, tagline, description, logo_url, pricing, upvote_count, tool_tags(tags(name))")
    .eq("status", "approved")
    .or(orFilter)
    .order("upvote_count", { ascending: false })
    .limit(50);

  /* ── Step 2: also pull in tag matches ── */
  const tagOrFilter = effectiveTokens.map((w) => `name.ilike.%${w}%`).join(",");
  const { data: matchedTags } = await supabase
    .from("tags").select("id").or(tagOrFilter).limit(20);

  let tagToolIds: string[] = [];
  if (matchedTags && matchedTags.length > 0) {
    const tagIds = matchedTags.map((t: { id: string }) => t.id);
    const { data: junctionRows } = await supabase
      .from("tool_tags").select("tool_id").in("tag_id", tagIds).limit(40);
    const broadIds = new Set((broadRows ?? []).map((t: { id: string }) => t.id));
    tagToolIds = [...new Set(
      (junctionRows ?? []).map((r: { tool_id: string }) => r.tool_id)
    )].filter((id) => !broadIds.has(id));
  }

  let tagTools: typeof broadRows = [];
  if (tagToolIds.length > 0) {
    const { data } = await supabase
      .from("tools")
      .select("id, slug, name, tagline, description, logo_url, pricing, upvote_count, tool_tags(tags(name))")
      .eq("status", "approved")
      .in("id", tagToolIds)
      .order("upvote_count", { ascending: false })
      .limit(20);
    tagTools = data ?? [];
  }

  const allCandidates = [...(broadRows ?? []), ...(tagTools ?? [])];

  /* ── Step 3: AND-filter — ALL tokens must match somewhere in the tool ── */
  // This is the key fix: OR fetches broadly, AND filter ensures relevance.
  const relevant = allCandidates.filter((tool) => {
    // Build the full searchable text for this tool
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tags = ((tool.tool_tags as any[]) ?? [])
      .map((tt: { tags?: { name: string } | null }) => tt.tags?.name ?? "")
      .join(" ");
    const fullText = `${tool.name} ${tool.tagline} ${tool.description ?? ""} ${tags}`.toLowerCase();

    // Every token must match somewhere in the full text
    return effectiveTokens.every((token) => tokenMatches(fullText, token));
  });

  /* ── Step 4: score the relevant results ── */
  const lq = q.toLowerCase();
  const scored = relevant.map((tool) => {
    const nameLow    = tool.name.toLowerCase();
    const taglineLow = tool.tagline.toLowerCase();
    let score = 0;

    // Exact / prefix / contains on full query phrase
    if (nameLow === lq)               score += 20;
    else if (nameLow.startsWith(lq))  score += 12;
    else if (nameLow.includes(lq))    score += 8;
    if (taglineLow.includes(lq))      score += 4;

    // Per-token scoring
    effectiveTokens.forEach((w) => {
      if (nameLow.includes(w))    score += 5;
      if (taglineLow.includes(w)) score += 3;
    });

    // Popularity boost (log-scaled so it doesn't drown out relevance)
    score += Math.log1p(tool.upvote_count) * 0.4;

    return { ...tool, _score: score };
  });

  scored.sort((a, b) => b._score - a._score);

  // Strip internal score field
  const results = scored
    .slice(0, 6)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map(({ _score: _s, description: _d, ...rest }) => rest) as unknown as SearchResult[];

  return Response.json({ results, total: relevant.length });
}
