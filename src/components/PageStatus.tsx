import clsx from 'clsx';

import { Card } from './Card';

export function ErrorMessage({ message, className }: { message: string; className?: string }) {
  return (
    <p className={clsx('text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3', className)}>
      {message}
    </p>
  );
}

const pageSkeleton = (
  <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading">
    <div className="h-8 w-48 rounded-lg bg-slate-200" />
    <Card className="p-6 space-y-3">
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      <div className="h-4 w-1/2 rounded bg-slate-200" />
      <div className="h-4 w-2/3 rounded bg-slate-200" />
    </Card>
  </div>
);

// Shared fallback for lazy route chunks and for pages still loading their data - the layout
// (header/footer) stays visible, only the content area shows a placeholder.
export function PageSkeleton() {
  return pageSkeleton;
}
