import { Icon } from "./Icon";
export interface Post {
  id: string;
  name: string;
  initial: string;
  color: string;
  text: string;
  time: string;
}
export function PostCard({
  post,
  encouraged,
  onEncourage,
  onReply,
  preview = false,
}: {
  post: Post;
  encouraged: boolean;
  onEncourage: () => void;
  onReply: () => void;
  preview?: boolean;
}) {
  return (
    <article className="feed-card">
      <div className="feed-head">
        <span className={`member-avatar mv-${post.color}`}>{post.initial}</span>
        <div className="feed-author">
          <strong>{post.name}</strong>
          <span>Example post · {post.time}</span>
        </div>
        {preview && <span className="feed-type">ENCOURAGEMENT</span>}
      </div>
      <p>{post.text}</p>
      <div className="feed-foot">
        <button
          className="reaction-btn"
          aria-pressed={encouraged}
          onClick={onEncourage}
        >
          <Icon name="prayer" size="small" />
          {encouraged ? "Encouraged" : "Encourage"}
        </button>
        <button className="reaction-btn" onClick={onReply}>
          <Icon name="message" size="small" />
          Reply
        </button>
      </div>
    </article>
  );
}
