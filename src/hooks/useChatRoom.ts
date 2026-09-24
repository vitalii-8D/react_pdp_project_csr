import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { chatRoomQuery } from '../lib/graphql/chat';
import { GqlRequestError } from '../lib/graphql-client';
import { UserRole } from '../enums/user-role.enum';
import type { ChatMessageEntity, ChatRoomEntity } from '../lib/types';

type LoadMessages = (token: string, roomId: string) => Promise<ChatMessageEntity[]>;

// Shared by ChatRoomPage and ChatV2RoomPage: loading the room and its history is identical for
// both transports, except for which messages query runs (Chat V2's omits attachments).
export function useChatRoom(roomId: string | undefined, loadMessages: LoadMessages) {
  const { token, user } = useAuth();
  const [room, setRoom] = useState<ChatRoomEntity | null>(null);
  const [messages, setMessages] = useState<ChatMessageEntity[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!token || !roomId) return;

    setError(undefined);
    setRoom(null);

    // Messages are loaded before the room is set so the chat window mounts with its history
    // already in place - it only reads `messages` as initial state.
    Promise.all([chatRoomQuery(token, roomId), loadMessages(token, roomId)])
      .then(([loadedRoom, loadedMessages]) => {
        setMessages(loadedMessages);
        setRoom(loadedRoom);
      })
      .catch((err) => {
        if (err instanceof GqlRequestError) {
          setError(err.message);
          return;
        }
        throw err;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, roomId]);

  return {
    token,
    room,
    messages,
    error,
    currentUserId: user?.id,
    isAdmin: user?.role === UserRole.ADMIN,
  };
}
