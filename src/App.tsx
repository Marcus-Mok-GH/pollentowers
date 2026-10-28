import { useEffect, useState } from "react";
import TowerScene from "./tower/TowerScene";
import Directory from "./views/Directory";
import Office from "./views/Office";
import InboxView from "./views/Inbox";
import { bySlug } from "./data/companies";
import { APP_KEY, getKey, setKey } from "./lib/pollinations";
import { loadInbox } from "./lib/inbox";

type View =
  | { name: "tower" }
  | { name: "directory" }
  | { name: "office"; slug: string }
  | { name: "inbox" };

export default function App() {
  const [view, setView] = useState<View>({ name: "tower" });
  const [apiKey, setApiKey] = useState<string | null>(getKey());
  const [waiting, setWaiting] = useState(
    () => loadInbox().filter((i) => i.status === "waiting").length,
  );

  useEffect(() => {
    const el = document.querySelector("polli-connect") as
      | (HTMLElement & {
          apiKey?: string | null;
          addEventListener(t: string, cb: () => void): void;
          removeEventListener(t: string, cb: () => void): void;
        })
      | null;
    if (!el) return;
    const onChange = () => {
      const key = el.apiKey ?? getKey();
      if (key) setKey(key);
      setApiKey(key);
    };
    el.addEventListener("change", onChange);
    onChange();
    return () => el.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const sync = () =>
      setWaiting(loadInbox().filter((i) => i.status === "waiting").length);
    window.addEventListener("pollentowers-inbox", sync);
    return () => window.removeEventListener("pollentowers-inbox", sync);
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" onClick={() => setView({ name: "tower" })} role="button">
          <span className="logo">◈</span>
          <div>
            <div>
              Pollen<b>towers</b>
            </div>
            <div className="muted small">a tower of AI-run companies</div>
          </div>
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
          <button
            className={view.name === "inbox" ? "active" : ""}
            onClick={() => setView({ name: "inbox" })}
          >
            Decisions{waiting > 0 ? ` (${waiting})` : ""}
          </button>
        </nav>
        <div className="pollen">
          {/* @ts-expect-error custom element from @pollinations/ui */}
          <polli-connect
            app-key={APP_KEY}
            budget="10"
            expiry="7"
            models="text,image,community/Marcus-Mok-GH/pt-lobby,community/Marcus-Mok-GH/pt-northwind,community/Marcus-Mok-GH/pt-emberforge,community/Marcus-Mok-GH/pt-quietloop,community/Marcus-Mok-GH/pt-tidepool,community/Marcus-Mok-GH/pt-lantern,community/Marcus-Mok-GH/pt-harbor,community/Marcus-Mok-GH/pt-copperline,community/Marcus-Mok-GH/pt-orbit,community/Marcus-Mok-GH/pt-fieldnote,community/Marcus-Mok-GH/pt-leasing"
          />
          <span className={`pill ${apiKey ? "on" : ""}`}>
            {apiKey ? "Pollen connected" : "Connect Pollen to run agents"}
          </span>
        </div>
      </header>

      <main>
        {view.name === "tower" && (
          <div className="tower-wrap">
            <div className="tower-hint">
              Drag to orbit · scroll to zoom · use the elevator or click a floor
            </div>
            <TowerScene
              onEnterFloor={(slug) => setView({ name: "office", slug })}
              showDirectory={() => setView({ name: "directory" })}
            />
          </div>
        )}
        {view.name === "directory" && (
          <Directory onOpen={(slug) => setView({ name: "office", slug })} />
        )}
        {view.name === "office" && (
          <Office
            company={bySlug(view.slug) ?? bySlug("lobby")!}
            onBack={() => setView({ name: "tower" })}
            onOpenInbox={() => setView({ name: "inbox" })}
          />
        )}
        {view.name === "inbox" && (
          <InboxView onOpen={(slug) => setView({ name: "office", slug })} />
        )}
      </main>

      <footer className="muted small">
        Built for{" "}
        <a href="https://github.com/pollinations/pollinations/issues/17999">
          Pollinations quest #17999
        </a>{" "}
        · agents run on{" "}
        <a href="https://pollinations.ai/?ref=badge">pollinations.ai</a> · visitors pay with
        their own Pollen
      </footer>
    </div>
  );
}
