import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { categoriesQuery } from '../lib/graphql/categories';
import { createPostMutation, parsePostFormInput } from '../lib/graphql/posts';
import { publishPostMutation } from '../lib/graphql/payments';
import { redirectToCheckout } from '../lib/checkout';
import { errorMessage } from '../lib/error-message';
import { paths } from '../lib/paths';
import { PostStatus } from '../enums/post-status.enum';
import { PostForm } from '../components/PostForm';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '../hooks/useQuery';

export default function MyPostsNewPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [], error: loadError } = useQuery('categories', categoriesQuery);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleSubmit(formData: FormData) {
    if (!token) return;
    setPending(true);
    setError(undefined);
    try {
      const input = parsePostFormInput(formData, categories);
      const publishing = input.status === PostStatus.PUBLISHED;

      const post = await createPostMutation(token, {
        ...input,
        status: publishing ? PostStatus.DRAFT : input.status,
      });

      if (publishing) {
        const result = await publishPostMutation(token, post.id);
        if (result.checkoutUrl) {
          await redirectToCheckout(result.checkoutUrl);
          return;
        }
      }

      navigate(paths.myPosts());
    } catch (submitError) {
      setError(errorMessage(submitError, 'Could not create the post.'));
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
        error={error ?? loadError}
        pending={pending}
        cancelTo={paths.myPosts()}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
