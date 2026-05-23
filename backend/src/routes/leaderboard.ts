import { Router, Response } from 'express';
import { db } from '../config/firebase';
import { serializeData } from './auth';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/leaderboard
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type } = req.query;

    // Fetch all users. We can filter and sort in memory to avoid needing composite indexes.
    const snapshot = await db.collection('users').get();
    let entries = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      points: doc.data().points || 0,
      userType: doc.data().type || 'individual',
      completedPickups: doc.data().completedPickups || 0,
      totalKgSaved: doc.data().totalKgSaved || 0,
      badges: doc.data().badges || [],
    }));

    if (type) {
      const filterType = type === 'restaurants' ? 'restaurant' : 'individual';
      entries = entries.filter(e => e.userType === filterType);
    }

    // Sort by points descending
    entries.sort((a, b) => b.points - a.points);

    res.status(200).json(serializeData(entries));
  } catch (err: any) {
    console.error('Error in /leaderboard:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch leaderboard' });
  }
});

export default router;
