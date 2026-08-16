import { gqlRequest } from '../graphql-client';
import type { ShareLinks } from '../types';

const GENERATE_SHARE_LINKS_QUERY = /* GraphQL */ `
  query GenerateShareLinks($url: String!, $postId: ID) {
    generateShareLinks(url: $url, postId: $postId) {
      facebook
      twitter
      linkedin
      telegram
      whatsapp
    }
  }
`;

export async function generateShareLinksQuery(
  token: string | undefined,
  url: string,
  postId?: string,
): Promise<ShareLinks> {
  const data = await gqlRequest<{ generateShareLinks: ShareLinks }>(
    GENERATE_SHARE_LINKS_QUERY,
    { url, postId },
    token,
  );
  return data.generateShareLinks;
}
