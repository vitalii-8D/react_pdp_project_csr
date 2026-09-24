import { gqlRequest } from '../graphql-client';
import type { ChatMessageEntity } from '../types';

// Chat V2's BE schema doesn't include the `attachments` field (that's part of the chat-attachments
// feature, which chat V2's real-time work doesn't touch) - so this fragment mirrors
// CHAT_MESSAGE_FIELDS from chat.ts minus `attachments`, and the query below fills in an empty
// array so `ChatMessageEntity`'s shape stays the same for shared UI code.
const CHAT_MESSAGE_V2_FIELDS = /* GraphQL */ `
  fragment ChatMessageV2Fields on ChatMessageEntity {
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
    isAdminBroadcast
  }
`;

const CHAT_ROOM_MESSAGES_V2_QUERY = /* GraphQL */ `
  ${CHAT_MESSAGE_V2_FIELDS}
  query ChatRoomMessagesV2($roomId: ID!) {
    chatRoomMessages(roomId: $roomId) {
      ...ChatMessageV2Fields
    }
  }
`;

export async function chatRoomMessagesV2Query(token: string, roomId: string): Promise<ChatMessageEntity[]> {
  const data = await gqlRequest<{
    chatRoomMessages: Omit<ChatMessageEntity, 'attachments'>[];
  }>(CHAT_ROOM_MESSAGES_V2_QUERY, { roomId }, token);
  return data.chatRoomMessages.map((message) => ({
    ...message,
    attachments: [],
  }));
}

const SEND_CHAT_MESSAGE_V2_MUTATION = /* GraphQL */ `
  mutation SendChatMessageV2($input: SendMessageInput!) {
    sendChatMessage(sendMessageInput: $input) {
      id
    }
  }
`;

export async function sendChatMessageV2Mutation(token: string, roomId: string, message: string): Promise<void> {
  await gqlRequest(SEND_CHAT_MESSAGE_V2_MUTATION, { input: { roomId, message } }, token);
}

const ADMIN_BROADCAST_CHAT_V2_MUTATION = /* GraphQL */ `
  mutation AdminBroadcastChatV2($message: String!) {
    adminBroadcastChat(message: $message) {
      id
    }
  }
`;

export async function adminBroadcastChatV2Mutation(token: string, message: string): Promise<void> {
  await gqlRequest(ADMIN_BROADCAST_CHAT_V2_MUTATION, { message }, token);
}

// Subscriptions run over graphql-ws (see ChatWindowV2), not graphql-request, so only the query
// strings are exported here.
export const CHAT_MESSAGE_ADDED_SUBSCRIPTION = /* GraphQL */ `
  ${CHAT_MESSAGE_V2_FIELDS}
  subscription ChatMessageAddedV2($roomId: ID!) {
    chatMessageAdded(roomId: $roomId) {
      ...ChatMessageV2Fields
    }
  }
`;

export const CHAT_ROOM_PRESENCE_SUBSCRIPTION = /* GraphQL */ `
  subscription ChatRoomPresenceV2($roomId: ID!) {
    chatRoomPresence(roomId: $roomId) {
      type
      roomId
      userId
      userName
    }
  }
`;

export interface ChatPresenceEvent {
  type: 'JOINED' | 'LEFT';
  roomId: string;
  userId: string;
  userName: string;
}
