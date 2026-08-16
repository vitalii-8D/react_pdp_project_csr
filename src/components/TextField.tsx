import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

interface TextFieldProps extends ComponentProps<'input'> {
  label: string;
  labelSuffix?: ReactNode;
  hint?: ReactNode;
}

const inputClassName =
  'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export function TextField({ label, labelSuffix, hint, id, className, ...inputProps }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {labelSuffix}
      </label>
      <input id={id} className={clsx(inputClassName, className)} {...inputProps} />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
