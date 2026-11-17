import { useBible } from "./features/bible/useBible";
import type { VersePreview } from "./features/bible/BibleReader";
import { LeadScreen } from "./screens/LeadScreen";
import { TodayScreen } from "./screens/TodayScreen";
import { GroupScreen } from "./screens/GroupScreen";
import { GrowScreen } from "./screens/GrowScreen";
import { YouScreen } from "./screens/YouScreen";
import { BrandHeader } from "./components/BrandHeader";
import { TabBar } from "./components/TabBar";
import { PrimaryPill } from "./components/PrimaryPill";
import { PrayerCircle } from "./components/PrayerCircle";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionSheet } from "./components/ActionSheet";
import {
  initialData,
  loadData,
  saveData,
  today,
  KEY,
  type DemoData,
  type Step,
} from "./state/storage";
import type { GroupTab, Screen } from "./screens/types";
type Dialog =
  | "bibleShare"
  | "inbox"
  | "reply"
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
  bibleShare: "My Group · Demo preview",
  inbox: "Messages",
  reply: "Join the conversation",
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
  const bible = useBible();
  const [versePreview, setVersePreview] = useState<VersePreview | null>(null);
  const [loaded] = useState(loadData);
  const [data, setData] = useState(loaded.data);
  const [warning, setWarning] = useState(loaded.warning);
  const [screen, setScreen] = useState<Screen>("today");
  const [groupTab, setGroupTab] = useState<GroupTab>("feed");
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
    mainRef.current?.focus({ preventScroll: true });
  }
  function open(kind: Dialog) {
    setDraft(kind === "notes" ? data.notes : "");
    setError("");
    setDialog(kind);
  }
  const openPost = () => open("post"),
    openPrayer = () => open("prayer"),
    openGuide = () => open("guide"),
    openInvite = () => open("invite"),
    openNotes = () => open("notes"),
    showAbout = () => open("about"),
    resetDemo = () => open("reset");
  function step(id: Step) {
    if (id === "connect") open("checkin");
    else if (id === "reflect") openPost();
    else {
      open("pray");
    }
  }
  function markStep(id: Step) {
    update((d) => ({ ...d, steps: { ...d.steps, [id]: true } }));
    close();
  }
  function group(tab: GroupTab) {
    setGroupTab(tab);
    page("group");
  }
  function encourage(id: string) {
    update(
      (d) => ({
        ...d,
        encouraged: d.encouraged.includes(id)
          ? d.encouraged.filter((x) => x !== id)
          : [id, ...d.encouraged].slice(0, 14),
      }),
      "Encouragement updated on this device only.",
    );
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
    const bibleWarning = bible.reset();
    if (bibleWarning)
      setWarning((previous) =>
        [previous, bibleWarning].filter(Boolean).join(" "),
      );
    setData(initialData());
    setStatus("Demo reset.");
    close();
  }
  const done = Object.values(data.steps).filter(Boolean).length;
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="app-shell" inert={dialog !== null}>
        <BrandHeader
          onMessages={() => open("inbox")}
          onProfile={() => page("you")}
        />
        {warning && (
          <p className="warning" role="alert">
            {warning}
          </p>
        )}
        <p className="sr-only" role="status">
          {status}
        </p>
        <main id="main" tabIndex={-1} ref={mainRef}>
          {screen === "today" && (
            <TodayScreen
              data={data}
              done={done}
              onGroup={() => group("feed")}
              onPlan={() => group("plan")}
              onStep={step}
              onEncourage={encourage}
              onReply={() => open("reply")}
            />
          )}
          {screen === "group" && (
            <GroupScreen
              data={data}
              tab={groupTab}
              onTab={setGroupTab}
              rsvp={rsvp}
              openGuide={openGuide}
              openPost={openPost}
              openInvite={openInvite}
              onEncourage={encourage}
              onReply={() => open("reply")}
              onConnect={() => open("checkin")}
            />
          )}
          {screen === "grow" && (
            <GrowScreen
              done={done}
              onStep={step}
              onGuide={openGuide}
              bible={bible}
              day={data.day}
              onPreview={(preview) => {
                setVersePreview(preview);
                open("bibleShare");
              }}
            />
          )}
          {screen === "you" && (
            <YouScreen
              data={data}
              onAbout={showAbout}
              onReset={resetDemo}
              onLeader={() => page("lead")}
              onPrayer={() => open("pray")}
            />
          )}
          {screen === "lead" && (
            <>
              <button className="text-link" onClick={() => page("you")}>
                ← Back to You
              </button>
              <LeadScreen
                data={data}
                screen={screen}
                openGuide={openGuide}
                openNotes={openNotes}
                markFollowup={markFollowup}
              />
            </>
          )}
        </main>
      </div>
      <TabBar screen={screen} onNavigate={page} inert={dialog !== null} />
      {dialog && (
        <ActionSheet title={titles[dialog]} onClose={close}>
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
              <PrimaryPill type="submit">
                {dialog === "notes"
                  ? "Save notes locally"
                  : dialog === "post"
                    ? "Post to demo group"
                    : "Save in demo"}
              </PrimaryPill>
            </form>
          ) : dialog === "bibleShare" ? (
            <>
              <p className="safe-note">
                <strong>Local demo preview only.</strong> Nothing is posted to
                My Group or delivered to anyone. Your personal reflection is
                never included.
              </p>
              <article className="verse-preview">
                <span className="eyebrow">Wednesday Group · Fictional</span>
                <h3>{versePreview?.reference}</h3>
                <blockquote>{versePreview?.text}</blockquote>
                <p>World English Bible (WEBP) · Public domain · eBible.org</p>
              </article>
              <PrimaryPill secondary onClick={close}>
                Close preview
              </PrimaryPill>
            </>
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
              <PrimaryPill onClick={() => markStep("connect")}>
                I reached out
              </PrimaryPill>
            </>
          ) : dialog === "pray" ? (
            <PrayerCircle
              data={data}
              onPray={prayFor}
              onRequest={openPrayer}
              onComplete={() => markStep("pray")}
            />
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
              <PrimaryPill secondary onClick={close}>
                Close guide
              </PrimaryPill>
            </>
          ) : dialog === "inbox" ? (
            <>
              <p>
                No real messages or notifications exist in this concept. Nothing
                is sent or received.
              </p>
              <PrimaryPill secondary onClick={close}>
                Close
              </PrimaryPill>
            </>
          ) : dialog === "reply" ? (
            <>
              <p>
                Threaded replies need shared accounts and permissions. You can
                add a standalone local thought with Share.
              </p>
              <PrimaryPill onClick={openPost}>Share a thought</PrimaryPill>
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
              <PrimaryPill secondary onClick={close}>
                Got it
              </PrimaryPill>
            </>
          ) : dialog === "reset" ? (
            <>
              <p>
                Clear your local demo entries, notes, Bible reflections, reading
                progress and settings? This cannot be undone.
              </p>
              <div className="actionrow">
                <PrimaryPill secondary onClick={close}>
                  Cancel
                </PrimaryPill>
                <PrimaryPill onClick={reset}>Clear local demo</PrimaryPill>
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
                The user-supplied Citizen flag is used for this internal review
                only. Branding and asset rights require church approval before
                public distribution.
              </p>
              <PrimaryPill secondary onClick={close}>
                Close
              </PrimaryPill>
            </>
          )}
        </ActionSheet>
      )}
    </>
  );
}
