export interface User {
  id: string;
  username: string;
  email: string;
  avatar_color: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_by_username: string | null;
  message_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  room_id: string;
  user_id: string;
  username: string;
  avatar_color: string;
  created_at: string;
}

export interface OnlineUser {
  id: string;
  username: string;
  avatarColor: string;
}

export interface TypingUpdate {
  userId: string;
  username: string;
  isTyping: boolean;
}
