import { useParams } from 'react-router-dom';

import { useChatRoom } from '../hooks/useChatRoom';
import { chatRoomMessagesV2Query } from '../lib/graphql/chat-v2';
import { GRAPHQL_WS_URL } from '../lib/config';
import { ChatWindowV2 } from '../components/ChatWindowV2';

export default function ChatV2RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { token, room, messages, error, currentUserId, isAdmin } = useChatRoom(roomId, chatRoomMessagesV2Query);

  if (error) {
    return <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>;
  }

  if (!room || !token || !currentUserId) {
    return null;
  }

  return (
    <ChatWindowV2
      graphqlWsUrl={GRAPHQL_WS_URL}
      token={token}
      room={room}
      messages={messages}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
}
