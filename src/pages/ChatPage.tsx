import { paths } from '../lib/paths';
import { ChatRoomList } from '../components/ChatRoomList';

export default function ChatPage() {
  return (
    <ChatRoomList
      title="Chat"
      subtitle="Join a room to start chatting in real time."
      roomPath={paths.chatRoom}
      formIdPrefix="chat"
    />
  );
}
