import { useState, FormEvent } from 'react';
import { Room, User } from '../types';

interface Props {
  rooms: Room[];
  currentRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  onCreateRoom: (name: string, description?: string) => Promise<void>;
  user: User;
  onLogout: () => void;
  isConnected: boolean;
}

export default function Sidebar({
  rooms,
  currentRoom,
  onSelectRoom,
  onCreateRoom,
  user,
  onLogout,
  isConnected,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleCreateRoom(e: FormEvent) {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreating(true);
    setFormError('');
    try {
      await onCreateRoom(roomName.trim(), roomDesc.trim() || undefined);
      setRoomName('');
      setRoomDesc('');
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="sidebar-inner">
      <div className="sidebar-brand">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#6366f1" />
        </svg>
        <span>ChatApp</span>
        <span className={`connection-dot ${isConnected ? 'online' : 'offline'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>Rooms</span>
          <button className="btn-icon" onClick={() => setShowForm((v) => !v)} title="New room">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {showForm && (
          <form className="create-room-form" onSubmit={handleCreateRoom}>
            <input
              type="text"
              placeholder="room-name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              autoFocus
              maxLength={50}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={roomDesc}
              onChange={(e) => setRoomDesc(e.target.value)}
              maxLength={200}
            />
            {formError && <p className="form-error">{formError}</p>}
            <div className="create-room-actions">
              <button type="submit" className="btn-primary btn-sm" disabled={creating}>
                {creating ? '...' : 'Create'}
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => { setShowForm(false); setFormError(''); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <ul className="room-list">
          {rooms.map((room) => (
            <li key={room.id}>
              <button
                className={`room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => onSelectRoom(room)}
              >
                <span className="room-hash">#</span>
                <span className="room-name">{room.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-user">
        <div
          className="avatar"
          style={{ backgroundColor: user.avatar_color }}
        >
          {user.username[0].toUpperCase()}
        </div>
        <div className="user-info">
          <span className="user-name">{user.username}</span>
          <span className="user-status">Online</span>
        </div>
        <button className="btn-icon logout-btn" onClick={onLogout} title="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
