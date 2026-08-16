import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

import { categoriesQuery } from '../lib/graphql/categories';
import { createPostMutation, parsePostFormInput } from '../lib/graphql/posts';
import { publishPostMutation } from '../lib/graphql/payments';
import { getStripePublishableKey } from '../lib/config';
import { paths } from '../lib/paths';
import { PostStatus } from '../enums/post-status.enum';
import { PostForm } from '../components/PostForm';
import { useAuth } from '../context/AuthContext';
import type { CategoryEntity } from '../lib/types';

export default function MyPostsNewPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [checkoutUrl, setCheckoutUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!token) return;
    categoriesQuery(token).then(setCategories);
  }, [token]);

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

      const post = await createPostMutation(token, {
        ...input,
        status: publishing ? PostStatus.DRAFT : input.status,
      });

      if (publishing) {
        const result = await publishPostMutation(token, post.id);
        if (result.checkoutUrl) {
          setCheckoutUrl(result.checkoutUrl);
          return;
        }
      }

      navigate(paths.myPosts());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not create the post.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Create Post</h1>
        <p className="text-slate-500 mt-1">Share something new with the community.</p>
      </div>

      <PostForm
        categories={categories}
        error={error}
        pending={pending}
        cancelTo={paths.myPosts()}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
