import { Link } from 'react-router-dom';

import { PostAuthorMeta } from './PostAuthorMeta';
import { CategoryList } from './CategoryList';
import { PostActionsBar } from './PostActionsBar';
import { Card } from './Card';
import { paths } from '../lib/paths';
import { PostPaymentStatus } from '../enums/payment-status.enum';
import type { PostEntity } from '../lib/types';

const PAYMENT_STATUS_BADGE: Record<PostPaymentStatus, string> = {
  [PostPaymentStatus.Succeeded]: 'bg-green-50 text-green-700 border-green-100',
  [PostPaymentStatus.Pending]: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  [PostPaymentStatus.Failed]: 'bg-red-50 text-red-700 border-red-100',
  [PostPaymentStatus.Refunded]: 'bg-slate-50 text-slate-500 border-slate-200',
  [PostPaymentStatus.NotRequired]: '',
};

const PAYMENT_STATUS_LABEL: Record<PostPaymentStatus, string> = {
  [PostPaymentStatus.Succeeded]: 'Paid',
  [PostPaymentStatus.Pending]: 'Payment Pending',
  [PostPaymentStatus.Failed]: 'Payment Failed',
  [PostPaymentStatus.Refunded]: 'Refunded',
  [PostPaymentStatus.NotRequired]: '',
};

export function PostCard({
  post,
  currentUserId,
  onPostChanged,
}: {
  post: PostEntity;
  currentUserId?: string;
  onPostChanged?: () => void;
}) {
  const isOwner = post.author.id === currentUserId;
  const coverImage = post.openGraphMetadata?.image;
  const showPaymentBadge = isOwner && post.paymentStatus !== PostPaymentStatus.NotRequired;

  return (
    <Card className="p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:border-slate-300">
      <Link to={paths.postDetail(post.id, post.slug)} className="block">
        <div className="flex justify-between items-start mb-4">
          <PostAuthorMeta
            author={post.author}
            createdAt={post.createdAt}
            readingTimeMinutes={post.readingTimeMinutes}
            viewCount={post.viewCount}
          />

          <div className="flex items-center gap-2">
            {showPaymentBadge && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${PAYMENT_STATUS_BADGE[post.paymentStatus]}`}
              >
                {PAYMENT_STATUS_LABEL[post.paymentStatus]}
              </span>
            )}
            {isOwner && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                Your Post
              </span>
            )}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 leading-tight">{post.title}</h2>

        {coverImage && (
          <img
            src={coverImage}
            alt={post.openGraphMetadata?.imageAlt ?? post.title}
            className="w-full max-h-72 object-cover rounded-xl mb-4"
          />
        )}

        <p className="text-slate-600 whitespace-pre-line mb-4 leading-relaxed text-sm sm:text-base">{post.content}</p>

        <CategoryList categories={post.categories} />
      </Link>

      <PostActionsBar
        postId={post.id}
        postSlug={post.slug}
        postTitle={post.title}
        isOwner={isOwner}
        status={post.status}
        paymentStatus={post.paymentStatus}
        onChanged={onPostChanged}
      />
    </Card>
  );
}
