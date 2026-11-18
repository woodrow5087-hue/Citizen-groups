import type { BetaClient } from "./client";
import type { GroupSnapshot, Meeting } from "./types";
// RLS is the authority. Client filters narrow payloads but are never authorization controls.
export function betaRepository(client: BetaClient) {
  return {
    async profile(id: string) {
      const { data, error } = await client
        .from("profiles")
        .select("id,display_name,created_at")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async groups() {
      const { data, error } = await client
        .from("groups")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    async snapshot(groupId: string): Promise<GroupSnapshot> {
      const [
        group,
        memberships,
        posts,
        comments,
        prayers,
        acknowledgements,
        meetings,
        rsvps,
      ] = await Promise.all([
        client.from("groups").select("*").eq("id", groupId).maybeSingle(),
        client.from("memberships").select("*").eq("group_id", groupId),
        client
          .from("posts")
          .select("*")
          .eq("group_id", groupId)
          .order("created_at", { ascending: false })
          .limit(50),
        client
          .from("comments")
          .select("*")
          .eq("group_id", groupId)
          .order("created_at", { ascending: false })
          .limit(200),
        client
          .from("prayer_requests")
          .select("*")
          .eq("group_id", groupId)
          .order("created_at", { ascending: false })
          .limit(100),
        client
          .from("prayer_acknowledgements")
          .select("*")
          .eq("group_id", groupId)
          .limit(1000),
        client
          .from("meetings")
          .select("*")
          .eq("group_id", groupId)
          .order("starts_at", { ascending: false })
          .limit(50),
        client.from("rsvps").select("*").eq("group_id", groupId).limit(1000),
      ]);
      for (const result of [
        group,
        memberships,
        posts,
        comments,
        prayers,
        acknowledgements,
        meetings,
        rsvps,
      ])
        if (result.error) throw result.error;
      if (!group.data) throw Error("Membership unavailable");
      const ids = (memberships.data ?? []).map((m) => m.user_id);
      const profiles = ids.length
        ? await client
            .from("profiles")
            .select("id,display_name,created_at")
            .in("id", ids)
        : { data: [], error: null };
      if (profiles.error) throw profiles.error;
      return {
        group: group.data,
        memberships: memberships.data ?? [],
        profiles: profiles.data ?? [],
        posts: posts.data ?? [],
        comments: (comments.data ?? []).reverse(),
        prayers: prayers.data ?? [],
        acknowledgements: acknowledgements.data ?? [],
        meetings: (meetings.data ?? []).sort(
          (a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at),
        ),
        rsvps: rsvps.data ?? [],
      };
    },
    async createPost(group: string, body: string) {
      const { error } = await client
        .from("posts")
        .insert({ group_id: group, body: body.trim() })
        .select("id")
        .single();
      if (error) throw error;
    },
    async createComment(group: string, post: string, body: string) {
      const { error } = await client
        .from("comments")
        .insert({ group_id: group, post_id: post, body: body.trim() })
        .select("id")
        .single();
      if (error) throw error;
    },
    async createPrayer(group: string, body: string) {
      const { error } = await client
        .from("prayer_requests")
        .insert({ group_id: group, body: body.trim() })
        .select("id")
        .single();
      if (error) throw error;
    },
    async removeContent(
      table: "posts" | "comments" | "prayer_requests",
      id: string,
    ) {
      const { error } = await client
        .from(table)
        .delete()
        .eq("id", id)
        .select("id")
        .single();
      if (error) throw error;
    },
    async acknowledge(group: string, request: string) {
      const { error } = await client
        .from("prayer_acknowledgements")
        .insert({ group_id: group, request_id: request });
      if (error && error.code !== "23505") throw error;
    },
    async setRsvp(meeting: string, status: "going" | "not_going") {
      const { error } = await client.rpc("set_rsvp", {
        p_meeting: meeting,
        p_status: status,
      });
      if (error) throw error;
    },
    async saveMeeting(
      group: string,
      meeting: Pick<
        Meeting,
        "title" | "description" | "location" | "starts_at"
      >,
      id?: string,
    ) {
      const result = id
        ? await client
            .from("meetings")
            .update(meeting)
            .eq("id", id)
            .eq("group_id", group)
            .select("id")
            .single()
        : await client
            .from("meetings")
            .insert({ ...meeting, group_id: group })
            .select("id")
            .single();
      if (result.error) throw result.error;
    },
    async updateGroup(id: string, name: string, description: string) {
      const { error } = await client
        .from("groups")
        .update({ name: name.trim(), description: description.trim() })
        .eq("id", id)
        .select("id")
        .single();
      if (error) throw error;
    },
    async removeMember(group: string, member: string) {
      const { error } = await client.rpc("remove_group_member", {
        p_group: group,
        p_member: member,
      });
      if (error) throw error;
    },
    async renameProfile(id: string, display_name: string) {
      const { error } = await client
        .from("profiles")
        .update({ display_name: display_name.trim() })
        .eq("id", id)
        .select("id")
        .single();
      if (error) throw error;
    },
  };
}
export type BetaRepository = ReturnType<typeof betaRepository>;
