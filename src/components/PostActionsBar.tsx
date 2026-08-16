import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

import { Icons } from './Icons';
import { ShareModal } from './ShareModal';
import { ConfirmDialog } from './ConfirmDialog';
import { Button, buttonStyles } from './Button';
import { useAuth } from '../context/AuthContext';
import { paths } from '../lib/paths';
import { getStripePublishableKey } from '../lib/config';
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
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!checkoutUrl) {
      return;
    }
    // Stripe's hosted Checkout redirect only needs the session URL — `stripe.redirectToCheckout`
    // was removed from @stripe/stripe-js. Loading Stripe.js first is still Stripe's recommended
    // practice on any page that completes a payment (it initializes their fraud-detection
    // scripts), so we load it even though this flow doesn't call a Stripe.js method directly.
    const stripePublishableKey = getStripePublishableKey();
    if (stripePublishableKey) {
      void loadStripe(stripePublishableKey);
    }
    window.location.href = checkoutUrl;
  }, [checkoutUrl]);

  const needsFirstPublish = status !== undefined && status !== PostStatus.PUBLISHED;
  const isFailedPayment = paymentStatus === PostPaymentStatus.Failed;
  const isPendingPayment = paymentStatus === PostPaymentStatus.Pending;

  async function handlePublishOrRetry() {
    if (!token || isPublishing) return;
    setIsPublishing(true);
    try {
      const result = isFailedPayment
        ? await retryPostPaymentMutation(token, postId)
        : await publishPostMutation(token, postId);
      if (result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl);
      } else {
        navigate(paths.myPosts());
      }
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleDelete() {
    setConfirmOpen(false);
    if (!token) return;
    await removePostMutation(token, postId);
    if (onChanged) {
      onChanged(postId);
    } else {
      navigate(paths.myPosts());
    }
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
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
  );
}
