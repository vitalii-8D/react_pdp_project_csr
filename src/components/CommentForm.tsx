import { useState } from 'react';

import { CommentFormField } from '../enums/comment-form-field.enum';
import { StarRating } from './StarRating';
import { Button } from './Button';
import { cardClassName } from './Card';
import { useAuth } from '../context/AuthContext';
import { createCommentMutation, updateCommentMutation } from '../lib/graphql/comments';
import type { CommentEntity } from '../lib/types';

interface CommentFormProps {
  postId: string;
  commentId?: string;
  initialContent?: string;
  initialRating?: number;
  submitLabel: string;
  onSuccess?: (comment: CommentEntity) => void;
  onCancel?: () => void;
}

export function CommentForm({
  postId,
  commentId,
  initialContent = '',
  initialRating = 0,
  submitLabel,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const { token } = useAuth();
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || rating === 0) {
      return;
    }

    setPending(true);
    setError(undefined);
    try {
      const comment = commentId
        ? await updateCommentMutation(token, { id: commentId, content, rating })
        : await createCommentMutation(token, { postId, content, rating });

      if (!commentId) {
        setContent(initialContent);
        setRating(initialRating);
      }
      onSuccess?.(comment);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClassName} p-4 space-y-3`}>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

      <textarea
        name={CommentFormField.Content}
        required
        rows={3}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Share your thoughts..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <StarRating value={rating} onChange={setRating} />
          <input type="hidden" name={CommentFormField.Rating} value={rating || ''} />
          <p className="text-xs text-slate-400 mt-1">Select a rating (required)</p>
        </div>

        <div className="flex items-center space-x-2">
          {onCancel && (
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={pending || rating === 0}>
            {pending ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
