import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { categoriesQuery } from '../lib/graphql/categories';
import { postQuery, updatePostMutation, parsePostFormInput } from '../lib/graphql/posts';
import { publishPostMutation } from '../lib/graphql/payments';
import { redirectToCheckout } from '../lib/checkout';
import { errorMessage } from '../lib/error-message';
import { paths } from '../lib/paths';
import { PostStatus } from '../enums/post-status.enum';
import { PostForm } from '../components/PostForm';
import { ErrorMessage, PageSkeleton } from '../components/PageStatus';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '../hooks/useQuery';

export default function MyPostEditPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { postId = '' } = useParams();
  const {
    data,
    error: loadError,
    isLoading,
  } = useQuery(token ? `post-edit:${postId}` : null, () =>
    Promise.all([postQuery(token ?? undefined, postId), categoriesQuery()]),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  if (isLoading || !data || !user) {
    return <PageSkeleton />;
  }

  const [post, categories] = data;

  if (post.author.id !== user.id) {
    return <Navigate to={paths.myPosts()} replace />;
  }

  async function handleSubmit(formData: FormData) {
    if (!token) return;
    setPending(true);
    setError(undefined);
    try {
      const input = parsePostFormInput(formData, categories);
      const publishing = input.status === PostStatus.PUBLISHED;

      await updatePostMutation(token, {
        id: postId,
        ...input,
        status: publishing ? undefined : input.status,
      });

      if (publishing) {
        const result = await publishPostMutation(token, postId);
        if (result.checkoutUrl) {
          await redirectToCheckout(result.checkoutUrl);
          return;
        }
      }

      navigate(paths.myPosts());
    } catch (submitError) {
      setError(errorMessage(submitError, 'Could not update the post.'));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Edit Post</h1>
        <p className="text-slate-500 mt-1">Update your post and save your changes.</p>
      </div>

      <PostForm
        categories={categories}
        defaultValues={{
          title: post.title,
          content: post.content,
          slug: post.slug,
          status: post.status,
          categoryIds: post.categories?.map((category) => category.id) ?? [],
          image: post.postImage
            ? {
                key: post.postImage.key,
                url: post.postImage.url,
                mimeType: post.postImage.mimeType,
                sizeBytes: post.postImage.sizeBytes,
                originalFileName: post.postImage.originalFileName,
                altText: post.postImage.altText ?? undefined,
              }
            : undefined,
        }}
        error={error}
        pending={pending}
        cancelTo={paths.myPosts()}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
