import api from './axios';
import { Room, Message } from '../types';

export const roomsApi = {
  getAll: () => api.get<Room[]>('/rooms'),

  create: (data: { name: string; description?: string }) => api.post<Room>('/rooms', data),

  getMessages: (roomId: string, before?: string) =>
    api.get<Message[]>(`/messages/${roomId}`, {
      params: { limit: 50, ...(before ? { before } : {}) },
    }),
};
