import { Router, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/:roomId', async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const before = req.query.before as string | undefined;

  try {
    const params: (string | number)[] = [roomId, limit];
    let cursorClause = '';
    if (before) {
      cursorClause = `AND m.created_at < $3`;
      params.push(before);
    }

    const result = await pool.query(
      `SELECT m.id, m.content, m.created_at, m.room_id,
         u.id AS user_id, u.username, u.avatar_color
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1 ${cursorClause}
       ORDER BY m.created_at DESC
       LIMIT $2`,
      params
    );

    res.json(result.rows.reverse());
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
