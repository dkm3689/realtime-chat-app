import { Server, Socket } from 'socket.io';

export function registerTypingHandlers(_io: Server, socket: Socket) {
  const user = (socket as any).user as { id: string; username: string };

  socket.on('typing:start', (data: { roomId: string }) => {
    if (!data.roomId) return;
    socket.to(`room:${data.roomId}`).emit('typing:update', {
      userId: user.id,
      username: user.username,
      isTyping: true,
    });
  });

  socket.on('typing:stop', (data: { roomId: string }) => {
    if (!data.roomId) return;
    socket.to(`room:${data.roomId}`).emit('typing:update', {
      userId: user.id,
      username: user.username,
      isTyping: false,
    });
  });
}
