import { useEffect, useRef, useState, type FormEvent } from 'react';
import { io, type Socket } from 'socket.io-client';

import { ChatSocketEvent } from '../enums/chat-socket-event.enum';
import type { ChatMessageEntity, ChatRoomEntity } from '../lib/types';
import { Button } from './Button';
import { Card } from './Card';

interface JoinedRoomPayload {
  room: ChatRoomEntity;
  messages: ChatMessageEntity[];
  success: boolean;
}

interface PresencePayload {
  userId: string;
  userName: string;
  roomId: string;
}

interface ErrorPayload {
  message: string;
  event: string;
}

interface ChatWindowProps {
  socketUrl: string;
  token: string;
  room: ChatRoomEntity;
  messages: ChatMessageEntity[];
  currentUserId: string;
  isAdmin: boolean;
}

export function ChatWindow({
  socketUrl,
  token,
  room,
  messages: initialMessages,
  currentUserId,
  isAdmin,
}: ChatWindowProps) {
  const otherParticipant = room.isDirect
    ? room.participants.find((participant) => participant.id !== currentUserId)
    : undefined;
  const displayName = otherParticipant?.name ?? room.name;

  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessageEntity[]>(initialMessages);
  const [connected, setConnected] = useState(false);
  const [presence, setPresence] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcastDraft, setBroadcastDraft] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    const socket = io(socketUrl, {
      extraHeaders: { Authorization: `Bearer ${token}` },
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketUrl, token]);

  useEffect(() => {
    const socket = socketRef.current;
    setMessages(initialMessages);
    setPresence(null);
    setError(null);

    if (!socket) {
      return;
    }

    const handleJoinedRoom = (payload: JoinedRoomPayload) => {
      setMessages(payload.messages);
    };
    const handleNewMessage = (payload: ChatMessageEntity) => {
      setMessages((prev) => [...prev, payload]);
    };
    const handleUserJoined = (payload: PresencePayload) => {
      setPresence(`${payload.userName} joined the room`);
    };
    const handleUserLeft = (payload: PresencePayload) => {
      setPresence(`${payload.userName} left the room`);
    };
    const handleMessageSent = () => {
      setSending(false);
      setDraft('');
    };
    const handleBroadcastSent = () => {
      setBroadcasting(false);
      setBroadcastDraft('');
    };
    const handleError = (payload: ErrorPayload) => {
      setSending(false);
      setBroadcasting(false);
      setError(payload.message);
    };

    socket.on(ChatSocketEvent.JoinedRoom, handleJoinedRoom);
    socket.on(ChatSocketEvent.NewMessage, handleNewMessage);
    socket.on(ChatSocketEvent.UserJoined, handleUserJoined);
    socket.on(ChatSocketEvent.UserLeft, handleUserLeft);
    socket.on(ChatSocketEvent.MessageSent, handleMessageSent);
    socket.on(ChatSocketEvent.BroadcastSent, handleBroadcastSent);
    socket.on(ChatSocketEvent.Error, handleError);

    socket.emit(ChatSocketEvent.JoinRoom, { roomId: Number(room.id) });

    return () => {
      socket.emit(ChatSocketEvent.LeaveRoom, { roomId: Number(room.id) });
      socket.off(ChatSocketEvent.JoinedRoom, handleJoinedRoom);
      socket.off(ChatSocketEvent.NewMessage, handleNewMessage);
      socket.off(ChatSocketEvent.UserJoined, handleUserJoined);
      socket.off(ChatSocketEvent.UserLeft, handleUserLeft);
      socket.off(ChatSocketEvent.MessageSent, handleMessageSent);
      socket.off(ChatSocketEvent.BroadcastSent, handleBroadcastSent);
      socket.off(ChatSocketEvent.Error, handleError);
    };
  }, [room.id]);

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || !socketRef.current) {
      return;
    }

    setError(null);
    setSending(true);

    socketRef.current.emit(ChatSocketEvent.SendMessage, {
      roomId: Number(room.id),
      message,
    });
  }

  function handleBroadcast(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = broadcastDraft.trim();
    if (!message || !socketRef.current) {
      return;
    }

    setError(null);
    setBroadcasting(true);

    socketRef.current.emit(ChatSocketEvent.AdminBroadcast, { message });
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{displayName}</h1>
          {!room.isDirect && room.description && <p className="text-slate-500 text-sm mt-0.5">{room.description}</p>}
          {room.isDirect && otherParticipant && (
            <p className="text-slate-500 text-sm mt-0.5">{otherParticipant.email}</p>
          )}
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            connected
              ? 'bg-green-50 text-green-700 border border-green-100'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {connected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      {presence && <p className="text-xs text-slate-400 shrink-0">{presence}</p>}
      {error && <p className="text-sm text-red-600 shrink-0">{error}</p>}

      <Card className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="text-slate-400 text-sm m-auto">No messages yet. Say hello!</p>
        ) : (
          messages.map((message) => {
            const isOwn = message.userId === currentUserId;
            return (
              <div key={message.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    message.isAdminBroadcast
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : isOwn
                        ? 'bg-blue-50 text-blue-900 border border-blue-100'
                        : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {message.isAdminBroadcast && (
                    <p className="text-xs font-bold uppercase tracking-wide mb-1">Announcement</p>
                  )}
                  <p>{message.message}</p>
                </div>
                <span className="text-xs text-slate-400 mt-1">{isOwn ? 'You' : message.user.name}</span>
              </div>
            );
          })
        )}
      </Card>

      <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message..."
          className="flex-grow rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button type="submit" disabled={sending || !draft.trim()}>
          Send
        </Button>
      </form>

      {isAdmin && !room.isDirect && (
        <Card className="p-4 space-y-2 bg-amber-50/50 border-amber-200 shrink-0">
          <p className="text-sm font-bold text-amber-900">Broadcast to all rooms</p>
          <form onSubmit={handleBroadcast} className="flex gap-2">
            <input
              value={broadcastDraft}
              onChange={(event) => setBroadcastDraft(event.target.value)}
              placeholder="Announcement message..."
              className="flex-grow rounded-xl border border-amber-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <Button type="submit" variant="secondary" disabled={broadcasting || !broadcastDraft.trim()}>
              Broadcast
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
