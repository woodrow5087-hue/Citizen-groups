import { useState } from "react";
import { PrimaryPill } from "../../components/PrimaryPill";
import type { GroupSnapshot } from "./types";
import type { BetaRepository } from "./repository";
export type RunAction = (
  work: () => Promise<unknown>,
  message?: string,
) => Promise<boolean>;
export function memberName(snapshot: GroupSnapshot, id: string) {
  return (
    snapshot.profiles.find((p) => p.id === id)?.display_name ?? "Former member"
  );
}
function CommentComposer({
  post,
  group,
  repository,
  run,
  busy,
}: {
  post: string;
  group: string;
  repository: BetaRepository;
  run: RunAction;
  busy: boolean;
}) {
  const [body, setBody] = useState("");
  return (
    <form
      className="comment-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (body.trim())
          void run(
            () => repository.createComment(group, post, body),
            "Comment shared with your group.",
          ).then((ok) => {
            if (ok) setBody("");
          });
      }}
    >
      <label htmlFor={`comment-${post}`}>Add a comment</label>
      <textarea
        id={`comment-${post}`}
        required
        maxLength={600}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <PrimaryPill secondary type="submit" disabled={busy || !body.trim()}>
        Post comment
      </PrimaryPill>
    </form>
  );
}
export function LiveFeed({
  snapshot,
  userId,
  repository,
  run,
  busy,
  onCompose,
}: {
  snapshot: GroupSnapshot;
  userId: string;
  repository: BetaRepository;
  run: RunAction;
  busy: boolean;
  onCompose: () => void;
}) {
  async function remove(table: "posts" | "comments", id: string) {
    if (
      window.confirm(
        "Delete this content from the shared group? Deleting a post also removes its comments.",
      )
    )
      await run(() => repository.removeContent(table, id), "Content deleted.");
  }
  return (
    <>
      <button className="compose" onClick={onCompose}>
        <span className="avatar small">+</span>
        <span>Share something with your group...</span>
      </button>
      {!snapshot.posts.length && (
        <p className="privacy-note">
          No posts yet. Start a conversation with your group.
        </p>
      )}
      {snapshot.posts.map((post) => (
        <article className="feed-card" key={post.id}>
          <div className="feed-head">
            <span className="member-avatar mv-red" aria-hidden="true">
              {memberName(snapshot, post.author_id).slice(0, 2).toUpperCase()}
            </span>
            <div className="feed-author">
              <strong>{memberName(snapshot, post.author_id)}</strong>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>
            {post.author_id === userId && (
              <button
                className="text-link"
                disabled={busy}
                onClick={() => void remove("posts", post.id)}
                aria-label={`Delete your post: ${post.body}`}
              >
                Delete
              </button>
            )}
          </div>
          <p>{post.body}</p>
          <details className="live-comments">
            <summary>
              Comments (
              {snapshot.comments.filter((c) => c.post_id === post.id).length})
            </summary>
            {snapshot.comments
              .filter((c) => c.post_id === post.id)
              .map((c) => (
                <div className="live-comment" key={c.id}>
                  <strong>{memberName(snapshot, c.author_id)}</strong>
                  <p>{c.body}</p>
                  {c.author_id === userId && (
                    <button
                      className="text-link"
                      disabled={busy}
                      onClick={() => void remove("comments", c.id)}
                      aria-label={`Delete your comment: ${c.body}`}
                    >
                      Delete comment
                    </button>
                  )}
                </div>
              ))}
            <CommentComposer
              post={post.id}
              group={post.group_id}
              repository={repository}
              run={run}
              busy={busy}
            />
          </details>
        </article>
      ))}
      <p className="privacy-note">
        Latest 50 posts and 200 comments. Content is shared with this group’s
        authorized members. Share someone else’s details only with consent.
      </p>
    </>
  );
}
