type Meta = { full_name: string; description: string | null; homepage: string | null; fork: boolean; language: string | null };
type Blob = { type: string; path: string };
type Commit = { commit?: { author?: { date?: string } } };

export type RepoInfo = {
  name: string; description: string; homepage: string; fork: boolean; language: string;
  readme: string; files: string[]; manifests: string; firstCommit: string; lastCommit: string; commitsSeen: number;
};

// Accepts only https://github.com/owner/repo (a missing scheme is added).
export function parseRepo(input: string): { owner: string; repo: string } | null {
  const s = input.trim();
  let u: URL;
  try { u = new URL(/^[a-z]+:\/\//i.test(s) ? s : "https://" + s); } catch { return null; }
  if (u.protocol !== "https:" || u.hostname !== "github.com" || u.username || u.password || u.port) return null;
  const [owner, rawRepo] = u.pathname.split("/").filter(Boolean);
  const repo = (rawRepo ?? "").replace(/\.git$/, "");
  if (!owner || !repo || !/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) return null;
  return { owner, repo };
}

export async function fetchRepo(owner: string, repo: string): Promise<RepoInfo | { error: string }> {
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const get = (path: string, accept = "application/vnd.github+json") =>
    fetch(base + path, {
      headers: {
        Accept: accept, "User-Agent": "tutorial-graveyard",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(10000), cache: "no-store",
    });
  const raw = "application/vnd.github.raw+json";
  try {
    const meta = await get("");
    if (meta.status === 404) return { error: "Repo not found, or it is private. Make it public and try again." };
    if (meta.status === 403 || meta.status === 429) return { error: "GitHub is rate-limiting us right now. Try again in a few minutes." };
    if (!meta.ok) return { error: "Could not read that repo from GitHub." };
    const m: Meta = await meta.json();

    const [rd, tree, commits, pkg, req] = await Promise.all([
      get("/readme", raw), get("/git/trees/HEAD?recursive=1"), get("/commits?per_page=30"),
      get("/contents/package.json", raw), get("/contents/requirements.txt", raw),
    ]);
    const readme = rd.ok ? (await rd.text()).slice(0, 6000) : "";
    const t: { tree?: Blob[] } = tree.ok ? await tree.json() : {};
    const files = (t.tree ?? [])
      .filter((x) => x.type === "blob" && !/(^|\/)(node_modules|\.git|dist|build|\.next|venv|__pycache__)\//.test(x.path))
      .map((x) => x.path).slice(0, 80);
    const cm: Commit[] = commits.ok ? await commits.json() : [];
    const dates = (Array.isArray(cm) ? cm : []).map((c) => c.commit?.author?.date ?? "").filter(Boolean);
    const manifests = [
      pkg.ok ? "package.json:\n" + (await pkg.text()).slice(0, 1200) : "",
      req.ok ? "requirements.txt:\n" + (await req.text()).slice(0, 1200) : "",
    ].filter(Boolean).join("\n\n");

    return {
      name: m.full_name, description: m.description ?? "", homepage: m.homepage ?? "", fork: m.fork,
      language: m.language ?? "", readme, files, manifests,
      firstCommit: dates[dates.length - 1] ?? "", lastCommit: dates[0] ?? "", commitsSeen: dates.length,
    };
  } catch {
    return { error: "GitHub took too long to answer. Try again in a minute." };
  }
}