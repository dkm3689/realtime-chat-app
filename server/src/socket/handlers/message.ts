import { Server, Socket } from 'socket.io';
import { pool } from '../../config/database';

export function registerMessageHandlers(io: Server, socket: Socket) {
  socket.on('message:send', async (data: { roomId: string; content: string }) => {
    const user = (socket as any).user as {
      id: string;
      username: string;
      avatarColor: string;
    };

    if (!data.roomId || !data.content?.trim()) return;

    try {
      const result = await pool.query(
        `INSERT INTO messages (room_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, content, created_at, room_id`,
        [data.roomId, user.id, data.content.trim()]
      );

      const message = {
        ...result.rows[0],
        user_id: user.id,
        username: user.username,
        avatar_color: user.avatarColor,
      };

      // Redis adapter fans this out to all server instances automatically
      io.to(`room:${data.roomId}`).emit('message:new', message);
    } catch {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
}
