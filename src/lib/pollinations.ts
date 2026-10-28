/**
 * Pollinations client for Pollentowers.
 *
 * - Agents run as public Pollinations prompt agents (`community/...`).
 * - Visitors pay with their own Pollen via <polli-connect> (BYOP).
 * - The publishable App Key (pk_...) is safe to ship; sk_ tokens stay in sessionStorage.
 */

export const APP_KEY = "pk_zVuFbawriE5hsCXK";

const SESSION_KEY = "connect.apiKey";
const FALLBACK_KEY = "pollentowers.session_key";

export type AgentResult = {
  text: string;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export function getKey(): string | null {
  try {
    return (
      sessionStorage.getItem(SESSION_KEY) ||
      sessionStorage.getItem(FALLBACK_KEY) ||
      null
    );
  } catch {
    return null;
  }
}

export function setKey(key: string | null) {
  try {
    if (key) sessionStorage.setItem(FALLBACK_KEY, key);
    else {
      sessionStorage.removeItem(FALLBACK_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

export async function runAgentJob(opts: {
  agentModel: string;
  user: string;
  revisionNote?: string;
}): Promise<AgentResult> {
  const key = getKey();
  if (!key) {
    throw new Error(
      "Connect your own Pollen first (top of page). Agent jobs are billed to your balance.",
    );
  }

  const messages: { role: string; content: string }[] = [
    { role: "user", content: opts.user },
  ];
  if (opts.revisionNote?.trim()) {
    messages.push({
      role: "user",
      content: `Owner revision note — rewrite the draft accordingly:\n${opts.revisionNote.trim()}`,
    });
  }

  const res = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: opts.agentModel,
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pollinations ${res.status}: ${body.slice(0, 280)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Pollinations agent");
  return {
    text,
    model: data?.model ?? opts.agentModel,
    usage: data?.usage,
  };
}

export async function renderSign(prompt: string): Promise<string> {
  const key = getKey();
  if (!key) throw new Error("Connect your own Pollen first to mint images.");
  const res = await fetch("https://gen.pollinations.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      prompt,
      model: "black-forest-labs/flux.1-schnell",
      size: "1024x1024",
      response_format: "url",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pollinations ${res.status}: ${body.slice(0, 280)}`);
  }
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("No image returned");
  return url;
}
