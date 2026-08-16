import { gqlRequest } from '../graphql-client';
import type { CommentEntity, CommentsPerPeriodStat, CommentsPerPostStat, CommentsPerUserStat, RatingDistributionStat } from '../types';

const COMMENT_FIELDS = /* GraphQL */ `
  fragment CommentFields on CommentEntity {
    id
    content
    rating
    postId
    authorId
    createdAt
    updatedAt
    author {
      id
      name
      avatar {
        id
        url
      }
    }
  }
`;

const COMMENTS_BY_POST_QUERY = /* GraphQL */ `
  ${COMMENT_FIELDS}
  query CommentsByPost($postId: ID!) {
    commentsByPost(postId: $postId) {
      ...CommentFields
    }
  }
`;

export async function commentsByPostQuery(postId: string, token?: string): Promise<CommentEntity[]> {
  const data = await gqlRequest<{ commentsByPost: CommentEntity[] }>(COMMENTS_BY_POST_QUERY, { postId }, token);
  return data.commentsByPost;
}

export interface CreateCommentInput {
  postId: string;
  content: string;
  rating: number;
}

const CREATE_COMMENT_MUTATION = /* GraphQL */ `
  ${COMMENT_FIELDS}
  mutation CreateComment($createCommentInput: CreateCommentInput!) {
    createComment(createCommentInput: $createCommentInput) {
      ...CommentFields
    }
  }
`;

export async function createCommentMutation(token: string, input: CreateCommentInput): Promise<CommentEntity> {
  const data = await gqlRequest<{ createComment: CommentEntity }>(
    CREATE_COMMENT_MUTATION,
    { createCommentInput: input },
    token,
  );
  return data.createComment;
}

export interface UpdateCommentInput {
  id: string;
  content?: string;
  rating?: number;
}

const UPDATE_COMMENT_MUTATION = /* GraphQL */ `
  ${COMMENT_FIELDS}
  mutation UpdateComment($updateCommentInput: UpdateCommentInput!) {
    updateComment(updateCommentInput: $updateCommentInput) {
      ...CommentFields
    }
  }
`;

export async function updateCommentMutation(token: string, input: UpdateCommentInput): Promise<CommentEntity> {
  const data = await gqlRequest<{ updateComment: CommentEntity }>(
    UPDATE_COMMENT_MUTATION,
    { updateCommentInput: input },
    token,
  );
  return data.updateComment;
}

const REMOVE_COMMENT_MUTATION = /* GraphQL */ `
  mutation RemoveComment($id: ID!) {
    removeComment(id: $id) {
      id
    }
  }
`;

export async function removeCommentMutation(token: string, id: string): Promise<void> {
  try {
    await gqlRequest(REMOVE_COMMENT_MUTATION, { id }, token);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot return null for non-nullable field')) {
      return;
    }
    throw error;
  }
}

const COMMENTS_PER_POST_QUERY = /* GraphQL */ `
  query CommentsPerPost {
    commentsPerPost {
      postId
      postTitle
      count
    }
  }
`;

export async function commentsPerPostQuery(token: string): Promise<CommentsPerPostStat[]> {
  const data = await gqlRequest<{ commentsPerPost: CommentsPerPostStat[] }>(COMMENTS_PER_POST_QUERY, undefined, token);
  return data.commentsPerPost;
}

const COMMENTS_PER_USER_QUERY = /* GraphQL */ `
  query CommentsPerUser {
    commentsPerUser {
      userId
      userName
      count
    }
  }
`;

export async function commentsPerUserQuery(token: string): Promise<CommentsPerUserStat[]> {
  const data = await gqlRequest<{ commentsPerUser: CommentsPerUserStat[] }>(COMMENTS_PER_USER_QUERY, undefined, token);
  return data.commentsPerUser;
}

const COMMENTS_PER_PERIOD_QUERY = /* GraphQL */ `
  query CommentsPerPeriod($granularity: CommentPeriodGranularity!) {
    commentsPerPeriod(granularity: $granularity) {
      period
      count
    }
  }
`;

export async function commentsPerPeriodQuery(
  token: string,
  granularity: 'DAY' | 'MONTH',
): Promise<CommentsPerPeriodStat[]> {
  const data = await gqlRequest<{ commentsPerPeriod: CommentsPerPeriodStat[] }>(
    COMMENTS_PER_PERIOD_QUERY,
    { granularity },
    token,
  );
  return data.commentsPerPeriod;
}

const COMMENT_RATING_DISTRIBUTION_QUERY = /* GraphQL */ `
  query CommentRatingDistribution {
    commentRatingDistribution {
      rating
      count
    }
  }
`;

export async function commentRatingDistributionQuery(token: string): Promise<RatingDistributionStat[]> {
  const data = await gqlRequest<{ commentRatingDistribution: RatingDistributionStat[] }>(
    COMMENT_RATING_DISTRIBUTION_QUERY,
    undefined,
    token,
  );
  return data.commentRatingDistribution;
}
