import { paths } from '../lib/paths';
import { ChatRoomList } from '../components/ChatRoomList';
import { loadChatRoomPage } from '../routes';

export default function ChatPage() {
  return (
    <ChatRoomList
      title="Chat"
      subtitle="Join a room to start chatting in real time."
      roomPath={paths.chatRoom}
      preloadRoom={loadChatRoomPage}
      formIdPrefix="chat"
    />
  );
}
