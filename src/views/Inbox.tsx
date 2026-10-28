import { useState } from "react";
import { loadInbox, updateInboxItem, type InboxItem } from "../lib/inbox";
import { runAgentJob, getKey } from "../lib/pollinations";

export default function InboxView({ onOpen }: { onOpen: (slug: string) => void }) {
  const [items, setItems] = useState<InboxItem[]>(() => loadInbox());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setItems(loadInbox());
    window.dispatchEvent(new Event("pollentowers-inbox"));
  }

  function decide(id: string, status: "approve" | "hold") {
    updateInboxItem(id, { status, decidedAt: new Date().toISOString() });
    refresh();
  }

  async function revise(item: InboxItem) {
    const note = notes[item.id]?.trim();
    if (!note) {
      setError("Add a revision note before sending the draft back.");
      return;
    }
    if (!getKey()) {
      setError("Connect Pollen first — revision re-runs the Pollinations agent.");
      return;
    }
    setBusyId(item.id);
    setError(null);
    try {
      const result = await runAgentJob({
        agentModel: item.agentModel,
        user: [
          `Company: ${item.company} (Floor ${item.floor})`,
          `Original brief: ${item.brief}`,
          `Previous draft:\n${item.draft}`,
        ].join("\n"),
        revisionNote: note,
      });
      updateInboxItem(item.id, {
        draft: result.text,
        status: "waiting",
        revisionNote: note,
        usage: result.usage,
        decidedAt: undefined,
      });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="panel">
      <h2>Decision inbox</h2>
      <p className="muted">
        Agents bring finished jobs here. A human approves, holds, or sends work back with a
        revision note — Pollentowers never publishes agent output automatically.
      </p>
      {error && <p className="error">{error}</p>}
      {items.length === 0 && (
        <section className="card">
          <p className="muted">No drafts yet. Step into an office and run today&apos;s agent job.</p>
        </section>
      )}
      {items.map((item) => (
        <article key={item.id} className="card inbox-item">
          <div className="row spread">
            <div>
              <span className="floor-chip soft">Floor {item.floor}</span>{" "}
              <strong>{item.company}</strong>
              <div className="muted small">{item.agentModel}</div>
            </div>
            <span className={`status ${item.status}`}>{item.status}</span>
          </div>
          <p className="muted small">Brief: {item.brief}</p>
          <div className="output">
            <pre>{item.draft}</pre>
          </div>
          {item.status === "waiting" && (
            <>
              <label className="field">
                <span className="muted small">Revision note (optional for approve/hold)</span>
                <textarea
                  rows={2}
                  value={notes[item.id] ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                  placeholder="Tell the agent what to change…"
                />
              </label>
              <div className="row">
                <button className="approve" onClick={() => decide(item.id, "approve")}>
                  Approve
                </button>
                <button
                  className="revise"
                  disabled={busyId === item.id}
                  onClick={() => revise(item)}
                >
                  {busyId === item.id ? "Revising…" : "Send back for revision"}
                </button>
                <button className="hold" onClick={() => decide(item.id, "hold")}>
                  Hold
                </button>
                <button className="back" onClick={() => onOpen(item.slug)}>
                  Open office
                </button>
              </div>
            </>
          )}
          {item.status !== "waiting" && (
            <p className="muted small">
              Decision: <strong>{item.status}</strong>
              {item.revisionNote ? ` · last note: ${item.revisionNote}` : ""}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
