import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

import { postQuery, incrementPostViewCountMutation } from '../lib/graphql/posts';
import { commentsByPostQuery } from '../lib/graphql/comments';
import { Icons } from '../components/Icons';
import { PostAuthorMeta } from '../components/PostAuthorMeta';
import { CategoryList } from '../components/CategoryList';
import { PostActionsBar } from '../components/PostActionsBar';
import { CommentList } from '../components/CommentList';
import { CommentForm } from '../components/CommentForm';
import { Card } from '../components/Card';
import { ErrorMessage, PageSkeleton } from '../components/PageStatus';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '../hooks/useQuery';
import { paths } from '../lib/paths';

const backLink = (
  <Link
    to={paths.posts()}
    className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
  >
    <Icons.ArrowLeft />
    Back to posts
  </Link>
);

export default function PostDetailPage() {
  const { token, user } = useAuth();
  const { postId = '' } = useParams();
  const viewer = token ?? undefined;

  // Post and comments load in parallel and independently - the back link renders immediately.
  const { data: post, error: postError } = useQuery(`post:${postId}:${token}`, () => postQuery(viewer, postId));
  const {
    data: comments,
    error: commentsError,
    setData: setComments,
    refetch: refetchComments,
  } = useQuery(`comments:${postId}:${token}`, () => commentsByPostQuery(postId, viewer));

  // One view per post visit - kept out of the data queries so logging in on this page (which changes
  // the token) doesn't count a second view, and guarded so StrictMode's effect re-run doesn't either.
  const countedPostId = useRef<string | null>(null);
  useEffect(() => {
    if (countedPostId.current === postId) return;
    countedPostId.current = postId;
    incrementPostViewCountMutation(postId).catch(() => {});
  }, [postId]);

  if (postError) {
    return (
      <div className="space-y-6">
        {backLink}
        <ErrorMessage message={postError} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-6">
        {backLink}
        <PageSkeleton />
      </div>
    );
  }

  const isOwner = post.author.id === user?.id;
  const coverImage = post.openGraphMetadata?.image;

  return (
    <div className="space-y-6">
      {backLink}

      <Card className="p-6 sm:p-8">
        <div className="mb-4">
          <PostAuthorMeta
            author={post.author}
            createdAt={post.createdAt}
            readingTimeMinutes={post.readingTimeMinutes}
            viewCount={post.viewCount}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {coverImage && (
          <img
            src={coverImage}
            alt={post.openGraphMetadata?.imageAlt ?? post.title}
            className="w-full max-h-96 object-cover rounded-xl mb-6"
          />
        )}

        <p className="text-slate-600 whitespace-pre-line mb-6 leading-relaxed">{post.content}</p>

        <CategoryList categories={post.categories} />

        <PostActionsBar
          postId={post.id}
          postSlug={post.slug}
          postTitle={post.title}
          isOwner={isOwner}
          status={post.status}
          paymentStatus={post.paymentStatus}
        />
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        {user && !isOwner && (
          <CommentForm
            postId={post.id}
            submitLabel="Post Comment"
            onSuccess={(comment) => setComments((prev) => [...(prev ?? []), comment])}
          />
        )}

        {!user && (
          <p className="text-sm text-slate-500">
            <Link to={paths.login(paths.postDetail(post.id, post.slug))} className="text-blue-600 font-semibold">
              Log in
            </Link>{' '}
            to leave a comment.
          </p>
        )}

        {commentsError ? (
          <ErrorMessage message={commentsError} />
        ) : comments ? (
          <CommentList
            comments={comments}
            postId={post.id}
            currentUserId={user?.id}
            onCommentChanged={refetchComments}
          />
        ) : (
          <p className="text-sm text-slate-400">Loading comments…</p>
        )}
      </Card>
    </div>
  );
}
