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

export default function RegisterPage() {
  const { user, register } = useAuth();
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
    const name = String(formData.get(AuthFormField.Name) ?? '');
    const email = String(formData.get(AuthFormField.Email) ?? '');
    const password = String(formData.get(AuthFormField.Password) ?? '');
    const ageRaw = String(formData.get(AuthFormField.Age) ?? '');
    const age = ageRaw ? Number(ageRaw) : undefined;

    setPending(true);
    setError(undefined);
    try {
      await register({ name, email, password, age });
      navigate(safeRedirectPath(from));
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      heading="Create your account"
      subtitle="Join PostShare to start posting"
      from={from}
      switchPrompt={
        <>
          Already have an account?{' '}
          <Link to={paths.login(from)} className="text-blue-600 font-semibold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={`${cardClassName} p-6 space-y-4`}>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}
        <TextField id="name" label="Name" name={AuthFormField.Name} type="text" required autoComplete="name" />
        <TextField id="email" label="Email" name={AuthFormField.Email} type="email" required autoComplete="email" />
        <TextField
          id="password"
          label="Password"
          name={AuthFormField.Password}
          type="password"
          required
          autoComplete="new-password"
        />
        <TextField
          id="age"
          label="Age"
          labelSuffix={<span className="text-slate-400 font-normal">(optional)</span>}
          name={AuthFormField.Age}
          type="number"
          min={0}
        />
        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
    </AuthLayout>
  );
}
