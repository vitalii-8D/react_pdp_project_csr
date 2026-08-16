import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

export const buttonStyles = cva(
  'inline-flex items-center justify-center font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 hover:shadow-lg',
        secondary: 'text-slate-600 hover:bg-slate-50',
        ghost: 'text-slate-600 hover:text-blue-600 hover:bg-slate-50',
        chip: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 hover:border-blue-200',
        danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
        'danger-solid': 'bg-red-500 hover:bg-red-600 text-white',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-4 py-2 text-sm rounded-xl',
        lg: 'px-5 py-2.5 text-sm rounded-xl',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonStyles> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonStyles({ variant, size, className })} {...props} />;
}
