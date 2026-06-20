import { Server, Socket } from 'socket.io';
import { redis } from '../../config/redis';

const ONLINE_KEY = 'chat:online_users';

export async function registerPresenceHandlers(io: Server, socket: Socket) {
  const user = (socket as any).user as { id: string; username: string; avatarColor: string };

  await redis.hset(
    ONLINE_KEY,
    user.id,
    JSON.stringify({ id: user.id, username: user.username, avatarColor: user.avatarColor })
  );

  io.emit('presence:online_users', await getOnlineUsers());

  socket.on('disconnect', async () => {
    await redis.hdel(ONLINE_KEY, user.id);
    io.emit('presence:online_users', await getOnlineUsers());
  });
}

async function getOnlineUsers() {
  const raw = await redis.hgetall(ONLINE_KEY);
  return Object.values(raw || {}).map((v) => JSON.parse(v));
}
