import { useState } from 'react';
import clsx from 'clsx';

import { Icons } from './Icons';

const STARS = [1, 2, 3, 4, 5];

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, readOnly }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !readOnly && !!onChange;
  const displayValue = hover ?? value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
      {STARS.map((star) => {
        const filled = star <= displayValue;
        const starClassName = clsx('w-5 h-5', filled ? 'text-yellow-400' : 'text-slate-300');

        if (!interactive) {
          return <Icons.Star key={star} className={starClassName} />;
        }

        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onClick={() => onChange(star)}
            className="cursor-pointer"
            aria-label={`Rate ${star} out of 5`}
          >
            <Icons.Star className={starClassName} />
          </button>
        );
      })}
    </div>
  );
}
