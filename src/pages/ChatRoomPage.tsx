import { useParams } from 'react-router-dom';

import { useChatRoom } from '../hooks/useChatRoom';
import { chatRoomMessagesQuery } from '../lib/graphql/chat';
import { SERVER_URL } from '../lib/config';
import { ChatWindow } from '../components/ChatWindow';

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { token, room, messages, error, currentUserId, isAdmin } = useChatRoom(roomId, chatRoomMessagesQuery);

  if (error) {
    return <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>;
  }

  if (!room || !token || !currentUserId) {
    return null;
  }

  return (
    <ChatWindow
      socketUrl={SERVER_URL}
      token={token}
      room={room}
      messages={messages}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
}
