import { useState } from "react";
import type { Company } from "../data/companies";
import { runAgentJob, getKey, renderSign } from "../lib/pollinations";
import { addDraft } from "../lib/inbox";

export default function Office({
  company,
  onBack,
  onOpenInbox,
}: {
  company: Company;
  onBack: () => void;
  onOpenInbox: () => void;
}) {
  const [brief, setBrief] = useState(company.dailyJob);
  const [output, setOutput] = useState<string | null>(null);
  const [usage, setUsage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [signBusy, setSignBusy] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const hasKey = Boolean(getKey());
  const canRun = Boolean(company.agentModel);

  async function runJob() {
    if (!company.agentModel) return;
    setStatus("running");
    setError(null);
    setOutput(null);
    setUsage(null);
    setSaved(false);
    try {
      const result = await runAgentJob({
        agentModel: company.agentModel,
        user: [
          `Company: ${company.name} (Floor ${company.floor})`,
          `Owner: ${company.owner}`,
          `Sector: ${company.sector}`,
          `Today's job: ${brief || company.dailyJob}`,
          `Decision the owner must make afterwards: ${company.decision}`,
          "Deliver finished work as a compact draft. End with the single decision you need the owner to make.",
        ].join("\n"),
      });
      setOutput(result.text);
      setUsage(
        result.usage?.total_tokens
          ? `${result.usage.total_tokens} tokens · agent ${company.agentModel}`
          : `agent ${company.agentModel}`,
      );
      addDraft({
        company: company.name,
        slug: company.slug,
        floor: company.floor,
        agentModel: company.agentModel,
        brief: brief || company.dailyJob,
        draft: result.text,
        usage: result.usage,
      });
      setSaved(true);
      window.dispatchEvent(new Event("pollentowers-inbox"));
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function mintSign() {
    setSignBusy(true);
    setSignError(null);
    try {
      const url = await renderSign(
        `Illuminated office sign for "${company.name}" on floor ${company.floor} of a neon skyscraper at night, ${company.sector} studio, cinematic, glowing ${company.color} lettering`,
      );
      setSignUrl(url);
    } catch (e) {
      setSignError(e instanceof Error ? e.message : String(e));
    } finally {
      setSignBusy(false);
    }
  }

  return (
    <div className="panel">
      <div className="row spread">
        <button className="back" onClick={onBack}>
          ← Back to tower
        </button>
        <button className="ghost" onClick={onOpenInbox}>
          Open decision inbox
        </button>
      </div>

      <div className="office-head" style={{ borderColor: company.color }}>
        <span className="floor-chip" style={{ background: company.color, color: "#070a12" }}>
          Floor {company.floor}
        </span>
        <h2 style={{ color: company.color }}>{company.name}</h2>
        <p className="tagline">{company.tagline}</p>
        <p className="meta">
          {company.sector} · owner {company.owner}
          {company.agentTitle ? ` · agent ${company.agentTitle}` : ""}
          {company.rentPricePollen > 0 ? ` · ${company.rentPricePollen} Pollen/mo` : ""}
        </p>
        {company.agentModel && (
          <p className="muted small mono">{company.agentModel}</p>
        )}
      </div>

      {canRun ? (
        <>
          <section className="card">
            <h3>Agent desk</h3>
            <p className="muted">
              This floor runs a real Pollinations public agent. Jobs spend the visitor&apos;s own
              Pollen. Finished work lands in the decision inbox for a human.
            </p>
            <label className="field">
              <span className="muted small">Brief for today&apos;s job</span>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={3}
                placeholder={company.dailyJob}
              />
            </label>
            <button className="primary" onClick={runJob} disabled={status === "running" || !hasKey}>
              {status === "running" ? "Agent working…" : "Run Pollinations agent"}
            </button>
            {!hasKey && (
              <p className="muted small">
                Connect Pollen at the top of the page first — BYOP bills your own balance.
              </p>
            )}
            {status === "error" && <p className="error">{error}</p>}
            {output && (
              <div className="output">
                <pre>{output}</pre>
              </div>
            )}
            {usage && <p className="muted small">{usage}</p>}
            {saved && (
              <p className="ok small">
                Draft saved to the decision inbox — approve it, hold it, or send it back for
                revision.
              </p>
            )}
          </section>

          <section className="card">
            <h3>Owner decision</h3>
            <p className="muted">{company.decision}</p>
            <p className="muted small">
              Use the Decisions tab to approve, hold, or send the agent back with a revision note.
            </p>
          </section>

          <section className="card">
            <h3>Floor sign</h3>
            <p className="muted">
              Mint an illuminated sign with a Pollinations image model. Images also spend your
              Pollen.
            </p>
            <button className="primary" onClick={mintSign} disabled={signBusy || !hasKey}>
              {signBusy ? "Minting…" : "Generate sign image"}
            </button>
            {signError && <p className="error">{signError}</p>}
            {signUrl && <img className="sign" src={signUrl} alt={`${company.name} sign`} />}
          </section>
        </>
      ) : (
        <section className="card">
          <h3>This floor is available</h3>
          <p className="muted">
            Rent Floor {company.floor} for {company.rentPricePollen} Pollen/month from the Directory.
            The leasing officer is a Pollinations agent that reviews your pitch before a human
            landlord decides.
          </p>
        </section>
      )}
    </div>
  );
}
