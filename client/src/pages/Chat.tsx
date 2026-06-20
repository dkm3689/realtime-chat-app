import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Room, Message, TypingUpdate } from '../types';
import { roomsApi } from '../api/rooms';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import OnlineUsers from '../components/OnlineUsers';

export default function Chat() {
  const { user, logout } = useAuth();
  const { socket, onlineUsers, isConnected } = useSocket();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Load rooms once on mount
  useEffect(() => {
    roomsApi.getAll().then(({ data }) => {
      setRooms(data);
      if (data.length > 0) setCurrentRoom(data[0]);
    });
  }, []);

  // Load messages whenever the room changes
  useEffect(() => {
    if (!currentRoom) return;
    setIsLoadingMessages(true);
    setMessages([]);
    setTypingUsers(new Map());

    roomsApi.getMessages(currentRoom.id).then(({ data }) => {
      setMessages(data);
      setHasMore(data.length === 50);
      setIsLoadingMessages(false);
    });
  }, [currentRoom]);

  // Register socket event listeners for the current room
  useEffect(() => {
    if (!socket || !currentRoom) return;

    socket.emit('room:join', currentRoom.id);

    function onNewMessage(msg: Message) {
      setMessages((prev) => [...prev, msg]);
    }

    function onTypingUpdate({ userId, username, isTyping }: TypingUpdate) {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (isTyping) {
          next.set(userId, username);
        } else {
          next.delete(userId);
        }
        return next;
      });
    }

    socket.on('message:new', onNewMessage);
    socket.on('typing:update', onTypingUpdate);

    return () => {
      socket.emit('room:leave', currentRoom.id);
      socket.off('message:new', onNewMessage);
      socket.off('typing:update', onTypingUpdate);
      setTypingUsers(new Map());
    };
  }, [socket, currentRoom]);

  const loadMoreMessages = useCallback(async () => {
    if (!currentRoom || messages.length === 0 || !hasMore) return;
    const oldest = messages[0].created_at;
    const { data } = await roomsApi.getMessages(currentRoom.id, oldest);
    setMessages((prev) => [...data, ...prev]);
    setHasMore(data.length === 50);
  }, [currentRoom, messages, hasMore]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !currentRoom) return;
      socket.emit('message:send', { roomId: currentRoom.id, content });
    },
    [socket, currentRoom]
  );

  const createRoom = useCallback(async (name: string, description?: string) => {
    const { data } = await roomsApi.create({ name, description });
    setRooms((prev) => [...prev, data]);
    setCurrentRoom(data);
  }, []);

  return (
    <div className="chat-layout">
      <aside className="sidebar">
        <Sidebar
          rooms={rooms}
          currentRoom={currentRoom}
          onSelectRoom={setCurrentRoom}
          onCreateRoom={createRoom}
          user={user!}
          onLogout={logout}
          isConnected={isConnected}
        />
      </aside>

      <main className="chat-main">
        <ChatWindow
          room={currentRoom}
          messages={messages}
          typingUsers={typingUsers}
          currentUserId={user!.id}
          socket={socket}
          isLoading={isLoadingMessages}
          hasMore={hasMore}
          onLoadMore={loadMoreMessages}
          onSendMessage={sendMessage}
        />
      </main>

      <aside className="online-panel">
        <OnlineUsers users={onlineUsers} currentUserId={user!.id} />
      </aside>
    </div>
  );
}
