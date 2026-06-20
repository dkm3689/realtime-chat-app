import { useEffect, useRef, useState, KeyboardEvent, ChangeEvent, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Message as MessageType, Room } from '../types';
import Message from './Message';

interface Props {
  room: Room | null;
  messages: MessageType[];
  typingUsers: Map<string, string>;
  currentUserId: string;
  socket: Socket | null;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSendMessage: (content: string) => void;
}

export default function ChatWindow({
  room,
  messages,
  typingUsers,
  currentUserId,
  socket,
  isLoading,
  hasMore,
  onLoadMore,
  onSendMessage,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopTyping = useCallback(() => {
    if (isTypingRef.current && socket && room) {
      socket.emit('typing:stop', { roomId: room.id });
      isTypingRef.current = false;
    }
  }, [socket, room]);

  function handleInputChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);

    if (!socket || !room) return;

    if (!isTypingRef.current) {
      socket.emit('typing:start', { roomId: room.id });
      isTypingRef.current = true;
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, 2000);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function send() {
    const content = input.trim();
    if (!content || !room) return;
    onSendMessage(content);
    setInput('');
    stopTyping();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  }

  const typingList = Array.from(typingUsers.values());

  if (!room) {
    return (
      <div className="chat-empty">
        <p>Select a room to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span className="chat-room-hash">#</span>
        <span className="chat-room-name">{room.name}</span>
        {room.description && <span className="chat-room-desc">{room.description}</span>}
      </div>

      <div className="messages-container">
        {hasMore && (
          <button className="load-more-btn" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load earlier messages'}
          </button>
        )}

        {isLoading && messages.length === 0 && (
          <div className="messages-loading">Loading messages...</div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="messages-empty">
            <p>No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const showAvatar =
            !prev ||
            prev.user_id !== msg.user_id ||
            new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000;

          return (
            <Message
              key={msg.id}
              message={msg}
              isOwn={msg.user_id === currentUserId}
              showAvatar={showAvatar}
            />
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        {typingList.length > 0 && (
          <div className="typing-indicator">
            <span className="typing-dots">
              <span /><span /><span />
            </span>
            <span>
              {typingList.length === 1
                ? `${typingList[0]} is typing`
                : `${typingList.slice(0, -1).join(', ')} and ${typingList[typingList.length - 1]} are typing`}
            </span>
          </div>
        )}

        <div className="input-row">
          <textarea
            className="message-input"
            placeholder={`Message #${room.name}`}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={!socket}
          />
          <button
            className="btn-primary send-btn"
            onClick={send}
            disabled={!input.trim() || !socket}
            title="Send (Enter)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
