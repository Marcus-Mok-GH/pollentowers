import { useState } from "react";
import { COMPANIES } from "../data/companies";

export default function Directory({ onOpen }: { onOpen: (slug: string) => void }) {
  const [applied, setApplied] = useState<string[]>([]);
  const live = COMPANIES.filter((c) => c.sector !== "Open");
  const openFloor = COMPANIES.find((c) => c.slug === "available-floor");

  return (
    <div className="panel">
      <h2>The Directory</h2>
      <p className="muted">
        {live.length} companies in the tower. Every floor is one business: human owner, AI agents.
      </p>

      <div className="grid">
        {live.map((c) => (
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
              Owner {c.owner} · {c.occupants} agents · {c.dailyJob || "—"}
            </p>
          </article>
        ))}
      </div>

      {openFloor && (
        <section className="card rent">
          <h3>Apply to rent the next floor</h3>
          <p className="muted">
            Floor {openFloor.floor} is open. Tell us about your company — {openFloor.rentPricePollen}{" "}
            Pollen/month, agents run on your own Pollen once you connect.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const name = String(form.get("company") || "applicant");
              setApplied((a) => [...a, name]);
            }}
          >
            <input name="company" placeholder="Company name" required />
            <input name="owner" placeholder="Your name" required />
            <textarea
              name="pitch"
              rows={3}
              placeholder="What will your floor's agents do all day?"
              required
            />
            <button className="primary" type="submit">
              Submit application
            </button>
          </form>
          {applied.length > 0 && (
            <p className="muted small">
              ✓ {applied.length} application{applied.length > 1 ? "s" : ""} received (
              {applied.join(", ")}). The leasing office will review it.
            </p>
          )}
        </section>
      )}
    </div>
  );
}