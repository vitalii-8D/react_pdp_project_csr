import clsx from 'clsx';

interface LogoMarkProps {
  size?: 'sm' | 'lg';
  className?: string;
}

export function LogoMark({ size = 'sm', className }: LogoMarkProps) {
  return (
    <div
      className={clsx(
        'rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100',
        size === 'sm' ? 'h-10 w-10' : 'h-12 w-12',
        className,
      )}
    >
      <svg className={size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777"
        />
      </svg>
    </div>
  );
}
