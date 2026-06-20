import { Router, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT r.*,
        u.username AS created_by_username,
        COUNT(m.id)::int AS message_count
      FROM rooms r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN messages m ON m.room_id = r.id
      GROUP BY r.id, u.username
      ORDER BY r.created_at ASC
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  if (!name?.trim()) {
    res.status(400).json({ error: 'Room name is required' });
    return;
  }
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (!slug) {
    res.status(400).json({ error: 'Invalid room name' });
    return;
  }
  try {
    const result = await pool.query(
      `INSERT INTO rooms (name, description, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [slug, description?.trim() || null, req.user!.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'A room with that name already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

export default router;
