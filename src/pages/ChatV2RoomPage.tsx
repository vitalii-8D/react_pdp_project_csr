import { useParams } from 'react-router-dom';

import { useChatRoom } from '../hooks/useChatRoom';
import { chatRoomMessagesV2Query } from '../lib/graphql/chat-v2';
import { GRAPHQL_WS_URL } from '../lib/config';
import { ChatWindowV2 } from '../components/ChatWindowV2';
import { ErrorMessage, PageSkeleton } from '../components/PageStatus';

export default function ChatV2RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { token, room, messages, error, currentUserId, isAdmin } = useChatRoom(roomId, chatRoomMessagesV2Query);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!room || !token || !currentUserId) {
    return <PageSkeleton />;
  }

  return (
    // Keyed by room: switching rooms remounts the window, so its local state (messages, drafts,
    // presence) starts fresh from props instead of being reset in an effect.
    <ChatWindowV2
      key={room.id}
      graphqlWsUrl={GRAPHQL_WS_URL}
      token={token}
      room={room}
      messages={messages}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
}
