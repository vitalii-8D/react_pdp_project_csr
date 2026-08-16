import { GraphQLClient, ClientError, type Variables } from 'graphql-request';

import { SERVER_URL } from './config';

const client = new GraphQLClient(`${SERVER_URL}/graphql`);

export class GqlRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GqlRequestError';
    this.status = status;
  }
}

function extractMessage(error: ClientError): {
  message: string;
  status: number;
} {
  const first = error.response?.errors?.[0];
  const originalError = (
    first?.extensions as { originalError?: { message?: string | string[]; statusCode?: number } } | undefined
  )?.originalError;

  const rawMessage = originalError?.message ?? first?.message ?? error.message;
  const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
  const status = originalError?.statusCode ?? error.response?.status ?? 500;

  return { message, status };
}

export async function gqlRequest<T>(query: string, variables?: Variables, token?: string): Promise<T> {
  if (token) {
    client.setHeader('Authorization', `Bearer ${token}`);
  } else {
    client.setHeader('Authorization', '');
  }

  try {
    return await client.request<T>(query, variables);
  } catch (error) {
    if (error instanceof ClientError) {
      const { message, status } = extractMessage(error);
      throw new GqlRequestError(message, status);
    }
    throw error;
  }
}
