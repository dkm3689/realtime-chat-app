import http from 'http';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { pool } from './config/database';
import { redis } from './config/redis';
import authRoutes from './routes/auth';
import roomsRoutes from './routes/rooms';
import messagesRoutes from './routes/messages';
import { initSocket } from './socket';

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/messages', messagesRoutes);

initSocket(server);

server.listen(env.PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log('[db] PostgreSQL connected');
    await redis.ping();
    console.log('[redis] Redis connected');
    console.log(`[server] Listening on http://localhost:${env.PORT}`);
  } catch (err) {
    console.error('[server] Startup failed:', err);
    process.exit(1);
  }
});
