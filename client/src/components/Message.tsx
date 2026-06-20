import { Message as MessageType } from '../types';

interface Props {
  message: MessageType;
  isOwn: boolean;
  showAvatar: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Message({ message, isOwn, showAvatar }: Props) {
  return (
    <div className={`message ${isOwn ? 'message-own' : ''} ${!showAvatar ? 'message-grouped' : ''}`}>
      {showAvatar ? (
        <div className="avatar avatar-sm" style={{ backgroundColor: message.avatar_color }}>
          {message.username[0].toUpperCase()}
        </div>
      ) : (
        <div className="avatar-placeholder" />
      )}
      <div className="message-body">
        {showAvatar && (
          <div className="message-meta">
            <span className="message-author">{message.username}</span>
            <span className="message-time">{formatTime(message.created_at)}</span>
          </div>
        )}
        <div className="message-bubble">
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  );
}
