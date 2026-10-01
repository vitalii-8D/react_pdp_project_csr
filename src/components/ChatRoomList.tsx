import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { chatRoomsQuery, myDirectMessageRoomsQuery, createChatRoomMutation } from '../lib/graphql/chat';
import { ChatFormField } from '../enums/chat-form-field.enum';
import { UserRole } from '../enums/user-role.enum';
import { useQuery } from '../hooks/useQuery';
import { errorMessage } from '../lib/error-message';
import { Card } from './Card';
import { Button } from './Button';
import { TextField } from './TextField';
import { UserSearch } from './UserSearch';
import { ErrorMessage, PageSkeleton } from './PageStatus';

interface ChatRoomListProps {
  title: string;
  subtitle: string;
  roomPath: (id: string) => string;
  // Loads the room page chunk (and its transport library) on hover/focus of a room link.
  preloadRoom: () => unknown;
  formIdPrefix: string;
}

// Shared by ChatPage (Socket.IO) and ChatV2Page (GraphQL subscriptions) - the two transports
// render an identical room list / DM search / room-creation form over the same rooms, differing
// only in copy and the room link target.
export function ChatRoomList({ title, subtitle, roomPath, preloadRoom, formIdPrefix }: ChatRoomListProps) {
  const { token, user } = useAuth();
  const {
    data,
    error: loadError,
    setData,
  } = useQuery(token ? 'chat-rooms' : null, () =>
    Promise.all([chatRoomsQuery(token ?? ''), myDirectMessageRoomsQuery(token ?? '')]),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const isAdmin = user?.role === UserRole.ADMIN;

  async function handleCreateRoom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !isAdmin) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get(ChatFormField.Name) ?? '').trim();
    const description = String(formData.get(ChatFormField.Description) ?? '').trim();

    setPending(true);
    setError(undefined);
    try {
      const room = await createChatRoomMutation(token, {
        name,
        ...(description && { description }),
      });
      setData((prev) => prev && [[...prev[0], room], prev[1]]);
      form.reset();
    } catch (submitError) {
      setError(errorMessage(submitError, 'Could not create the room.'));
    } finally {
      setPending(false);
    }
  }

  if (!user) {
    return null;
  }

  const [rooms, directRooms] = data ?? [[], []];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1">{subtitle}</p>
      </div>

      {loadError && <ErrorMessage message={loadError} />}
      {!data && !loadError && <PageSkeleton />}

      {!data ? null : rooms.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-400 text-lg">No chat rooms yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <Link key={room.id} to={roomPath(room.id)} onMouseEnter={preloadRoom} onFocus={preloadRoom}>
              <Card className="p-5 h-full hover:border-blue-200 hover:shadow-md transition-all">
                <h2 className="font-bold text-slate-900">{room.name}</h2>
                {room.description && <p className="text-sm text-slate-500 mt-1">{room.description}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Direct Messages</h2>
          <p className="text-slate-500 text-sm mt-1">Search for a user to start a private conversation.</p>
        </div>

        <UserSearch roomPath={roomPath} />

        {directRooms.length > 0 && (
          <div className="space-y-3">
            {directRooms.map((room) => {
              const otherParticipant = room.participants.find((participant) => participant.id !== user.id);
              return (
                <Link key={room.id} to={roomPath(room.id)} onMouseEnter={preloadRoom} onFocus={preloadRoom}>
                  <Card className="p-4 hover:border-blue-200 hover:shadow-md transition-all">
                    <h3 className="font-bold text-slate-900">{otherParticipant?.name ?? room.name}</h3>
                    {otherParticipant && <p className="text-sm text-slate-500">{otherParticipant.email}</p>}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {isAdmin && (
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Create a room</h2>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <TextField id={`${formIdPrefix}-room-name`} name={ChatFormField.Name} label="Name" required />
            <TextField
              id={`${formIdPrefix}-room-description`}
              name={ChatFormField.Description}
              label="Description (optional)"
            />
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating...' : 'Create room'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
