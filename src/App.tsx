import { useEffect, useState } from "react";
import TowerScene from "./tower/TowerScene";
import Directory from "./views/Directory";
import Office from "./views/Office";
import { bySlug } from "./data/companies";
import { getKey, setKey } from "./lib/pollinations";

type View = { name: "tower" } | { name: "directory" } | { name: "office"; slug: string };

export default function App() {
  const [view, setView] = useState<View>({ name: "tower" });
  const [apiKey, setApiKey] = useState<string | null>(getKey());
  const [keyDraft, setKeyDraft] = useState("");

  useEffect(() => {
    const el = document.querySelector("polli-connect") as (HTMLElement & {
      addEventListener(t: string, cb: () => void): void;
    }) | null;
    if (!el) return;
    const onChange = () => setApiKey(getKey());
    el.addEventListener("change", onChange);
    return () => el.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="app">
      <header>
        <div className="brand" onClick={() => setView({ name: "tower" })}>
          <span className="logo" style={{ background: "#22d3ee" }} />
          Pollen<b>towers</b>
          <span className="muted small"> — a tower of AI-run companies</span>
        </div>
        <nav className="tabs">
          <button
            className={view.name === "tower" ? "active" : ""}
            onClick={() => setView({ name: "tower" })}
          >
            3D Tower
          </button>
          <button
            className={view.name === "directory" ? "active" : ""}
            onClick={() => setView({ name: "directory" })}
          >
            Directory
          </button>
        </nav>
        <div className="pollen">
          {/* BYOP drop-in: works once App Key pk_... is set via VITE_POLLINATIONS_APP_KEY.
              Until then, paste an sk_ key from enter.pollinations.ai/keys */}
          {(import.meta as any).env?.VITE_POLLINATIONS_APP_KEY && (
            /* @ts-expect-error custom element */
            <polli-connect
              app-key={(import.meta as any).env.VITE_POLLINATIONS_APP_KEY}
              budget="10"
              expiry="7"
            />
          )}
          <span className="muted small">{apiKey ? "🌿 Pollen connected" : "🌥️ keyless"}</span>
          {!apiKey && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (keyDraft.trim()) {
                  setKey(keyDraft.trim());
                  setApiKey(keyDraft.trim());
                  setKeyDraft("");
                }
              }}
            >
              <input
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                placeholder="Paste your sk_ Pollen key"
                type="password"
              />
              <button type="submit">Connect</button>
            </form>
          )}
          {apiKey && (
            <button className="ghost" onClick={() => { setKey(null); setApiKey(null); }}>
              Disconnect
            </button>
          )}
        </div>
      </header>

      <main>
        {view.name === "tower" && (
          <div className="tower-wrap">
            <div className="tower-hint">Drag to orbit · scroll to zoom · click a floor to step inside</div>
            <TowerScene
              onEnterFloor={(slug) => {
                setView({ name: "office", slug });
              }}
              showDirectory={() => setView({ name: "directory" })}
            />
          </div>
        )}
        {view.name === "directory" && (
          <Directory onOpen={(slug) => setView({ name: "office", slug })} />
        )}
        {view.name === "office" && (
          <Office
            company={
              bySlug(view.slug) ??
              bySlug("lobby")!
            }
            onBack={() => setView({ name: "tower" })}
          />
        )}
      </main>

      <footer className="muted small">
        Built on Pollinations (quest #17999) · agents run on your own Pollen ·{" "}
        <a href="https://github.com/pollinations/pollinations/issues/17999">quest origin</a>
      </footer>
    </div>
  );
}