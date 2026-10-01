import { useAuth } from '../context/AuthContext';
import { chatRoomQuery } from '../lib/graphql/chat';
import { UserRole } from '../enums/user-role.enum';
import { useQuery } from './useQuery';
import type { ChatMessageEntity } from '../lib/types';

type LoadMessages = (token: string, roomId: string) => Promise<ChatMessageEntity[]>;

const NO_MESSAGES: ChatMessageEntity[] = [];

// Shared by ChatRoomPage and ChatV2RoomPage: loading the room and its history is identical for
// both transports, except for which messages query runs (Chat V2's omits attachments).
//
// History always comes from this HTTP query, including for Socket.IO chat: the socket's
// `joinedRoom` payload also carries messages, but the backend loads them without attachments.
export function useChatRoom(roomId: string | undefined, loadMessages: LoadMessages) {
  const { token, user } = useAuth();

  // Messages are loaded together with the room so the chat window mounts with its history
  // already in place - it only reads `messages` as initial state. Switching rooms changes the key,
  // which drops any response still in flight for the previous room.
  const { data, error } = useQuery(token && roomId ? `chat-room:${roomId}` : null, () =>
    Promise.all([chatRoomQuery(token ?? '', roomId ?? ''), loadMessages(token ?? '', roomId ?? '')]),
  );

  return {
    token,
    room: data?.[0] ?? null,
    messages: data?.[1] ?? NO_MESSAGES,
    error,
    currentUserId: user?.id,
    isAdmin: user?.role === UserRole.ADMIN,
  };
}
