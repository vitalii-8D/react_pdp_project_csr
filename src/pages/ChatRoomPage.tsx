import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { chatRoomQuery, chatRoomMessagesQuery } from '../lib/graphql/chat';
import { GqlRequestError } from '../lib/graphql-client';
import { SERVER_URL } from '../lib/config';
import { UserRole } from '../enums/user-role.enum';
import { ChatWindow } from '../components/ChatWindow';
import type { ChatMessageEntity, ChatRoomEntity } from '../lib/types';

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { token, user } = useAuth();
  const [room, setRoom] = useState<ChatRoomEntity | null>(null);
  const [messages, setMessages] = useState<ChatMessageEntity[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!token || !roomId) return;

    setError(undefined);
    setRoom(null);

    chatRoomQuery(token, roomId)
      .then((loadedRoom) => {
        setRoom(loadedRoom);
        return chatRoomMessagesQuery(token, roomId);
      })
      .then(setMessages)
      .catch((err) => {
        if (err instanceof GqlRequestError) {
          setError(err.message);
          return;
        }
        throw err;
      });
  }, [token, roomId]);

  if (error) {
    return <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>;
  }

  if (!room || !token) {
    return null;
  }

  return (
    <ChatWindow
      socketUrl={SERVER_URL}
      token={token}
      room={room}
      messages={messages}
      currentUserId={user!.id}
      isAdmin={user!.role === UserRole.ADMIN}
    />
  );
}
