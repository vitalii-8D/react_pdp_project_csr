import { useState } from 'react';

import type { CommentEntity } from '../lib/types';
import { avatarUrl } from '../lib/images';
import { formatDate } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { removeCommentMutation } from '../lib/graphql/comments';
import { Icons } from './Icons';
import { Button } from './Button';
import { StarRating } from './StarRating';
import { ConfirmDialog } from './ConfirmDialog';
import { CommentForm } from './CommentForm';

interface CommentItemProps {
  comment: CommentEntity;
  postId: string;
  currentUserId?: string;
  onDeleted?: (commentId: string) => void;
  onUpdated?: (comment: CommentEntity) => void;
}

export function CommentItem({ comment, postId, currentUserId, onDeleted, onUpdated }: CommentItemProps) {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isOwnComment = comment.author.id === currentUserId;

  if (isEditing) {
    return (
      <div className="py-4 border-b border-slate-100 last:border-0">
        <CommentForm
          postId={postId}
          commentId={comment.id}
          initialContent={comment.content}
          initialRating={comment.rating}
          submitLabel="Save"
          onSuccess={(updated) => {
            onUpdated?.(updated);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <img
            className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
            src={comment.author.avatar?.url ?? avatarUrl(comment.author.id)}
            alt={comment.author.name}
          />
          <div>
            <p className="text-sm font-bold text-slate-900">{comment.author.name}</p>
            <p className="text-xs text-slate-400">{formatDate(comment.createdAt)}</p>
          </div>
        </div>

        {isOwnComment && (
          <div className="flex items-center space-x-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Icons.Edit />
              Edit
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              title="Delete comment"
            >
              <Icons.Delete />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-2">
        <StarRating value={comment.rating} readOnly />
      </div>

      <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{comment.content}</p>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this comment?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          if (!token) return;
          await removeCommentMutation(token, comment.id);
          onDeleted?.(comment.id);
        }}
      />
    </div>
  );
}
