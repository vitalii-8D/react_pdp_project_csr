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

export async function categoriesQuery(token?: string): Promise<CategoryEntity[]> {
  const data = await gqlRequest<{ categories: CategoryEntity[] }>(CATEGORIES_QUERY, undefined, token);
  return data.categories;
}
