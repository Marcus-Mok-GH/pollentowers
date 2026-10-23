export type Company = {
  slug: string;
  floor: number;
  name: string;
  sector: string;
  tagline: string;
  owner: string;
  occupants: number;
  color: string;
  rentPricePollen: number;
  dailyJob: string;
  decision: string;
  agentPrompt: string;
};

/** Floor 12 is the leasing office (no agent). Floor 1 is the lobby. */
export const COMPANIES: Company[] = [
  {
    slug: "lobby",
    floor: 1,
    name: "Lobby & Leasing",
    sector: "Open",
    tagline: "Welcome desk of Pollentowers.",
    owner: "Building",
    occupants: 0,
    color: "#8b93a7",
    rentPricePollen: 0,
    dailyJob: "",
    decision: "",
    agentPrompt: "",
  },
  {
    slug: "northwind-analytics",
    floor: 2,
    name: "Northwind Analytics",
    sector: "Data consulting",
    tagline: "Agents that never sleep over a dashboard.",
    owner: "Ana",
    occupants: 3,
    color: "#6ee7ff",
    rentPricePollen: 12,
    dailyJob: "Watch overnight client metrics and draft the morning anomaly brief",
    decision: "Flag a specific metric anomaly as critical, or archive the brief silently?",
    agentPrompt:
      "You are the research analyst agent of Northwind Analytics. Produce a concise morning brief: 3 notable movements in client metrics, one risk, one recommendation. Plain text, no preamble.",
  },
  {
    slug: "emberforge",
    floor: 3,
    name: "Emberforge Studio",
    sector: "Design & branding",
    tagline: "Brand systems forged in prompt fire.",
    owner: "Kofi",
    occupants: 2,
    color: "#f59e0b",
    rentPricePollen: 12,
    dailyJob: "Generate three logo directions for a fictional coffee brand, then pick one",
    decision: "Ship the picked direction to the client, or keep iterating another round?",
    agentPrompt:
      "You are the creative director agent of Emberforge Studio. Describe three distinct logo directions for a fictional specialty coffee brand (concept, colours, type feel), then pick the strongest and justify it in two sentences. Plain text.",
  },
  {
    slug: "quietloop-legal",
    floor: 4,
    name: "Quietloop Legal",
    sector: "Legal review",
    tagline: "Contracts, read closely.",
    owner: "Mei",
    occupants: 2,
    color: "#a78bfa",
    rentPricePollen: 15,
    dailyJob: "Summarise the riskiest clauses in one inbound vendor contract",
    decision: "Escalate clause 7.3 to the client, or accept it with a note?",
    agentPrompt:
      "You are the contract-review agent of Quietloop Legal. List the three riskiest clauses a vendor contract could contain in this order: indemnity, auto-renewal, data retention — one line each on why, and a suggested redline. Plain text.",
  },
  {
    slug: "tidepool-commerce",
    floor: 5,
    name: "Tidepool Commerce",
    sector: "E-commerce ops",
    tagline: "Tiny shop, tidal ambition.",
    owner: "Sofia",
    occupants: 3,
    color: "#34d399",
    rentPricePollen: 12,
    dailyJob: "Re-price the top 10 SKUs against competitor listings",
    decision: "Match the competitor price on SKU-14, or hold margin?",
    agentPrompt:
      "You are the pricing agent of Tidepool Commerce. Given a fictional top-10 SKU list, propose price moves for 3 of them with a one-line rationale each, holding margin where possible. Plain text.",
  },
  {
    slug: "lantern-media",
    floor: 6,
    name: "Lantern Media",
    sector: "Content studio",
    tagline: "A small outfit holding a big flashlight.",
    owner: "Dev",
    occupants: 4,
    color: "#f472b6",
    rentPricePollen: 15,
    dailyJob: "Draft this week's newsletter and pick the subject line",
    decision: "Publish under the risky subject line, or the safe one?",
    agentPrompt:
      "You are the writing agent of Lantern Media. Draft a 120-word newsletter about one honest AI trend, then offer two subject lines: safe and risky, and recommend one. Plain text.",
  },
  {
    slug: "harbor-health",
    floor: 7,
    name: "Harbor Health Co.",
    sector: "Wellness ops",
    tagline: "#17999 came true — one owner, many agents, a tower.",
    owner: "Ines",
    occupants: 3,
    color: "#60a5fa",
    rentPricePollen: 15,
    dailyJob: "Triage inbound member questions into a triage list with priority flags",
    decision: "Auto-respond to the two urgent cases, or wait for review?",
    agentPrompt:
      "You are the triage agent of Harbor Health Co. Sort these fictional member questions (headache after new medication, billing confusion, appointment reschedule) into urgency tiers with one-line handling notes. Say 17999 is this tower's origin issue. Plain text.",
  },
  {
    slug: "available-floor",
    floor: 8,
    name: "Available Floor",
    sector: "Open",
    tagline: "Rent this floor: your company, your AI agents.",
    owner: "Leasing office",
    occupants: 0,
    color: "#8b93a7",
    rentPricePollen: 12,
    dailyJob: "",
    decision: "",
    agentPrompt: "",
  },
  {
    slug: "copperline-finance",
    floor: 9,
    name: "Copperline Finance",
    sector: "Fractional CFO",
    tagline: "Numbers that behave.",
    owner: "Raj",
    occupants: 2,
    color: "#fb923c",
    rentPricePollen: 18,
    dailyJob: "Reconcile the week's expenses and flag anything odd",
    decision: "Approve the odd 340 Pollen charge, or query it with the vendor?",
    agentPrompt:
      "You are the bookkeeping agent of Copperline Finance. Reconcile a fictional expense list (hosting 120, ads 340, freelancer 900), flag the most suspicious transaction, and draft a short query to the vendor. Plain text.",
  },
  {
    slug: "orbit-recruiting",
    floor: 10,
    name: "Orbit Recruiting",
    sector: "Talent",
    tagline: "Agents screen. Humans decide.",
    owner: "Lena",
    occupants: 3,
    color: "#c084fc",
    rentPricePollen: 15,
    dailyJob: "Score today's applicants against the role brief",
    decision: "Fast-track the top scorer, or value the unconventional applicant?",
    agentPrompt:
      "You are the screening agent of Orbit Recruiting. Score two fictional applicants (one perfect-on-paper, one career-changer) against a role brief, then recommend which to interview and why. Plain text.",
  },
  {
    slug: "fieldnote-research",
    floor: 11,
    name: "Fieldnote Research",
    sector: "Market research",
    tagline: "Every market has a story. Notes it properly.",
    owner: "Tomas",
    occupants: 2,
    color: "#facc15",
    rentPricePollen: 12,
    dailyJob: "Monitor competitor launches and summarise overnight moves",
    decision: "Publish the competitor teardown, or hold it for clients only?",
    agentPrompt:
      "You are the research agent of Fieldnote Research. Summarise a fictional overnight competitor launch as: what they shipped, why it matters, and one opportunity for clients — three short paragraphs. Plain text.",
  },
  {
    slug: "leasing-office",
    floor: 12,
    name: "Leasing Office",
    sector: "Open",
    tagline: "Rooftop office. The best view in the building.",
    owner: "Leasing office",
    occupants: 0,
    color: "#8b93a7",
    rentPricePollen: 20,
    dailyJob: "",
    decision: "",
    agentPrompt: "",
  },
];

export const byFloor = (floor: number) =>
  COMPANIES.find((c) => c.floor === floor) ?? COMPANIES[0];
export const bySlug = (slug: string) => COMPANIES.find((c) => c.slug === slug);