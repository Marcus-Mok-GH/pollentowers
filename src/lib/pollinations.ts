/**
 * Pollinations client.
 *
 * - Keyless: text generation works anonymously (rate-limited).
 * - With Pollen (BYOP): the visitor connects their own Pollen via the
 *   <polli-connect> drop-in (BRING_YOUR_OWN_POLLEN.md) or pastes an sk_ key.
 *   Their key is used for all calls, so the tower never pays for them.
 */

const KEY_STORAGE = "pollentowers.pollen_key";

export function getKey(): string | null {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? sessionStorage.getItem("connect.apiKey");
  } catch {
    return null;
  }
}

export function setKey(key: string | null) {
  if (key) localStorage.setItem(KEY_STORAGE, key);
  else localStorage.removeItem(KEY_STORAGE);
}

export async function runAgentJob(opts: { system: string; user: string }): Promise<{ text: string }> {
  const key = getKey();
  const model = "openai/gpt-5.4-nano";

  if (key) {
    const res = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Pollinations ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from Pollinations");
    return { text };
  }

  // Anonymous — the classic endpoint (text.pollinations.ai) answers keyless,
  // so the agent desk works before anyone connects Pollen. Free tier allows
  // one reply every 30 seconds per IP.
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai-fast",
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });
  if (res.status === 402) {
    throw new Error(
      "Free tier: one reply every 30 seconds per IP. Wait a moment and run it again — or connect a Pollen key at the top of the page to lift the limit.",
    );
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pollinations ${res.status}: ${body.slice(0, 200)}`);
  }
  const text = (await res.text()).trim();
  if (!text) throw new Error("Empty response from Pollinations");
  return { text };
}


/** Floor-sign image generation — costs Pollen, so it needs a connected key. */
export async function renderSign(prompt: string): Promise<string> {
  const key = getKey();
  if (!key) throw new Error("Connect your own Pollen first (top of page) to mint images.");
  const res = await fetch("https://gen.pollinations.ai/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      prompt,
      model: "black-forest-labs/flux.1-schnell",
      size: "1024x1024",
      response_format: "url",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pollinations ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("No image returned");
  return url;
}
