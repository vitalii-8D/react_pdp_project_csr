import type { CategoryEntity } from '../lib/types';

export function CategoryList({ categories }: { categories?: CategoryEntity[] | null }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <span key={category.id} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
          {category.name}
        </span>
      ))}
    </div>
  );
}
