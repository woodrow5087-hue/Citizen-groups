import type { Database } from "./database.types";
type Tables = Database["public"]["Tables"];
export type Group = Tables["groups"]["Row"];
export type Membership = Tables["memberships"]["Row"];
export type Profile = Pick<
  Tables["profiles"]["Row"],
  "id" | "display_name" | "created_at"
>;
export type Post = Tables["posts"]["Row"];
export type Comment = Tables["comments"]["Row"];
export type Prayer = Tables["prayer_requests"]["Row"];
export type Acknowledgement = Tables["prayer_acknowledgements"]["Row"];
export type Meeting = Tables["meetings"]["Row"];
export type Rsvp = Tables["rsvps"]["Row"];
export type GroupSnapshot = {
  group: Group;
  memberships: Membership[];
  profiles: Profile[];
  posts: Post[];
  comments: Comment[];
  prayers: Prayer[];
  acknowledgements: Acknowledgement[];
  meetings: Meeting[];
  rsvps: Rsvp[];
};
