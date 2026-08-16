import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { cardClassName } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { safeRedirectPath } from '../lib/safe-redirect';
import { AuthFormField } from '../enums/auth-form-field.enum';
import { paths } from '../lib/paths';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') ?? '';

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      navigate(safeRedirectPath(from), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get(AuthFormField.Email) ?? '');
    const password = String(formData.get(AuthFormField.Password) ?? '');

    setPending(true);
    setError(undefined);
    try {
      await login(email, password);
      navigate(safeRedirectPath(from));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      heading="Welcome back"
      subtitle="Sign in to continue to PostShare"
      from={from}
      switchPrompt={
        <>
          Don&apos;t have an account?{' '}
          <Link to={paths.register(from)} className="text-blue-600 font-semibold hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={`${cardClassName} p-6 space-y-4`}>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}
        <TextField id="email" label="Email" name={AuthFormField.Email} type="email" required autoComplete="email" />
        <TextField
          id="password"
          label="Password"
          name={AuthFormField.Password}
          type="password"
          required
          autoComplete="current-password"
        />
        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
