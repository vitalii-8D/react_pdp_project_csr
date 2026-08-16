import { useCallback, useEffect, useState } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { paths } from '../lib/paths';
import type { CommentEntity, PostEntity } from '../lib/types';

export default function PostDetailPage() {
  const { token, user } = useAuth();
  const { postId = '' } = useParams();
  const [post, setPost] = useState<PostEntity | undefined>(undefined);
  const [comments, setComments] = useState<CommentEntity[]>([]);

  const refetchComments = useCallback(() => {
    commentsByPostQuery(postId, token ?? undefined).then(setComments);
  }, [postId, token]);

  useEffect(() => {
    let cancelled = false;
    postQuery(token ?? undefined, postId).then((fetchedPost) => {
      if (!cancelled) setPost(fetchedPost);
    });
    commentsByPostQuery(postId, token ?? undefined).then((fetchedComments) => {
      if (!cancelled) setComments(fetchedComments);
    });
    incrementPostViewCountMutation(postId).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [postId, token]);

  if (!post) {
    return null;
  }

  const isOwner = post.author.id === user?.id;
  const coverImage = post.openGraphMetadata?.image;

  return (
    <div className="space-y-6">
      <Link
        to={paths.posts()}
        className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <Icons.ArrowLeft />
        Back to posts
      </Link>

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
            onSuccess={(comment) => setComments((prev) => [...prev, comment])}
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

        <CommentList
          comments={comments}
          postId={post.id}
          currentUserId={user?.id}
          onCommentChanged={refetchComments}
        />
      </Card>
    </div>
  );
}
