import clsx from 'clsx';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface NavLinkProps {
  to: string;
  isActive: boolean;
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function NavLink({ to, isActive, size = 'md', children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center font-semibold rounded-xl transition-all',
        size === 'md' ? 'px-4 py-2 text-sm duration-200' : 'px-3 py-1.5 text-sm',
        isActive
          ? 'bg-blue-50 text-blue-700 border border-blue-100'
          : size === 'md'
            ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
            : 'text-slate-600',
      )}
    >
      {children}
    </Link>
  );
}
