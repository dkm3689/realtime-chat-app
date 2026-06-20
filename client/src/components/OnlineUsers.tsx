import { OnlineUser } from '../types';

interface Props {
  users: OnlineUser[];
  currentUserId: string;
}

export default function OnlineUsers({ users, currentUserId }: Props) {
  return (
    <div className="online-panel-inner">
      <div className="online-panel-header">
        Online — {users.length}
      </div>
      <ul className="online-list">
        {users.map((u) => (
          <li key={u.id} className="online-user">
            <div className="online-avatar-wrap">
              <div className="avatar avatar-sm" style={{ backgroundColor: u.avatarColor }}>
                {u.username[0].toUpperCase()}
              </div>
              <span className="online-indicator" />
            </div>
            <span className="online-username">
              {u.username}
              {u.id === currentUserId && <span className="you-tag"> (you)</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
