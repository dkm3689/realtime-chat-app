import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { env } from '../config/env';
import { redisPub, redisSub } from '../config/redis';
import { pool } from '../config/database';
import { registerMessageHandlers } from './handlers/message';
import { registerTypingHandlers } from './handlers/typing';
import { registerPresenceHandlers } from './handlers/presence';

export function initSocket(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: env.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
  });

  // Redis adapter — distributes events across all server instances
  io.adapter(createAdapter(redisPub, redisSub));

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        id: string;
        username: string;
        email: string;
      };

      const { rows } = await pool.query('SELECT avatar_color FROM users WHERE id = $1', [decoded.id]);
      (socket as any).user = { ...decoded, avatarColor: rows[0]?.avatar_color ?? '#6366f1' };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const user = (socket as any).user as { id: string; username: string };
    console.log(`[socket] ${user.username} connected (${socket.id})`);

    socket.on('room:join', (roomId: string) => {
      socket.join(`room:${roomId}`);
      socket.emit('room:joined', roomId);
    });

    socket.on('room:leave', (roomId: string) => {
      socket.leave(`room:${roomId}`);
    });

    registerMessageHandlers(io, socket);
    registerTypingHandlers(io, socket);
    await registerPresenceHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`[socket] ${user.username} disconnected`);
    });
  });

  return io;
}
