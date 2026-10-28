export type Decision = "approve" | "revise" | "hold";

export type InboxItem = {
  id: string;
  company: string;
  slug: string;
  floor: number;
  agentModel: string;
  brief: string;
  draft: string;
  status: Decision | "waiting";
  revisionNote?: string;
  createdAt: string;
  decidedAt?: string;
  usage?: { total_tokens?: number };
};

const STORAGE = "pollentowers.inbox.v1";

export function loadInbox(): InboxItem[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveInbox(items: InboxItem[]) {
  localStorage.setItem(STORAGE, JSON.stringify(items.slice(0, 40)));
}

export function addDraft(item: Omit<InboxItem, "id" | "createdAt" | "status">): InboxItem {
  const next: InboxItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: "waiting",
  };
  const all = [next, ...loadInbox()];
  saveInbox(all);
  return next;
}

export function updateInboxItem(id: string, patch: Partial<InboxItem>) {
  const all = loadInbox().map((item) => (item.id === id ? { ...item, ...patch } : item));
  saveInbox(all);
  return all.find((i) => i.id === id) ?? null;
}
