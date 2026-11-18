import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import {
  createFixtures,
  localClient,
  checked,
  mailFor,
} from "../../scripts/beta-fixtures.mjs";
const f = await createFixtures();
let post, comment, prayer, meeting;
after(async () => {
  for (const account of [f.a, f.b, f.leader, f.outsider])
    await account.client.auth.signOut({ scope: "local" });
});

test("anonymous visitors cannot access any private table", async () => {
  const anon = localClient(f.config);
  for (const table of [
    "profiles",
    "groups",
    "memberships",
    "posts",
    "comments",
    "prayer_requests",
    "prayer_acknowledgements",
    "meetings",
    "rsvps",
  ]) {
    const result = await anon.from(table).select("*");
    assert.ok(result.error, table);
    assert.equal(result.data, null, table);
  }
});
test("Auth rejects public signup and admin invitations lacking backend admission", async () => {
  const anon = localClient(f.config);
  const signup = await anon.auth.signUp({
    email: `not-invited-${Date.now()}@example.test`,
    password: "Fictional-test-password-For-Local-Only-1",
  });
  assert.ok(signup.error);
  const invitation = await f.admin.auth.admin.inviteUserByEmail(
    `no-db-invite-${Date.now()}@example.test`,
  );
  assert.ok(invitation.error);
});
test("the backend, not metadata, assigns membership and prevents escalation", async () => {
  checked(
    await f.a.client.auth.updateUser({
      data: { role: "leader", beta_enabled: true },
    }),
  );
  const rows = checked(await f.a.client.from("memberships").select("*"));
  assert.ok(rows.every((m) => m.group_id === f.groupA.id));
  assert.equal(rows.find((m) => m.user_id === f.a.id).role, "member");
  assert.ok(
    (
      await f.a.client
        .from("memberships")
        .update({ role: "leader" })
        .eq("user_id", f.a.id)
    ).error,
  );
  assert.ok(
    (
      await f.a.client.rpc("provision_beta_invitation", {
        p_email: "intruder@example.test",
        p_group: f.groupA.id,
        p_display_name: "Intruder",
        p_role: "leader",
      })
    ).error,
  );
});
test("two authenticated accounts share posts and comments across independent sessions", async () => {
  post = checked(
    await f.a.client
      .from("posts")
      .insert({ group_id: f.groupA.id, body: "Fictional cross-device post" })
      .select("id")
      .single(),
  );
  const visible = checked(
    await f.b.client.from("posts").select("*").eq("id", post.id),
  );
  assert.equal(visible[0].body, "Fictional cross-device post");
  comment = checked(
    await f.b.client
      .from("comments")
      .insert({
        group_id: f.groupA.id,
        post_id: post.id,
        body: "Fictional comment from second account",
      })
      .select("id")
      .single(),
  );
  assert.equal(
    checked(
      await f.a.client.from("comments").select("*").eq("id", comment.id),
    )[0].author_id,
    f.b.id,
  );
});
test("unrelated authenticated account cannot read or write the other group", async () => {
  for (const table of [
    "posts",
    "comments",
    "prayer_requests",
    "meetings",
    "rsvps",
    "memberships",
  ])
    assert.deepEqual(
      checked(
        await f.outsider.client
          .from(table)
          .select("*")
          .eq("group_id", f.groupA.id),
      ),
      [],
    );
  assert.deepEqual(
    checked(
      await f.outsider.client.from("groups").select("*").eq("id", f.groupA.id),
    ),
    [],
  );
  assert.ok(
    (
      await f.outsider.client
        .from("posts")
        .insert({ group_id: f.groupA.id, body: "Forbidden" })
    ).error,
  );
});
test("members cannot change another profile or delete another author content", async () => {
  assert.deepEqual(
    checked(
      await f.a.client
        .from("profiles")
        .update({ display_name: "Hijacked" })
        .eq("id", f.b.id)
        .select("id"),
    ),
    [],
  );
  assert.deepEqual(
    checked(
      await f.b.client.from("posts").delete().eq("id", post.id).select("id"),
    ),
    [],
  );
  assert.deepEqual(
    checked(
      await f.a.client
        .from("comments")
        .delete()
        .eq("id", comment.id)
        .select("id"),
    ),
    [],
  );
  assert.ok(
    (
      await f.a.client
        .from("profiles")
        .update({ beta_enabled: true })
        .eq("id", f.a.id)
    ).error,
  );
});
test("group prayers and acknowledgements persist while request deletion stays author-only", async () => {
  prayer = checked(
    await f.a.client
      .from("prayer_requests")
      .insert({ group_id: f.groupA.id, body: "Fictional private-group prayer" })
      .select("id")
      .single(),
  );
  assert.equal(
    checked(
      await f.b.client.from("prayer_requests").select("*").eq("id", prayer.id),
    )[0].body,
    "Fictional private-group prayer",
  );
  checked(
    await f.b.client
      .from("prayer_acknowledgements")
      .insert({ group_id: f.groupA.id, request_id: prayer.id }),
  );
  assert.equal(
    checked(
      await f.a.client
        .from("prayer_acknowledgements")
        .select("*")
        .eq("request_id", prayer.id),
    )[0].user_id,
    f.b.id,
  );
  assert.deepEqual(
    checked(
      await f.b.client
        .from("prayer_requests")
        .delete()
        .eq("id", prayer.id)
        .select("id"),
    ),
    [],
  );
  assert.ok(
    (
      await f.outsider.client
        .from("prayer_acknowledgements")
        .insert({ group_id: f.groupA.id, request_id: prayer.id })
    ).error,
  );
});
test("leaders manage gatherings and members share durable RSVPs without editing each other", async () => {
  const input = {
    group_id: f.groupA.id,
    title: "Fictional beta gathering",
    starts_at: new Date(Date.now() + 86400000).toISOString(),
    location: "Fictional location",
  };
  assert.ok((await f.a.client.from("meetings").insert(input)).error);
  meeting = checked(
    await f.leader.client.from("meetings").insert(input).select("id").single(),
  );
  checked(
    await f.leader.client
      .from("meetings")
      .update({ title: "Fictional updated gathering" })
      .eq("id", meeting.id),
  );
  assert.equal(
    checked(
      await f.a.client.from("meetings").select("*").eq("id", meeting.id),
    )[0].title,
    "Fictional updated gathering",
  );
  checked(
    await f.b.client.rpc("set_rsvp", {
      p_meeting: meeting.id,
      p_status: "going",
    }),
  );
  assert.equal(
    checked(
      await f.a.client.from("rsvps").select("*").eq("meeting_id", meeting.id),
    )[0].user_id,
    f.b.id,
  );
  assert.deepEqual(
    checked(
      await f.a.client
        .from("rsvps")
        .update({ status: "not_going" })
        .eq("meeting_id", meeting.id)
        .eq("user_id", f.b.id)
        .select("user_id"),
    ),
    [],
  );
  assert.ok(
    (
      await f.outsider.client.rpc("set_rsvp", {
        p_meeting: meeting.id,
        p_status: "going",
      })
    ).error,
  );
  checked(
    await f.b.client.rpc("set_rsvp", {
      p_meeting: meeting.id,
      p_status: "not_going",
    }),
  );
  assert.equal(
    checked(
      await f.a.client.from("rsvps").select("*").eq("meeting_id", meeting.id),
    )[0].status,
    "not_going",
  );
});
test("authors can delete own comments, prayers and posts; dependent acknowledgements disappear", async () => {
  checked(await f.b.client.from("comments").delete().eq("id", comment.id));
  checked(
    await f.a.client.from("prayer_requests").delete().eq("id", prayer.id),
  );
  assert.deepEqual(
    checked(
      await f.b.client
        .from("prayer_acknowledgements")
        .select("*")
        .eq("request_id", prayer.id),
    ),
    [],
  );
  checked(await f.a.client.from("posts").delete().eq("id", post.id));
  assert.deepEqual(
    checked(await f.b.client.from("posts").select("*").eq("id", post.id)),
    [],
  );
});
test("email OTP works, sessions restore, and sign-out revokes old JWT data access", async () => {
  checked(
    await f.a.client.auth.signInWithOtp({
      email: f.a.email,
      options: { shouldCreateUser: false },
    }),
  );
  const message = await mailFor(f.a.email, "sign-in");
  const code = message.HTML?.match(/<strong>([0-9]{6})<\/strong>/)?.[1];
  assert.ok(code, "actual local email contains the one-time code");
  const device = localClient(f.config);
  checked(
    await device.auth.verifyOtp({
      email: f.a.email,
      token: code,
      type: "email",
    }),
  );
  const { session } = checked(await device.auth.getSession());
  const map = new Map();
  const storage = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
  const persisted = createClient(f.config.url, f.config.anonKey, {
    auth: {
      storage,
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "beta-test-restore",
    },
  });
  checked(await persisted.auth.setSession(session));
  const restored = createClient(f.config.url, f.config.anonKey, {
    auth: {
      storage,
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "beta-test-restore",
    },
  });
  assert.equal(checked(await restored.auth.getUser()).user.id, f.a.id);
  const { session: old } = checked(await f.a.client.auth.getSession());
  checked(await f.a.client.auth.signOut({ scope: "local" }));
  const oldClient = createClient(f.config.url, f.config.anonKey, {
    global: { headers: { Authorization: `Bearer ${old.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  assert.deepEqual(
    checked(await oldClient.from("groups").select("*")),
    [],
    "signed-out JWT cannot read group data",
  );
  assert.ok(
    checked(await device.from("groups").select("*")).some(
      (g) => g.id === f.groupA.id,
    ),
    "independent device session remains authorized",
  );
  await restored.auth.signOut({ scope: "local" });
});
