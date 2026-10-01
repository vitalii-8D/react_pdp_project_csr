import { gqlRequest } from '../graphql-client';
import type { CategoryEntity } from '../types';

const CATEGORIES_QUERY = /* GraphQL */ `
  query Categories {
    categories {
      id
      name
      description
    }
  }
`;

// Categories are near-static reference data shared by the feed filters and the post form, so the
// request is made once per app load and every caller shares the same promise. A failed request is
// forgotten so the next caller retries.
let categoriesPromise: Promise<CategoryEntity[]> | undefined;

export function categoriesQuery(): Promise<CategoryEntity[]> {
  categoriesPromise ??= gqlRequest<{ categories: CategoryEntity[] }>(CATEGORIES_QUERY)
    .then((data) => data.categories)
    .catch((error: unknown) => {
      categoriesPromise = undefined;
      throw error;
    });
  return categoriesPromise;
}
