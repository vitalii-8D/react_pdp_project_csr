import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

import { LogoMark } from './LogoMark';
import { safeRedirectPath } from '../lib/safe-redirect';

interface AuthLayoutProps {
  heading: string;
  subtitle: string;
  from: string;
  switchPrompt: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ heading, subtitle, from, switchPrompt, children }: AuthLayoutProps) {
  const backTo = safeRedirectPath(from);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <LogoMark size="lg" className="mx-auto mb-3" />
          <h1 className="text-2xl font-black text-slate-900">{heading}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        {children}

        <p className="text-center text-sm text-slate-500 mt-6">{switchPrompt}</p>

        <p className="text-center text-sm mt-4">
          <Link to={backTo} className="text-slate-500 font-semibold hover:text-slate-700 hover:underline">
            ← Back
          </Link>
        </p>
      </div>
    </div>
  );
}
