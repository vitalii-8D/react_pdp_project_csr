import { paths } from '../lib/paths';
import { ChatRoomList } from '../components/ChatRoomList';
import { loadChatV2RoomPage } from '../routes';

export default function ChatV2Page() {
  return (
    <ChatRoomList
      title="Chat V2"
      subtitle="Same rooms and messages as Chat, but real-time updates run over GraphQL subscriptions instead of Socket.IO."
      roomPath={paths.chatV2Room}
      preloadRoom={loadChatV2RoomPage}
      formIdPrefix="chat-v2"
    />
  );
}
