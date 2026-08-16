import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

import { categoriesQuery } from '../lib/graphql/categories';
import { postQuery, updatePostMutation, parsePostFormInput } from '../lib/graphql/posts';
import { publishPostMutation } from '../lib/graphql/payments';
import { getStripePublishableKey } from '../lib/config';
import { paths } from '../lib/paths';
import { PostStatus } from '../enums/post-status.enum';
import { PostForm } from '../components/PostForm';
import { useAuth } from '../context/AuthContext';
import type { CategoryEntity, PostEntity } from '../lib/types';

export default function MyPostEditPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { postId = '' } = useParams();
  const [post, setPost] = useState<PostEntity | undefined>(undefined);
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [checkoutUrl, setCheckoutUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!token || !user) return;
    let cancelled = false;
    Promise.all([postQuery(token, postId), categoriesQuery(token)]).then(([fetchedPost, cats]) => {
      if (cancelled) return;
      if (fetchedPost.author.id !== user.id) {
        navigate(paths.myPosts());
        return;
      }
      setPost(fetchedPost);
      setCategories(cats);
    });
    return () => {
      cancelled = true;
    };
  }, [token, user, postId, navigate]);

  useEffect(() => {
    if (!checkoutUrl) return;
    const stripePublishableKey = getStripePublishableKey();
    if (stripePublishableKey) {
      void loadStripe(stripePublishableKey);
    }
    window.location.href = checkoutUrl;
  }, [checkoutUrl]);

  async function handleSubmit(formData: FormData) {
    if (!token) return;
    setPending(true);
    setError(undefined);
    try {
      const input = await parsePostFormInput(token, formData);
      const publishing = input.status === PostStatus.PUBLISHED;

      await updatePostMutation(token, {
        id: postId,
        ...input,
        status: publishing ? undefined : input.status,
      });

      if (publishing) {
        const result = await publishPostMutation(token, postId);
        if (result.checkoutUrl) {
          setCheckoutUrl(result.checkoutUrl);
          return;
        }
      }

      navigate(paths.myPosts());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not update the post.');
    } finally {
      setPending(false);
    }
  }

  if (!post) {
    return null;
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
