import { gqlRequest } from '../graphql-client';
import { PostFormField } from '../../enums/post-form-field.enum';
import { PostStatus } from '../../enums/post-status.enum';
import { categoriesQuery } from './categories';
import type { PostEntity, SearchPostsInput, SearchPostsResult } from '../types';

const POST_FIELDS = /* GraphQL */ `
  fragment PostFields on PostEntity {
    id
    title
    content
    slug
    status
    viewCount
    readingTimeMinutes
    commentCount
    averageRating
    hasBeenPublished
    paymentStatus
    createdAt
    updatedAt
    authorId
    author {
      id
      name
      email
      avatar {
        id
        url
      }
    }
    categories {
      id
      name
    }
    openGraphMetadata {
      image
      imageAlt
    }
    postImage {
      id
      key
      url
      originalFileName
      mimeType
      sizeBytes
      altText
    }
  }
`;

const POSTS_QUERY = /* GraphQL */ `
  ${POST_FIELDS}
  query Posts {
    posts {
      ...PostFields
    }
  }
`;

export async function postsQuery(token?: string): Promise<PostEntity[]> {
  const data = await gqlRequest<{ posts: PostEntity[] }>(POSTS_QUERY, undefined, token);
  return data.posts;
}

const MY_POSTS_QUERY = /* GraphQL */ `
  ${POST_FIELDS}
  query MyPosts {
    me {
      posts {
        ...PostFields
      }
    }
  }
`;

export async function myPostsQuery(token: string): Promise<PostEntity[]> {
  const data = await gqlRequest<{ me: { posts: PostEntity[] } }>(MY_POSTS_QUERY, undefined, token);
  return data.me.posts;
}

const POST_QUERY = /* GraphQL */ `
  ${POST_FIELDS}
  query Post($id: ID!) {
    post(id: $id) {
      ...PostFields
    }
  }
`;

export async function postQuery(token: string | undefined, id: string): Promise<PostEntity> {
  const data = await gqlRequest<{ post: PostEntity }>(POST_QUERY, { id }, token);
  return data.post;
}

const SEARCH_POSTS_QUERY = /* GraphQL */ `
  ${POST_FIELDS}
  query SearchPosts($input: SearchPostsInput!) {
    searchPosts(input: $input) {
      items {
        ...PostFields
      }
      nextCursor
    }
  }
`;

export async function searchPostsQuery(
  token: string | undefined,
  input: SearchPostsInput,
): Promise<SearchPostsResult> {
  const data = await gqlRequest<{ searchPosts: SearchPostsResult }>(SEARCH_POSTS_QUERY, { input }, token);
  return data.searchPosts;
}

export interface PostImageInput {
  key: string;
  url: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  slug: string;
  status?: PostStatus;
  categoryIds?: string[];
  metadata?: { tags?: string[] };
  image?: PostImageInput;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

export interface ParsedPostFormInput {
  title: string;
  content: string;
  slug: string;
  status: PostStatus;
  categoryIds: string[];
  metadata?: { tags: string[] };
  image?: PostImageInput;
}

export async function parsePostFormInput(token: string, formData: FormData): Promise<ParsedPostFormInput> {
  const title = String(formData.get(PostFormField.Title) ?? '');
  const content = String(formData.get(PostFormField.Content) ?? '');
  const slug = String(formData.get(PostFormField.Slug) ?? '');
  const status = (formData.get(PostFormField.Status) as PostStatus) ?? PostStatus.DRAFT;
  const categoryIds = formData.getAll(PostFormField.CategoryIds).map(String);

  const imageKey = formData.get(PostFormField.ImageKey);
  const imageUrl = formData.get(PostFormField.ImageUrl);
  const image: PostImageInput | undefined =
    imageKey && imageUrl
      ? {
          key: String(imageKey),
          url: String(imageUrl),
          originalFileName: String(formData.get(PostFormField.ImageOriginalFileName) ?? ''),
          mimeType: String(formData.get(PostFormField.ImageMimeType) ?? ''),
          sizeBytes: Number(formData.get(PostFormField.ImageSizeBytes) ?? 0),
          altText: formData.get(PostFormField.ImageAlt) ? String(formData.get(PostFormField.ImageAlt)) : undefined,
        }
      : undefined;

  let metadata: { tags: string[] } | undefined;
  if (categoryIds.length > 0) {
    const allCategories = await categoriesQuery(token);
    const tags = allCategories
      .filter((category) => categoryIds.includes(category.id))
      .map((category) => category.name.toLowerCase());
    metadata = { tags };
  }

  return { title, content, slug, status, categoryIds, metadata, image };
}

const CREATE_POST_MUTATION = /* GraphQL */ `
  ${POST_FIELDS}
  mutation CreatePost($createPostInput: CreatePostInput!) {
    createPost(createPostInput: $createPostInput) {
      ...PostFields
    }
  }
`;

export async function createPostMutation(token: string, input: CreatePostInput): Promise<PostEntity> {
  const data = await gqlRequest<{ createPost: PostEntity }>(
    CREATE_POST_MUTATION,
    { createPostInput: input },
    token,
  );
  return data.createPost;
}

const UPDATE_POST_MUTATION = /* GraphQL */ `
  ${POST_FIELDS}
  mutation UpdatePost($updatePostInput: UpdatePostInput!) {
    updatePost(updatePostInput: $updatePostInput) {
      ...PostFields
    }
  }
`;

export async function updatePostMutation(token: string, input: UpdatePostInput): Promise<PostEntity> {
  const data = await gqlRequest<{ updatePost: PostEntity }>(
    UPDATE_POST_MUTATION,
    { updatePostInput: input },
    token,
  );
  return data.updatePost;
}

const REMOVE_POST_MUTATION = /* GraphQL */ `
  mutation RemovePost($id: ID!) {
    removePost(id: $id) {
      id
    }
  }
`;

export async function removePostMutation(token: string, id: string): Promise<void> {
  try {
    await gqlRequest(REMOVE_POST_MUTATION, { id }, token);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot return null for non-nullable field')) {
      return;
    }
    throw error;
  }
}

const INCREMENT_POST_VIEW_COUNT_MUTATION = /* GraphQL */ `
  mutation IncrementPostViewCount($id: ID!) {
    incrementPostViewCount(id: $id) {
      id
    }
  }
`;

export async function incrementPostViewCountMutation(id: string): Promise<void> {
  await gqlRequest(INCREMENT_POST_VIEW_COUNT_MUTATION, { id });
}
