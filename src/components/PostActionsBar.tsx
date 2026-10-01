import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Icons } from './Icons';
import { ShareModal } from './ShareModal';
import { ConfirmDialog } from './ConfirmDialog';
import { Button, buttonStyles } from './Button';
import { useAuth } from '../context/AuthContext';
import { paths } from '../lib/paths';
import { redirectToCheckout } from '../lib/checkout';
import { errorMessage } from '../lib/error-message';
import { removePostMutation } from '../lib/graphql/posts';
import { publishPostMutation, retryPostPaymentMutation } from '../lib/graphql/payments';
import { PostStatus } from '../enums/post-status.enum';
import { PostPaymentStatus } from '../enums/payment-status.enum';

interface PostActionsBarProps {
  postId: string;
  postSlug: string;
  postTitle: string;
  isOwner: boolean;
  status?: PostStatus;
  paymentStatus?: PostPaymentStatus;
  onChanged?: (postId: string) => void;
}

export function PostActionsBar({
  postId,
  postSlug,
  postTitle,
  isOwner,
  status,
  paymentStatus,
  onChanged,
}: PostActionsBarProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const needsFirstPublish = status !== undefined && status !== PostStatus.PUBLISHED;
  const isFailedPayment = paymentStatus === PostPaymentStatus.Failed;
  const isPendingPayment = paymentStatus === PostPaymentStatus.Pending;

  async function handlePublishOrRetry() {
    if (!token || isPublishing) return;
    setIsPublishing(true);
    setError(undefined);
    try {
      const result = isFailedPayment
        ? await retryPostPaymentMutation(token, postId)
        : await publishPostMutation(token, postId);
      if (result.checkoutUrl) {
        await redirectToCheckout(result.checkoutUrl);
      } else {
        navigate(paths.myPosts());
      }
    } catch (publishError) {
      setError(errorMessage(publishError, 'Could not start the payment.'));
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleDelete() {
    setConfirmOpen(false);
    if (!token) return;
    setError(undefined);
    try {
      await removePostMutation(token, postId);
    } catch (deleteError) {
      setError(errorMessage(deleteError, 'Could not delete the post.'));
      return;
    }
    if (onChanged) {
      onChanged(postId);
    } else {
      navigate(paths.myPosts());
    }
  }

  return (
    <div className="pt-4 border-t border-slate-100">
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="flex items-center justify-between">
        <Button type="button" variant="chip" size="sm" onClick={() => setShareOpen(true)}>
          <Icons.Share />
          Share
        </Button>

        {isOwner && (
          <div className="flex items-center space-x-2">
            {isPendingPayment && (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-100">
                Payment Pending
              </span>
            )}

            {needsFirstPublish && !isPendingPayment && (
              <Button type="button" variant="chip" size="sm" disabled={isPublishing} onClick={handlePublishOrRetry}>
                {isPublishing ? 'Redirecting…' : isFailedPayment ? 'Retry Payment' : 'Publish'}
              </Button>
            )}

            <Link to={paths.myPostEdit(postId)} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
              <Icons.Edit />
              Edit
            </Link>
            <Button type="button" variant="danger" size="sm" onClick={() => setConfirmOpen(true)} title="Delete post">
              <Icons.Delete />
              <span className="ml-1">Delete</span>
            </Button>
          </div>
        )}

        <ShareModal
          postId={postId}
          postSlug={postSlug}
          postTitle={postTitle}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />

        <ConfirmDialog
          open={confirmOpen}
          title="Delete this post?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
