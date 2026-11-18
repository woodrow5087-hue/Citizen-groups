import { useCallback, useEffect, useRef, useState } from "react";
import { BrandHeader } from "../../components/BrandHeader";
import { TabBar } from "../../components/TabBar";
import { GroupTabs } from "../../components/GroupTabs";
import { PrimaryPill } from "../../components/PrimaryPill";
import { ActionSheet } from "../../components/ActionSheet";
import { ActionTile } from "../../components/ActionTile";
import { Icon } from "../../components/Icon";
import { GrowScreen } from "../../screens/GrowScreen";
import { useBible } from "../bible/useBible";
import type { VersePreview } from "../bible/BibleReader";
import { today, type Step } from "../../state/storage";
import type { GroupTab, Screen } from "../../screens/types";
import type { BetaClient } from "./client";
import type { BetaRepository } from "./repository";
import type { Meeting, Profile } from "./types";
import { useGroups } from "./useGroups";
import { LiveFeed, memberName, type RunAction } from "./LiveFeed";
import { LivePrayer } from "./LivePrayer";
import { LiveMeetings } from "./LiveMeetings";
import { MeetingForm } from "./MeetingForm";
type Sheet =
  | "post"
  | "prayer"
  | "prayers"
  | "meeting"
  | "guide"
  | "privacy"
  | "checkin"
  | "verse"
  | null;
export default function LiveApp({
  client,
  repository,
  userId,
  profile: initialProfile,
}: {
  client: BetaClient;
  repository: BetaRepository;
  userId: string;
  profile: Profile;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [screen, setScreen] = useState<Screen>("today");
  const [tab, setTab] = useState<GroupTab>("feed");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Meeting | undefined>();
  const [preview, setPreview] = useState<VersePreview | null>(null);
  const [day, setDay] = useState(today);
  const [steps, setSteps] = useState({
    connect: false,
    reflect: false,
    pray: false,
  });
  const [name, setName] = useState(profile.display_name);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const main = useRef<HTMLElement>(null);
  const groups = useGroups(repository);
  const snapshot = groups.snapshot;
  const bible = useBible(`citizen-groups-bible-v05:beta:${userId}`);
  const leader =
    snapshot?.memberships.some(
      (m) => m.user_id === userId && m.role === "leader",
    ) ?? false;
  const close = useCallback(() => {
    setSheet(null);
    setDraft("");
    setError("");
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      const next = today();
      setDay((current) => {
        if (current !== next)
          setSteps({ connect: false, reflect: false, pray: false });
        return next;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    setGroupName(snapshot?.group.name ?? "");
    setDescription(snapshot?.group.description ?? "");
  }, [snapshot?.group.id, snapshot?.group.name, snapshot?.group.description]);
  function page(next: Screen) {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "instant" });
    main.current?.focus({ preventScroll: true });
  }
  function group(next: GroupTab) {
    setTab(next);
    page("group");
  }
  function open(next: Sheet) {
    setError("");
    setDraft("");
    setSheet(next);
  }
  const run: RunAction = async (
    work,
    message = "Change saved for your group.",
  ) => {
    setBusy(true);
    setError("");
    try {
      await work();
      setNotice(message);
      await groups.refresh();
      return true;
    } catch {
      setError(
        "The change could not be confirmed. Check your access and connection; refresh before retrying.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  };
  async function compose(e: React.FormEvent) {
    e.preventDefault();
    if (!snapshot || !draft.trim()) return;
    const prayer = sheet === "prayer";
    const ok = await run(
      () =>
        prayer
          ? repository.createPrayer(snapshot.group.id, draft)
          : repository.createPost(snapshot.group.id, draft),
      prayer
        ? "Prayer request shared with your group."
        : "Post shared with your group.",
    );
    if (ok) {
      if (!prayer) setSteps((s) => ({ ...s, reflect: true }));
      close();
    }
  }
  function step(id: Step) {
    if (id === "connect") open("checkin");
    else if (id === "reflect") open("post");
    else open("prayers");
  }
  async function signOut() {
    setBusy(true);
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) {
      setError(
        "Sign-out could not finish. Check your connection and try again.",
      );
      setBusy(false);
    }
  }
  const titles: Record<Exclude<Sheet, null>, string> = {
    post: "Share with your group",
    prayer: "Add a shared prayer request",
    prayers: "Your group prayer circle",
    meeting: editing ? "Edit gathering" : "Create gathering",
    guide: "Discussion guide",
    privacy: "Private beta & privacy",
    checkin: "A personal check-in",
    verse: "My Group · Preview only",
  };
  const groupPicker = (
    <div className="live-group-picker">
      <label htmlFor="live-group">Your groups</label>
      <select
        id="live-group"
        disabled={busy || groups.loading || !!sheet}
        value={groups.selected}
        onChange={(e) => {
          setError("");
          groups.choose(e.target.value);
        }}
      >
        {groups.groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      <button
        className="text-link"
        disabled={busy || groups.loading}
        onClick={() => void groups.refresh()}
      >
        Refresh
      </button>
    </div>
  );
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="mode-banner">
        Connected beta · Group actions are shared
      </div>
      <div className="app-shell" inert={sheet !== null}>
        <BrandHeader
          initials={profile.display_name
            .split(/\s+/)
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
          messageLabel="Beta privacy information"
          onMessages={() => open("privacy")}
          onProfile={() => page("you")}
        />
        <p role="status" className="beta-status">
          {notice}
        </p>
        {error && (
          <p className="warning" role="alert">
            {error}
          </p>
        )}
        <main id="main" tabIndex={-1} ref={main}>
          {screen === "grow" ? (
            <GrowScreen
              done={Object.values(steps).filter(Boolean).length}
              bible={bible}
              day={day}
              onStep={(id) => {
                if (id === "connect" || snapshot) step(id);
                else setError("You need an assigned group before sharing.");
              }}
              onGuide={() => open("guide")}
              onPreview={(p) => {
                setPreview(p);
                open("verse");
              }}
            />
          ) : screen === "you" ? (
            <section className="compact-screen">
              <div className="screen-heading">
                <p className="eyebrow">Your beta account</p>
                <h1>
                  {profile.display_name}
                  <span className="accent">.</span>
                </h1>
                <p>
                  Connected · Personal Bible reflections stay on this device.
                </p>
              </div>
              <form
                className="beta-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(
                    () => repository.renameProfile(userId, name),
                    "Display name saved.",
                  ).then((ok) => {
                    if (ok)
                      setProfile((p) => ({ ...p, display_name: name.trim() }));
                  });
                }}
              >
                <label htmlFor="display-name">Your display name</label>
                <input
                  id="display-name"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <PrimaryPill
                  secondary
                  disabled={busy || !name.trim()}
                  type="submit"
                >
                  Save display name
                </PrimaryPill>
              </form>
              <button className="resource-card" onClick={() => open("privacy")}>
                <Icon name="info" />
                <span>
                  <strong>Privacy & beta information</strong>
                  <small>What is shared and what stays local</small>
                </span>
              </button>
              {leader && (
                <button className="resource-card" onClick={() => page("lead")}>
                  <Icon name="lead" />
                  <span>
                    <strong>Leader tools</strong>
                    <small>
                      {snapshot?.group.name} · Gatherings and membership
                    </small>
                  </span>
                </button>
              )}
              <PrimaryPill
                secondary
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      "Clear your personal Bible reflections and reading settings on this device?",
                    )
                  ) {
                    const message = bible.reset();
                    setNotice(
                      message || "Personal Bible data cleared on this device.",
                    );
                  }
                }}
              >
                Clear this account’s local Bible data
              </PrimaryPill>
              <PrimaryPill disabled={busy} onClick={() => void signOut()}>
                Sign out
              </PrimaryPill>
            </section>
          ) : (
            <>
              {groups.groups.length > 0 && groupPicker}
              {groups.error && (
                <div className="warning" role="alert">
                  <p>{groups.error}</p>
                  <PrimaryPill
                    secondary
                    disabled={groups.loading}
                    onClick={() => void groups.refresh()}
                  >
                    Retry group access
                  </PrimaryPill>
                </div>
              )}
              {groups.loading && !snapshot && (
                <p role="status">Loading your groups…</p>
              )}
              {!groups.loading && !groups.error && !snapshot && (
                <p className="privacy-note">
                  No groups are assigned to this account. Ask your beta
                  administrator. You can still use Grow and your local Bible
                  reflections.
                </p>
              )}
              {snapshot && (
                <>
                  {screen === "today" ? (
                    <section className="screen active compact-screen compact-today">
                      <div className="intro">
                        <p className="eyebrow">
                          <span className="red-rule" />
                          Your community, today
                        </p>
                        <h1>
                          Hey, {profile.display_name.split(" ")[0]}
                          <span className="accent">.</span>
                        </h1>
                        <p>{snapshot.group.name}</p>
                      </div>
                      <button
                        className="group-hero live-group-hero"
                        onClick={() => group("feed")}
                      >
                        <span className="section-chip">YOUR CIRCLE</span>
                        <strong className="hero-title">
                          {snapshot.group.name}
                        </strong>
                        <span className="member-label">
                          {snapshot.memberships.length} group members · Open
                          feed →
                        </span>
                      </button>
                      <div className="compact-inline-head">
                        <h2>Keep connected</h2>
                      </div>
                      <div className="action-grid">
                        <ActionTile
                          title="Check in"
                          subtitle="Personal reminder"
                          icon="check"
                          primary
                          completed={steps.connect}
                          onClick={() => step("connect")}
                        />
                        <ActionTile
                          title="Share"
                          subtitle="With your group"
                          icon="message"
                          onClick={() => step("reflect")}
                        />
                        <ActionTile
                          title="Pray"
                          subtitle="Group requests"
                          icon="prayer"
                          onClick={() => step("pray")}
                        />
                      </div>
                      <div className="compact-inline-head">
                        <h2>Coming up</h2>
                        <button
                          className="text-link"
                          onClick={() => group("plan")}
                        >
                          See details →
                        </button>
                      </div>
                      {snapshot.meetings
                        .filter((m) => Date.parse(m.starts_at) >= Date.now())
                        .slice(0, 1)
                        .map((m) => (
                          <button
                            className="event-card"
                            key={m.id}
                            onClick={() => group("plan")}
                          >
                            <span className="event-date">
                              <span>
                                {new Date(m.starts_at).toLocaleDateString([], {
                                  weekday: "short",
                                })}
                              </span>
                              <strong>{new Date(m.starts_at).getDate()}</strong>
                              <span>
                                {new Date(m.starts_at).toLocaleDateString([], {
                                  month: "short",
                                })}
                              </span>
                            </span>
                            <span className="event-main">
                              <strong>{m.title}</strong>
                              <span>
                                {new Date(m.starts_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                · {m.location || "Location to follow"}
                              </span>
                            </span>
                            <Icon name="chevron" />
                          </button>
                        ))}
                      {!snapshot.meetings.some(
                        (m) => Date.parse(m.starts_at) >= Date.now(),
                      ) && (
                        <p className="privacy-note">
                          No upcoming gathering scheduled.
                        </p>
                      )}
                      <div className="compact-inline-head">
                        <h2>From your circle</h2>
                        <button
                          className="text-link"
                          onClick={() => group("feed")}
                        >
                          Go to feed →
                        </button>
                      </div>
                      {snapshot.posts[0] ? (
                        <button
                          className="compose"
                          onClick={() => group("feed")}
                        >
                          <span>
                            <strong>
                              {memberName(
                                snapshot,
                                snapshot.posts[0].author_id,
                              )}
                            </strong>
                            <span className="live-excerpt">
                              {snapshot.posts[0].body}
                            </span>
                          </span>
                          <Icon name="chevron" />
                        </button>
                      ) : (
                        <p className="privacy-note">
                          No posts yet. Share something with your group.
                        </p>
                      )}
                    </section>
                  ) : screen === "lead" ? (
                    <section className="screen active">
                      <button className="text-link" onClick={() => page("you")}>
                        ← Back to You
                      </button>
                      <div className="screen-heading">
                        <p className="eyebrow">Leader workspace</p>
                        <h1>Lead with care.</h1>
                        <p>{snapshot.group.name}</p>
                      </div>
                      {!leader ? (
                        <p role="alert">
                          Leader access is required for this group.
                        </p>
                      ) : (
                        <>
                          <form
                            className="beta-form"
                            onSubmit={(e) => {
                              e.preventDefault();
                              void run(
                                () =>
                                  repository.updateGroup(
                                    snapshot.group.id,
                                    groupName,
                                    description,
                                  ),
                                "Group details updated.",
                              );
                            }}
                          >
                            <label htmlFor="group-name">Group name</label>
                            <input
                              id="group-name"
                              maxLength={100}
                              required
                              value={groupName}
                              onChange={(e) => setGroupName(e.target.value)}
                            />
                            <label htmlFor="group-description">
                              Group description
                            </label>
                            <textarea
                              id="group-description"
                              maxLength={2000}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                            <PrimaryPill
                              secondary
                              type="submit"
                              disabled={busy}
                            >
                              Save group details
                            </PrimaryPill>
                          </form>
                          <button
                            className="resource-card"
                            onClick={() => {
                              setEditing(undefined);
                              open("meeting");
                            }}
                          >
                            <Icon name="calendar" />
                            <span>
                              <strong>Create gathering</strong>
                              <small>Visible to this group</small>
                            </span>
                          </button>
                          <h2>Members</h2>
                          {snapshot.memberships.map((m) => (
                            <div className="person-row" key={m.user_id}>
                              <span>
                                <strong>
                                  {memberName(snapshot, m.user_id)}
                                </strong>
                                <small>{m.role}</small>
                              </span>
                              {m.role === "member" && (
                                <button
                                  className="text-link"
                                  disabled={busy}
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Remove ${memberName(snapshot, m.user_id)} from this group? They will lose access to its shared content.`,
                                      )
                                    )
                                      void run(
                                        () =>
                                          repository.removeMember(
                                            snapshot.group.id,
                                            m.user_id,
                                          ),
                                        "Member removed from the group.",
                                      );
                                  }}
                                >
                                  Remove member
                                </button>
                              )}
                            </div>
                          ))}
                          <p className="privacy-note">
                            Only the beta administrator can invite members or
                            change roles. Leaders cannot remove or demote other
                            leaders. Private Bible reflections are not available
                            to leaders.
                          </p>
                        </>
                      )}
                    </section>
                  ) : (
                    <section className="screen active compact-group">
                      <div className="screen-heading">
                        <p className="eyebrow">
                          <span className="red-rule" />
                          Your group
                        </p>
                        <h1>
                          My Group<span className="accent">.</span>
                        </h1>
                        <p>
                          {snapshot.group.name} · {snapshot.memberships.length}{" "}
                          members
                        </p>
                      </div>
                      <GroupTabs selected={tab} onSelect={setTab} />
                      <div
                        role="tabpanel"
                        id={`panel-${tab}`}
                        aria-labelledby={`tab-${tab}`}
                        tabIndex={0}
                      >
                        {tab === "feed" ? (
                          <LiveFeed
                            snapshot={snapshot}
                            userId={userId}
                            repository={repository}
                            run={run}
                            busy={busy}
                            onCompose={() => open("post")}
                          />
                        ) : tab === "people" ? (
                          <>
                            <div className="people-list">
                              {snapshot.memberships.map((m) => (
                                <div className="person-row" key={m.user_id}>
                                  <span className="avatar small">
                                    {memberName(snapshot, m.user_id)
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </span>
                                  <span>
                                    <strong>
                                      {memberName(snapshot, m.user_id)}
                                    </strong>
                                    <small>{m.role}</small>
                                  </span>
                                </div>
                              ))}
                            </div>
                            <p className="privacy-note">
                              Group membership and invitations are managed by
                              your beta administrator. Leaders can remove
                              ordinary members.
                            </p>
                          </>
                        ) : tab === "plan" ? (
                          <LiveMeetings
                            snapshot={snapshot}
                            userId={userId}
                            repository={repository}
                            run={run}
                            busy={busy}
                            leader={leader}
                            onEdit={(m) => {
                              setEditing(m);
                              open("meeting");
                            }}
                          />
                        ) : (
                          <>
                            <button
                              className="resource-card"
                              onClick={() => open("guide")}
                            >
                              <Icon name="guide" />
                              <span>
                                <strong>Discussion guide</strong>
                                <small>
                                  Original sample prompts for this beta
                                </small>
                              </span>
                            </button>
                            <button
                              className="resource-card"
                              onClick={() => open("prayers")}
                            >
                              <Icon name="prayer" />
                              <span>
                                <strong>Group prayer requests</strong>
                                <small>
                                  Shared only with authorized members
                                </small>
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}
            </>
          )}
          {screen !== "grow" && screen !== "you" && (
            <p className="live-refresh-note">
              {groups.loading
                ? "Refreshing…"
                : groups.updated
                  ? `Last refreshed ${groups.updated} · Checks every 15 seconds while visible`
                  : ""}
            </p>
          )}
        </main>
      </div>
      <TabBar screen={screen} onNavigate={page} inert={sheet !== null} />
      {sheet && (
        <ActionSheet
          title={titles[sheet]}
          onClose={() => {
            if (!busy) close();
          }}
        >
          {error && (
            <p className="warning" role="alert">
              {error}
            </p>
          )}
          {sheet === "post" || sheet === "prayer" ? (
            <form className="beta-form" onSubmit={(e) => void compose(e)}>
              <p>
                This will be shared with authorized members of{" "}
                <strong>{snapshot?.group.name}</strong>. It is not a demo
                action. Share personal details only with consent.
              </p>
              <label htmlFor="shared-body">
                {sheet === "post" ? "Group post" : "Shared prayer request"}
              </label>
              <textarea
                id="shared-body"
                required
                maxLength={sheet === "post" ? 600 : 400}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <PrimaryPill type="submit" disabled={busy || !draft.trim()}>
                {busy
                  ? "Saving…"
                  : sheet === "post"
                    ? "Post to group"
                    : "Share prayer request"}
              </PrimaryPill>
            </form>
          ) : sheet === "prayers" && snapshot ? (
            <LivePrayer
              snapshot={snapshot}
              userId={userId}
              repository={repository}
              busy={busy}
              run={async (...args) => {
                const ok = await run(...args);
                if (ok) setSteps((s) => ({ ...s, pray: true }));
                return ok;
              }}
              onCompose={() => open("prayer")}
            />
          ) : sheet === "meeting" && snapshot ? (
            <MeetingForm
              initial={editing}
              busy={busy}
              onSave={async (m) => {
                const ok = await run(
                  () =>
                    repository.saveMeeting(snapshot.group.id, m, editing?.id),
                  "Gathering saved for this group.",
                );
                if (ok) close();
                return ok;
              }}
            />
          ) : sheet === "checkin" ? (
            <>
              <p>
                A personal reminder to reach out to someone. This does not send
                a message or store care information in the group.
              </p>
              <PrimaryPill
                onClick={() => {
                  setSteps((s) => ({ ...s, connect: true }));
                  close();
                }}
              >
                I reached out
              </PrimaryPill>
            </>
          ) : sheet === "guide" ? (
            <>
              <p>
                <strong>Romans 12:9–13 · A place to belong</strong>
              </p>
              <p>
                When did you last feel truly welcomed? What does sincere love
                look like in ordinary relationships?
              </p>
              <p>
                How can this group notice people on the outside? Name one
                practical way to show hospitality this week.
              </p>
              <p className="privacy-note">
                Original sample discussion prompts, not official church
                curriculum.
              </p>
              <PrimaryPill secondary onClick={close}>
                Close guide
              </PrimaryPill>
            </>
          ) : sheet === "verse" ? (
            <>
              <p className="safe-note">
                <strong>Preview only.</strong> Nothing is posted or delivered to
                your group. Personal reflections are never included.
              </p>
              <article className="verse-preview">
                <span className="eyebrow">
                  {snapshot?.group.name ?? "My Group"}
                </span>
                <h3>{preview?.reference}</h3>
                <blockquote>{preview?.text}</blockquote>
                <p>World English Bible (WEBP) · Public domain · eBible.org</p>
              </article>
              <PrimaryPill secondary onClick={close}>
                Close preview
              </PrimaryPill>
            </>
          ) : (
            <>
              <p>
                You are in the connected private beta. Posts, comments, prayer
                requests and RSVPs are shared with authorized group members and
                stored in Supabase. Only their authors can delete posts,
                comments or requests. Deleting a post also deletes its comments.
              </p>
              <p>
                Use a private device. Personal Bible reflections stay in this
                browser under your account’s local key; they are unencrypted and
                never sent to Supabase or group leaders. No demo data is
                imported.
              </p>
              <p>
                Check-ins are personal reminders for this session. Leaders can
                manage their group’s gatherings and remove ordinary members, but
                cannot invite or promote accounts. Contact your beta
                administrator for access or data-removal questions.
              </p>
              <p>
                Branding remains provisional, pending church approval. No direct
                messaging is implemented.
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
