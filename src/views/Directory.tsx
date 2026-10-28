import { useState, type FormEvent } from "react";
import { COMPANIES, LEASING_AGENT } from "../data/companies";
import { getKey, runAgentJob } from "../lib/pollinations";
import { addDraft } from "../lib/inbox";

type Application = {
  company: string;
  owner: string;
  pitch: string;
  review?: string;
  createdAt: string;
};

const APP_STORAGE = "pollentowers.applications.v1";

function loadApps(): Application[] {
  try {
    const raw = localStorage.getItem(APP_STORAGE);
    return raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    return [];
  }
}

export default function Directory({ onOpen }: { onOpen: (slug: string) => void }) {
  const [apps, setApps] = useState<Application[]>(() => loadApps());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const live = COMPANIES.filter((c) => !c.vacant);
  const openFloor = COMPANIES.find((c) => c.vacant);
  const filtered = live.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [c.name, c.sector, c.owner, c.tagline, c.agentTitle]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const company = String(form.get("company") || "").trim();
    const owner = String(form.get("owner") || "").trim();
    const pitch = String(form.get("pitch") || "").trim();
    if (!company || !owner || !pitch) return;

    setBusy(true);
    setError(null);
    let review: string | undefined;
    try {
      if (getKey()) {
        const result = await runAgentJob({
          agentModel: LEASING_AGENT,
          user: [
            `Review this Pollentowers Floor ${openFloor?.floor ?? 8} rental application.`,
            `Company: ${company}`,
            `Owner: ${owner}`,
            `Pitch: ${pitch}`,
            `Listed rent: ${openFloor?.rentPricePollen ?? 12} Pollen/month.`,
          ].join("\n"),
        });
        review = result.text;
        addDraft({
          company: "Leasing Office",
          slug: "leasing-office",
          floor: 12,
          agentModel: LEASING_AGENT,
          brief: `Rent application — ${company}`,
          draft: result.text,
          usage: result.usage,
        });
        window.dispatchEvent(new Event("pollentowers-inbox"));
      }
      const next: Application = {
        company,
        owner,
        pitch,
        review,
        createdAt: new Date().toISOString(),
      };
      const all = [next, ...apps];
      localStorage.setItem(APP_STORAGE, JSON.stringify(all));
      setApps(all);
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <h2>The Directory</h2>
      <p className="muted">
        {live.filter((c) => c.agentModel).length} floors with live Pollinations agents. Search,
        step into an office, or apply to rent the vacant floor.
      </p>

      <input
        className="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search companies, sectors, owners…"
      />

      <div className="grid">
        {filtered.map((c) => (
          <article key={c.slug} className="card company" onClick={() => onOpen(c.slug)}>
            <div className="row spread">
              <span className="floor-chip" style={{ background: c.color, color: "#070a12" }}>
                {c.floor}
              </span>
              <span className="muted small">{c.sector}</span>
            </div>
            <h3 style={{ color: c.color }}>{c.name}</h3>
            <p className="muted small">{c.tagline}</p>
            <p className="muted small">
              Owner {c.owner}
              {c.agentTitle ? ` · ${c.agentTitle}` : ""}
            </p>
          </article>
        ))}
      </div>

      {openFloor && (
        <section className="card rent">
          <h3>Apply to rent Floor {openFloor.floor}</h3>
          <p className="muted">
            {openFloor.rentPricePollen} Pollen/month. If you are connected, the leasing officer
            agent (`{LEASING_AGENT}`) reviews your pitch and drops a draft into the decision inbox.
          </p>
          <form onSubmit={submit}>
            <input name="company" placeholder="Company name" required />
            <input name="owner" placeholder="Your name" required />
            <textarea
              name="pitch"
              rows={3}
              placeholder="What will your floor's agents do all day?"
              required
            />
            <button className="primary" type="submit" disabled={busy}>
              {busy ? "Leasing agent reviewing…" : "Submit application"}
            </button>
          </form>
          {!getKey() && (
            <p className="muted small">
              Without Pollen connected, the application is stored locally and skips the agent
              review.
            </p>
          )}
          {error && <p className="error">{error}</p>}
          {apps.length > 0 && (
            <div className="apps">
              <h4>Recent applications</h4>
              {apps.slice(0, 5).map((a) => (
                <div key={a.createdAt} className="app-row">
                  <strong>{a.company}</strong> · {a.owner}
                  {a.review && (
                    <div className="output compact">
                      <pre>{a.review}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
