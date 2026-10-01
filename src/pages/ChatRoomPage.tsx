import { useParams } from 'react-router-dom';

import { useChatRoom } from '../hooks/useChatRoom';
import { chatRoomMessagesQuery } from '../lib/graphql/chat';
import { SERVER_URL } from '../lib/config';
import { ChatWindow } from '../components/ChatWindow';
import { ErrorMessage, PageSkeleton } from '../components/PageStatus';

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { token, room, messages, error, currentUserId, isAdmin } = useChatRoom(roomId, chatRoomMessagesQuery);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!room || !token || !currentUserId) {
    return <PageSkeleton />;
  }

  return (
    // Keyed by room: switching rooms remounts the window, so its local state (messages, drafts,
    // presence) starts fresh from props instead of being reset in an effect.
    <ChatWindow
      key={room.id}
      socketUrl={SERVER_URL}
      token={token}
      room={room}
      messages={messages}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
}
