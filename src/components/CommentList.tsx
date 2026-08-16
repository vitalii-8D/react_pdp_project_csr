import type { CommentEntity } from '../lib/types';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: CommentEntity[];
  postId: string;
  currentUserId?: string;
  onCommentChanged?: () => void;
}

export function CommentList({ comments, postId, currentUserId, onCommentChanged }: CommentListProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-2">Comments ({comments.length})</h2>
      {comments.length === 0 ? (
        <p className="text-sm text-slate-400">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={currentUserId}
              onDeleted={() => onCommentChanged?.()}
              onUpdated={() => onCommentChanged?.()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
