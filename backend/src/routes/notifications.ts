import { Router, Response } from 'express';
import { db } from '../config/firebase';
import * as admin from 'firebase-admin';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { serializeData } from './auth';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const firebaseUser = req.user;
    const snapshot = await db.collection('notifications')
      .where('recipientId', '==', firebaseUser.uid)
      .get();

    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort in-memory by createdAt desc to avoid requiring a composite index in Firestore
    notifications.sort((a: any, b: any) => {
      const getMs = (val: any) => {
        if (!val) return 0;
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        if (val.seconds) return val.seconds * 1000;
        return new Date(val).getTime();
      };
      return getMs(b.createdAt) - getMs(a.createdAt);
    });

    res.status(200).json(serializeData(notifications));
  } catch (err: any) {
    console.error('Error in GET /api/notifications:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const firebaseUser = req.user;
    const docRef = db.collection('notifications').doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    const notifData = snapshot.data();
    if (notifData?.recipientId !== firebaseUser.uid) {
      res.status(403).json({ error: 'Forbidden: Cannot mark another user\'s notification as read' });
      return;
    }

    await docRef.update({ read: true });
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Error in POST /api/notifications/:id/read:', err);
    res.status(500).json({ error: err.message || 'Failed to mark notification as read' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const firebaseUser = req.user;
    const snapshot = await db.collection('notifications')
      .where('recipientId', '==', firebaseUser.uid)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();

    res.status(200).json({ success: true, count: snapshot.size });
  } catch (err: any) {
    console.error('Error in POST /api/notifications/read-all:', err);
    res.status(500).json({ error: err.message || 'Failed to mark all as read' });
  }
});

export default router;
