import { gqlRequest } from '../graphql-client';
import type { AuthResponse, ChatMessageUser, SearchUsersInput, SearchUsersResult, UserEntity } from '../types';

const USER_FIELDS = /* GraphQL */ `
  fragment UserFields on UserEntity {
    id
    email
    name
    age
    role
    city
    latitude
    longitude
    isOnline
    createdAt
    avatar {
      id
      url
    }
  }
`;

const ME_QUERY = /* GraphQL */ `
  ${USER_FIELDS}
  query Me {
    me {
      ...UserFields
    }
  }
`;

export async function meQuery(token: string): Promise<UserEntity> {
  const data = await gqlRequest<{ me: UserEntity }>(ME_QUERY, undefined, token);
  return data.me;
}

export interface UserAvatarDetails {
  id: string;
  key: string;
  url: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}

const ME_WITH_AVATAR_QUERY = /* GraphQL */ `
  ${USER_FIELDS}
  query MeWithAvatar {
    me {
      ...UserFields
      avatar {
        id
        key
        url
        originalFileName
        mimeType
        sizeBytes
      }
    }
  }
`;

export async function meWithAvatarQuery(token: string): Promise<UserEntity & { avatar?: UserAvatarDetails | null }> {
  const data = await gqlRequest<{ me: UserEntity & { avatar?: UserAvatarDetails | null } }>(
    ME_WITH_AVATAR_QUERY,
    undefined,
    token,
  );
  return data.me;
}

const LOGIN_MUTATION = /* GraphQL */ `
  ${USER_FIELDS}
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      user {
        ...UserFields
      }
    }
  }
`;

export async function loginMutation(email: string, password: string): Promise<AuthResponse> {
  const data = await gqlRequest<{ login: AuthResponse }>(LOGIN_MUTATION, {
    loginInput: { email, password },
  });
  return data.login;
}

const USERS_QUERY = /* GraphQL */ `
  ${USER_FIELDS}
  query Users {
    users {
      ...UserFields
    }
  }
`;

export async function usersQuery(token: string): Promise<UserEntity[]> {
  const data = await gqlRequest<{ users: UserEntity[] }>(USERS_QUERY, undefined, token);
  return data.users;
}

const SEARCH_USERS_QUERY = /* GraphQL */ `
  query SearchUsers($input: SearchUsersInput!) {
    searchUsers(input: $input) {
      items {
        id
        name
        email
      }
    }
  }
`;

export async function searchUsersQuery(token: string, query: string): Promise<ChatMessageUser[]> {
  const data = await gqlRequest<{ searchUsers: { items: ChatMessageUser[] } }>(
    SEARCH_USERS_QUERY,
    { input: { query } },
    token,
  );
  return data.searchUsers.items;
}

const SEARCH_USERS_FULL_QUERY = /* GraphQL */ `
  ${USER_FIELDS}
  query SearchUsersFull($input: SearchUsersInput!) {
    searchUsers(input: $input) {
      items {
        ...UserFields
      }
      nextCursor
    }
  }
`;

export async function searchUsersFullQuery(token: string, input: SearchUsersInput): Promise<SearchUsersResult> {
  const data = await gqlRequest<{ searchUsers: SearchUsersResult }>(SEARCH_USERS_FULL_QUERY, { input }, token);
  return data.searchUsers;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  age?: number;
}

const CREATE_USER_MUTATION = /* GraphQL */ `
  ${USER_FIELDS}
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      ...UserFields
    }
  }
`;

export async function createUserMutation(input: CreateUserInput): Promise<UserEntity> {
  const data = await gqlRequest<{ createUser: UserEntity }>(CREATE_USER_MUTATION, { createUserInput: input });
  return data.createUser;
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  age?: number;
  city?: string;
  latitude?: number;
  longitude?: number;
}

const UPDATE_USER_MUTATION = /* GraphQL */ `
  ${USER_FIELDS}
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      ...UserFields
    }
  }
`;

export async function updateUserMutation(token: string, input: UpdateUserInput): Promise<UserEntity> {
  const data = await gqlRequest<{ updateUser: UserEntity }>(
    UPDATE_USER_MUTATION,
    { updateUserInput: input },
    token,
  );
  return data.updateUser;
}

export interface UserAvatarInput {
  key: string;
  url: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}

const UPDATE_AVATAR_MUTATION = /* GraphQL */ `
  mutation UpdateAvatar($input: UserAvatarInput!) {
    updateAvatar(input: $input) {
      id
      key
      url
      originalFileName
      mimeType
      sizeBytes
    }
  }
`;

export async function updateAvatarMutation(token: string, input: UserAvatarInput): Promise<UserAvatarDetails> {
  const data = await gqlRequest<{ updateAvatar: UserAvatarDetails }>(UPDATE_AVATAR_MUTATION, { input }, token);
  return data.updateAvatar;
}
