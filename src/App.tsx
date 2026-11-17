import { Icon } from "./components/Icon";
import { LeadScreen } from "./screens/LeadScreen";
import { PrayerScreen } from "./screens/PrayerScreen";
import { GroupScreen } from "./screens/GroupScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "./components/Modal";
import {
  initialData,
  loadData,
  saveData,
  today,
  KEY,
  type DemoData,
  type Step,
} from "./state/storage";
import type { Screen } from "./screens/types";
type Dialog =
  | "checkin"
  | "post"
  | "prayer"
  | "pray"
  | "guide"
  | "invite"
  | "notes"
  | "about"
  | "reset";
const titles: Record<Dialog, string> = {
  checkin: "Show up for someone",
  post: "Share a thought",
  prayer: "Add a prayer request",
  pray: "Make space to pray",
  guide: "Discussion guide",
  invite: "Group invitations",
  notes: "Private leader notes",
  about: "About this demo",
  reset: "Reset demo?",
};
export default function App() {
  const [loaded] = useState(loadData);
  const [data, setData] = useState(loaded.data);
  const [warning, setWarning] = useState(loaded.warning);
  const [screen, setScreen] = useState<Screen>("home");
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const mainRef = useRef<HTMLElement>(null);
  const close = useCallback(() => setDialog(null), []);
  function update(
    change: (d: DemoData) => DemoData,
    message = "Demo updated locally.",
  ) {
    const current =
      data.day === today()
        ? data
        : { ...data, day: today(), steps: initialData().steps, prayed: [] };
    const next = change(current);
    setData(next);
    setWarning(saveData(next));
    setStatus(message);
  }
  useEffect(() => {
    const rollover = () =>
      setData((d) =>
        d.day === today()
          ? d
          : { ...d, day: today(), steps: initialData().steps, prayed: [] },
      );
    window.addEventListener("focus", rollover);
    const timer = window.setInterval(rollover, 60000);
    return () => {
      window.removeEventListener("focus", rollover);
      clearInterval(timer);
    };
  }, []);
  function page(name: Screen) {
    setScreen(name);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    mainRef.current?.focus();
  }
  function open(kind: Dialog) {
    setDraft(kind === "notes" ? data.notes : "");
    setError("");
    setDialog(kind);
  }
  const openCheckin = () => open("checkin"),
    openPost = () => open("post"),
    openPrayer = () => open("prayer"),
    openGuide = () => open("guide"),
    openInvite = () => open("invite"),
    openNotes = () => open("notes"),
    showAbout = () => open("about"),
    resetDemo = () => open("reset");
  function step(id: Step) {
    if (id === "connect") openCheckin();
    else if (id === "reflect") openPost();
    else {
      page("prayer");
      open("pray");
    }
  }
  function markStep(id: Step) {
    update((d) => ({ ...d, steps: { ...d.steps, [id]: true } }));
    close();
  }
  function rsvp() {
    update((d) => ({ ...d, rsvp: !d.rsvp }));
  }
  function prayFor(id: string) {
    update((d) => ({
      ...d,
      prayed: d.prayed.includes(id) ? d.prayed : [...d.prayed, id],
      steps: { ...d.steps, pray: true },
    }));
  }
  function markFollowup(id: string) {
    update((d) => ({
      ...d,
      followed: d.followed.includes(id) ? d.followed : [...d.followed, id],
    }));
  }
  function submit() {
    if (dialog !== "notes" && !draft.trim()) {
      setError("Please write something first.");
      return;
    }
    update((d) =>
      dialog === "post"
        ? {
            ...d,
            posts: [draft.trim(), ...d.posts].slice(0, 12),
            steps: { ...d.steps, reflect: true },
          }
        : dialog === "prayer"
          ? {
              ...d,
              prayers: [
                { id: "p" + crypto.randomUUID(), text: draft.trim() },
                ...d.prayers,
              ].slice(0, 12),
            }
          : { ...d, notes: draft },
    );
    close();
  }
  function reset() {
    try {
      localStorage.removeItem(KEY);
      setWarning("");
    } catch {
      setWarning(
        "Demo reset for this session. Browser storage could not be cleared.",
      );
    }
    setData(initialData());
    setStatus("Demo reset.");
    close();
  }
  const done = Object.values(data.steps).filter(Boolean).length;
  return (
    <>
      <div className="brandbar"></div>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="layout" inert={dialog !== null}>
        {warning && (
          <p className="warning" role="alert">
            {warning}
          </p>
        )}
        <p className="sr-only" role="status">
          {status}
        </p>
        <header className="masthead">
          <div className="brand">
            <span className="brand-symbol" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <div className="brand-type">
              <strong>
                citizen<span className="brand-dot">.</span>
              </strong>
              <span>
                GROUPS <span className="concept-label">/ CONCEPT</span>
              </span>
            </div>
          </div>
          <button
            className="profile"
            onClick={showAbout}
            aria-label="About this demo"
          >
            JW
            <span className="profile-dot" />
          </button>
        </header>
        <main id="main" tabIndex={-1} ref={mainRef}>
          <HomeScreen
            data={data}
            done={done}
            screen={screen}
            page={page}
            step={step}
            rsvp={rsvp}
          />
          <GroupScreen
            data={data}
            screen={screen}
            rsvp={rsvp}
            openGuide={openGuide}
            openPost={openPost}
            openInvite={openInvite}
          />
          <PrayerScreen
            data={data}
            screen={screen}
            openPrayer={openPrayer}
            prayFor={prayFor}
          />
          <LeadScreen
            data={data}
            screen={screen}
            openGuide={openGuide}
            openNotes={openNotes}
            markFollowup={markFollowup}
          />
        </main>
        <footer className="footer">
          <span>Unofficial concept · Fictional data · Device only</span>
          <button className="text-button" onClick={resetDemo}>
            Reset demo
          </button>
        </footer>
      </div>
      <nav
        inert={dialog !== null}
        className="tabs"
        aria-label="Main navigation"
      >
        {(
          [
            { id: "home", label: "Home", icon: "home" },
            { id: "group", label: "My Group", icon: "group" },
            { id: "prayer", label: "Prayer", icon: "prayer" },
            { id: "lead", label: "Leader", icon: "lead" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            className={screen === item.id ? "navbutton on" : "navbutton"}
            aria-current={screen === item.id ? "page" : undefined}
            onClick={() => page(item.id)}
          >
            <span className="nav-icon">
              <Icon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      {dialog && (
        <Modal title={titles[dialog]} onClose={close}>
          {(["post", "prayer", "notes"] as Dialog[]).includes(dialog) ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <p>
                Use fictional examples only. Saved in this browser, never shared
                with a group.
              </p>
              <label htmlFor="entry">
                {dialog === "post"
                  ? "Your thought"
                  : dialog === "prayer"
                    ? "Prayer request"
                    : "Planning notes"}
              </label>
              <textarea
                id="entry"
                value={draft}
                maxLength={
                  dialog === "notes" ? 2500 : dialog === "post" ? 600 : 400
                }
                onChange={(e) => setDraft(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? "entry-error" : undefined}
              />
              {error && (
                <p id="entry-error" role="alert">
                  {error}
                </p>
              )}
              <button className="btn" type="submit">
                {dialog === "notes"
                  ? "Save notes locally"
                  : dialog === "post"
                    ? "Post to demo group"
                    : "Save in demo"}
              </button>
            </form>
          ) : dialog === "checkin" ? (
            <>
              <p>
                A text. A phone call. A conversation after church. Think of
                someone you can encourage today.
              </p>
              <p className="safe-note">
                This demo will not message anyone. Marking this step is a
                reminder for yourself.
              </p>
              <button className="btn" onClick={() => markStep("connect")}>
                I reached out
              </button>
            </>
          ) : dialog === "pray" ? (
            <>
              <p>
                Spend a moment praying for someone in your group. Read their
                example requests on the Prayer tab.
              </p>
              <button className="btn" onClick={() => markStep("pray")}>
                Mark prayer time complete
              </button>
            </>
          ) : dialog === "guide" ? (
            <>
              <p>
                <b>Theme:</b> A place to belong.
              </p>
              <div className="safe-note">
                <b>OPEN · 10 MINUTES</b>
                <br />
                When did you last feel truly welcomed?
              </div>
              <p>
                <b>READ · ROMANS 12:9–13</b>
                <br />
                What does sincere love look like in ordinary relationships?
              </p>
              <p>
                <b>DISCUSS</b>
                <br />
                How can our group notice people who might feel on the outside?
              </p>
              <p>
                <b>TAKE ONE STEP</b>
                <br />
                Invite each person to name one concrete way to show hospitality
                this week.
              </p>
              <p className="dim">
                Original sample prompts, not an official church lesson plan.
              </p>
              <button className="btn outline" onClick={close}>
                Close guide
              </button>
            </>
          ) : dialog === "invite" ? (
            <>
              <p>
                Secure invitation links could let someone request to join a
                small group. Leaders could approve requests and manage
                membership.
              </p>
              <p className="safe-note">
                No links are generated. Future invitations need expiry and group
                privacy controls.
              </p>
              <button className="btn outline" onClick={close}>
                Got it
              </button>
            </>
          ) : dialog === "reset" ? (
            <>
              <p>
                Clear your local demo entries, notes, and progress? This cannot
                be undone.
              </p>
              <div className="actionrow">
                <button className="btn outline" onClick={close}>
                  Cancel
                </button>
                <button className="btn" onClick={reset}>
                  Clear local demo
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                Citizen Groups is an unofficial exploratory concept. All people
                and gatherings are fictional. There are no accounts, real
                messages, membership permissions, or church administrative
                access.
              </p>
              <p>
                The text mark and CSS background replace official logo and
                photography. Branding and asset rights need approval before
                distribution.
              </p>
              <button className="btn outline" onClick={close}>
                Close
              </button>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
