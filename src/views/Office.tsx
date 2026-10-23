import { useState } from "react";
import type { Company } from "../data/companies";
import { runAgentJob, getKey, renderSign } from "../lib/pollinations";

type Decision = "approve" | "revise" | "hold";

const DECISION_LOG: { company: string; choice: Decision; time: string }[] = [];

export default function Office({
  company,
  onBack,
}: {
  company: Company;
  onBack: () => void;
}) {
  const [output, setOutput] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [signBusy, setSignBusy] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  const hasKey = Boolean(getKey());

  async function runJob() {
    setStatus("running");
    setError(null);
    setOutput(null);
    try {
      const result = await runAgentJob({
        system: company.agentPrompt,
        user: `Daily job: ${company.dailyJob}. Today's context: the tower had a quiet night; two visitors browsed the lobby. Deliver the finished work in a compact report, ending with the single decision you need the owner to make.`,
      });
      setOutput(result.text);
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
        `Illuminated office sign for \"${company.name}\" on floor ${company.floor} of a neon skyscraper at night, ${company.sector} studio, cinematic, glowing ${company.color} lettering`,
      );
      setSignUrl(url);
    } catch (e) {
      setSignError(e instanceof Error ? e.message : String(e));
    } finally {
      setSignBusy(false);
    }
  }

  function recordDecision(choice: Decision) {
    setDecision(choice);
    DECISION_LOG.push({ company: company.name, choice, time: new Date().toISOString() });
  }

  return (
    <div className="panel">
      <button className="back" onClick={onBack}>
        ← Back to tower
      </button>
      <div className="office-head" style={{ borderColor: company.color }}>
        <span className="floor-chip" style={{ background: company.color, color: "#070a12" }}>
          Floor {company.floor}
        </span>
        <h2 style={{ color: company.color }}>{company.name}</h2>
        <p className="tagline">{company.tagline}</p>
        <p className="meta">
          {company.sector} · {company.occupants || "—"} agents · owner: {company.owner} · rent{" "}
          {company.rentPricePollen} Pollen/mo
        </p>
      </div>

      {company.agentPrompt ? (
        <>
          <section className="card">
            <h3>Agent desk</h3>
            <p className="muted">
              Today's job: <strong>{company.dailyJob}</strong>
            </p>
            <button className="primary" onClick={runJob} disabled={status === "running"}>
              {status === "running" ? "Agent working…" : "Run today's agent job"}
            </button>
            {!hasKey && (
              <p className="muted small">
                Running keyless on Pollinations. Connect your own Pollen (top of page) to spend your
                balance and unlock images.
              </p>
            )}
            {status === "error" && <p className="error">{error}</p>}
            {output && (
              <div className="output">
                <pre>{output}</pre>
              </div>
            )}
          </section>

          <section className="card">
            <h3>Owner decision</h3>
            <p className="muted">{company.decision}</p>
            <div className="row">
              <button className="approve" onClick={() => recordDecision("approve")} disabled={!output}>
                Approve
              </button>
              <button className="revise" onClick={() => recordDecision("revise")} disabled={!output}>
                Send back for revision
              </button>
              <button className="hold" onClick={() => recordDecision("hold")} disabled={!output}>
                Hold
              </button>
            </div>
            {decision && (
              <p className="muted small">
                Decision recorded: <strong>{decision}</strong> — the agent picks it up on the next
                run.
              </p>
            )}
          </section>

          <section className="card">
            <h3>Floor sign</h3>
            <p className="muted">
              Mint the office's illuminated sign below — images spend Pollen, so they only run
              with your own key.
            </p>
            <button className="primary" onClick={mintSign} disabled={signBusy}>
              {signBusy ? "Minting..." : "Generate sign image"}
            </button>
            {signError && <p className="error">{signError}</p>}
            {signUrl && <img className="sign" src={signUrl} alt={`${company.name} sign`} />}
          </section>
        </>
      ) : (
        <section className="card">
          <h3>🏢 This floor is available</h3>
          <p className="muted">
            Rent the next floor for {company.rentPricePollen} Pollen/month in the Directory, and
            your company opens here with its own agent running daily jobs.
          </p>
        </section>
      )}
    </div>
  );
}