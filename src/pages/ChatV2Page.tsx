import { paths } from '../lib/paths';
import { ChatRoomList } from '../components/ChatRoomList';

export default function ChatV2Page() {
  return (
    <ChatRoomList
      title="Chat V2"
      subtitle="Same rooms and messages as Chat, but real-time updates run over GraphQL subscriptions instead of Socket.IO."
      roomPath={paths.chatV2Room}
      formIdPrefix="chat-v2"
    />
  );
}
