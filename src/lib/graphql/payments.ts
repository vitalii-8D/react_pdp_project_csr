import { gqlRequest } from '../graphql-client';
import type { PaymentTransactionEntity, PublishPostResult } from '../types';

const TRANSACTION_FIELDS = /* GraphQL */ `
  fragment TransactionFields on PaymentTransactionEntity {
    id
    status
    amount
    currency
    stripePaymentIntentId
    failureReason
    refundedAt
    createdAt
    updatedAt
    post {
      id
      title
      slug
    }
  }
`;

const PUBLISH_POST_MUTATION = /* GraphQL */ `
  mutation PublishPost($postId: ID!) {
    publishPost(postId: $postId) {
      checkoutUrl
      checkoutSessionId
      post {
        id
        status
        paymentStatus
        hasBeenPublished
      }
    }
  }
`;

export async function publishPostMutation(token: string, postId: string): Promise<PublishPostResult> {
  const data = await gqlRequest<{ publishPost: PublishPostResult }>(PUBLISH_POST_MUTATION, { postId }, token);
  return data.publishPost;
}

const RETRY_POST_PAYMENT_MUTATION = /* GraphQL */ `
  mutation RetryPostPayment($postId: ID!) {
    retryPostPayment(postId: $postId) {
      checkoutUrl
      checkoutSessionId
      post {
        id
        status
        paymentStatus
        hasBeenPublished
      }
    }
  }
`;

export async function retryPostPaymentMutation(token: string, postId: string): Promise<PublishPostResult> {
  const data = await gqlRequest<{ retryPostPayment: PublishPostResult }>(
    RETRY_POST_PAYMENT_MUTATION,
    { postId },
    token,
  );
  return data.retryPostPayment;
}

const REFUND_PAYMENT_MUTATION = /* GraphQL */ `
  ${TRANSACTION_FIELDS}
  mutation RefundPayment($transactionId: ID!) {
    refundPayment(transactionId: $transactionId) {
      ...TransactionFields
    }
  }
`;

export async function refundPaymentMutation(
  token: string,
  transactionId: string,
): Promise<PaymentTransactionEntity> {
  const data = await gqlRequest<{ refundPayment: PaymentTransactionEntity }>(
    REFUND_PAYMENT_MUTATION,
    { transactionId },
    token,
  );
  return data.refundPayment;
}

const MY_TRANSACTIONS_QUERY = /* GraphQL */ `
  ${TRANSACTION_FIELDS}
  query MyTransactions {
    myTransactions {
      ...TransactionFields
    }
  }
`;

export async function myTransactionsQuery(token: string): Promise<PaymentTransactionEntity[]> {
  const data = await gqlRequest<{ myTransactions: PaymentTransactionEntity[] }>(
    MY_TRANSACTIONS_QUERY,
    undefined,
    token,
  );
  return data.myTransactions;
}

const TRANSACTIONS_FOR_POST_QUERY = /* GraphQL */ `
  ${TRANSACTION_FIELDS}
  query TransactionsForPost($postId: ID!) {
    transactionsForPost(postId: $postId) {
      ...TransactionFields
    }
  }
`;

export async function transactionsForPostQuery(
  token: string,
  postId: string,
): Promise<PaymentTransactionEntity[]> {
  const data = await gqlRequest<{ transactionsForPost: PaymentTransactionEntity[] }>(
    TRANSACTIONS_FOR_POST_QUERY,
    { postId },
    token,
  );
  return data.transactionsForPost;
}
