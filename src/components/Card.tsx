import clsx from 'clsx';
import type { ComponentProps } from 'react';

export const cardClassName = 'bg-white rounded-2xl border border-slate-200 shadow-sm';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx(cardClassName, className)} {...props} />;
}
