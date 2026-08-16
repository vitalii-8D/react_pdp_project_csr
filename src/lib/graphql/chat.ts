import { gqlRequest } from '../graphql-client';
import type { ChatMessageEntity, ChatRoomEntity } from '../types';

const CHAT_ROOM_FIELDS = /* GraphQL */ `
  fragment ChatRoomFields on ChatRoomEntity {
    id
    name
    description
    isDirect
    participants {
      id
      name
      email
    }
    createdAt
    updatedAt
  }
`;

const CHAT_MESSAGE_FIELDS = /* GraphQL */ `
  fragment ChatMessageFields on ChatMessageEntity {
    id
    message
    userId
    user {
      id
      name
      email
    }
    roomId
    createdAt
  }
`;

const CHAT_ROOMS_QUERY = /* GraphQL */ `
  ${CHAT_ROOM_FIELDS}
  query ChatRooms {
    chatRooms {
      ...ChatRoomFields
    }
  }
`;

export async function chatRoomsQuery(token: string): Promise<ChatRoomEntity[]> {
  const data = await gqlRequest<{ chatRooms: ChatRoomEntity[] }>(CHAT_ROOMS_QUERY, undefined, token);
  return data.chatRooms;
}

const MY_DIRECT_MESSAGE_ROOMS_QUERY = /* GraphQL */ `
  ${CHAT_ROOM_FIELDS}
  query MyDirectMessageRooms {
    myDirectMessageRooms {
      ...ChatRoomFields
    }
  }
`;

export async function myDirectMessageRoomsQuery(token: string): Promise<ChatRoomEntity[]> {
  const data = await gqlRequest<{ myDirectMessageRooms: ChatRoomEntity[] }>(
    MY_DIRECT_MESSAGE_ROOMS_QUERY,
    undefined,
    token,
  );
  return data.myDirectMessageRooms;
}

const START_DIRECT_MESSAGE_MUTATION = /* GraphQL */ `
  ${CHAT_ROOM_FIELDS}
  mutation StartDirectMessage($userId: ID!) {
    startDirectMessage(userId: $userId) {
      ...ChatRoomFields
    }
  }
`;

export async function startDirectMessageMutation(token: string, userId: string): Promise<ChatRoomEntity> {
  const data = await gqlRequest<{ startDirectMessage: ChatRoomEntity }>(
    START_DIRECT_MESSAGE_MUTATION,
    { userId },
    token,
  );
  return data.startDirectMessage;
}

const CHAT_ROOM_QUERY = /* GraphQL */ `
  ${CHAT_ROOM_FIELDS}
  query ChatRoom($id: ID!) {
    chatRoom(id: $id) {
      ...ChatRoomFields
    }
  }
`;

export async function chatRoomQuery(token: string, id: string): Promise<ChatRoomEntity> {
  const data = await gqlRequest<{ chatRoom: ChatRoomEntity }>(CHAT_ROOM_QUERY, { id }, token);
  return data.chatRoom;
}

const CHAT_ROOM_MESSAGES_QUERY = /* GraphQL */ `
  ${CHAT_MESSAGE_FIELDS}
  query ChatRoomMessages($roomId: ID!) {
    chatRoomMessages(roomId: $roomId) {
      ...ChatMessageFields
    }
  }
`;

export async function chatRoomMessagesQuery(token: string, roomId: string): Promise<ChatMessageEntity[]> {
  const data = await gqlRequest<{ chatRoomMessages: ChatMessageEntity[] }>(
    CHAT_ROOM_MESSAGES_QUERY,
    { roomId },
    token,
  );
  return data.chatRoomMessages;
}

export interface CreateChatRoomInput {
  name: string;
  description?: string;
}

const CREATE_CHAT_ROOM_MUTATION = /* GraphQL */ `
  ${CHAT_ROOM_FIELDS}
  mutation CreateChatRoom($createRoomInput: CreateRoomInput!) {
    createChatRoom(createRoomInput: $createRoomInput) {
      ...ChatRoomFields
    }
  }
`;

export async function createChatRoomMutation(token: string, input: CreateChatRoomInput): Promise<ChatRoomEntity> {
  const data = await gqlRequest<{ createChatRoom: ChatRoomEntity }>(
    CREATE_CHAT_ROOM_MUTATION,
    { createRoomInput: input },
    token,
  );
  return data.createChatRoom;
}
