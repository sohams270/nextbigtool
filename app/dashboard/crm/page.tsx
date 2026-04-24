import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashTopbar from "../../components/DashTopbar";
import UpgradeBanner from "../../components/UpgradeBanner";
import Avatar from "../../components/Avatar";
import Pill from "../../components/Pill";
import Btn from "../../components/Btn";

const TABLE_HEADERS = ["User", "Upvoted Tool", "Date", "Message"];

type UpvoteRow = {
  created_at: string;
  tool_id: string;
  profiles: { full_name: string | null; username: string | null } | null;
  tools: { name: string } | null;
};

export default async function CRMPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: myTools } = await supabase
    .from("tools")
    .select("id, name")
    .eq("submitter_id", user.id);

  const toolIds = (myTools ?? []).map((t) => t.id);
  const topToolName = myTools?.[0]?.name ?? "your tool";

  let upvoters: UpvoteRow[] = [];
  if (toolIds.length > 0) {
    const { data } = await supabase
      .from("upvotes")
      .select(`
        created_at, tool_id,
        profiles ( full_name, username ),
        tools ( name )
      `)
      .in("tool_id", toolIds)
      .order("created_at", { ascending: false })
      .limit(50);
    upvoters = (data ?? []) as unknown as UpvoteRow[];
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function displayName(row: UpvoteRow) {
    return row.profiles?.full_name ?? row.profiles?.username ?? "Anonymous";
  }

  return (
    <>
      <DashTopbar
        title="Interested Users"
        subtitle={
          upvoters.length
            ? `${upvoters.length} ${upvoters.length === 1 ? "person" : "people"} interested in ${topToolName}`
            : "No interactions yet"
        }
      />

      {/* Filter bar */}
      <div
        style={{
          padding: "14px 24px",
          display: "flex",
          gap: 10,
          background: "#fff",
          borderBottom: "1px solid #CFCFD4",
          alignItems: "center",
        }}
      >
        <Btn variant="ghostMuted" size="sm">All Products ▾</Btn>
        <Btn variant="ghostMuted" size="sm">All Actions ▾</Btn>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #CFCFD4",
            borderRadius: 6,
            padding: "8px 10px",
            background: "#fff",
            width: 240,
            height: 36,
          }}
        >
          <span style={{ fontSize: 12, color: "#A8A8AD" }}>⌕</span>
          <span style={{ fontSize: 12, color: "#A8A8AD" }}>Search name or email…</span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        <UpgradeBanner />

        {toolIds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#A8A8AD", marginTop: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", marginBottom: 4 }}>
              No tools submitted yet
            </div>
            <div style={{ fontSize: 11 }}>
              Submit a tool to start seeing who interacts with it.
            </div>
          </div>
        ) : upvoters.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#A8A8AD", marginTop: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>👀</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", marginBottom: 4 }}>
              No upvotes yet
            </div>
            <div style={{ fontSize: 11 }}>
              Once people upvote your tools, they will appear here.
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              border: "1px solid #CFCFD4",
              marginTop: 16,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit" }}>
              <thead>
                <tr style={{ background: "#F5F5F5" }}>
                  {TABLE_HEADERS.map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: i === TABLE_HEADERS.length - 1 ? "right" : "left",
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#6B6B70",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upvoters.map((r, i) => {
                  const name = displayName(r);
                  return (
                    <tr key={`${r.tool_id}-${i}`} style={{ borderTop: "1px solid #F5F5F5" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar size={32} letter={name[0].toUpperCase()} index={i} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700 }}>{name}</div>
                            {r.profiles?.username && (
                              <div style={{ fontSize: 10, color: "#6B6B70" }}>@{r.profiles.username}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <Pill color="orange" size="xs">Upvoted {r.tools?.name ?? "—"}</Pill>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 11, color: "#6B6B70" }}>{formatDate(r.created_at)}</span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <Btn
                          variant="ghost"
                          size="sm"
                          style={{ borderColor: "#FF6B35", color: "#FF6B35" }}
                        >
                          Message
                        </Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
