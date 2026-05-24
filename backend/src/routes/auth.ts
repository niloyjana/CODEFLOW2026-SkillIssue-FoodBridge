import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import * as admin from 'firebase-admin';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Helper to convert Firestore Timestamps to ISO strings for client compatibility
export function serializeData(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }
  const result = { ...data };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (val && typeof val.toDate === 'function') {
      result[key] = val.toDate().toISOString();
    } else if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        result[key] = val.map((item: any) => (item && typeof item === 'object' && !(item instanceof admin.firestore.Timestamp)) ? serializeData(item) : (item && typeof item.toDate === 'function' ? item.toDate().toISOString() : item));
      } else if (!(val instanceof admin.firestore.Timestamp)) {
        result[key] = serializeData(val);
      } else {
        result[key] = val.toDate().toISOString();
      }
    }
  }
  return result;
}


// POST /api/auth/register
router.post('/register', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, type } = req.body;
    const firebaseUser = req.user;

    if (!name || !email || !type) {
      res.status(400).json({ error: 'Name, email, and type are required' });
      return;
    }

    if (type !== 'restaurant' && type !== 'individual' && type !== 'shelter') {
      res.status(400).json({ error: 'Invalid user type. Must be restaurant, individual, or shelter' });
      return;
    }

    // Verify token email matches registration email
    if (firebaseUser.email.toLowerCase() !== email.toLowerCase()) {
      res.status(403).json({ error: 'Token email does not match registration email' });
      return;
    }

    const uid = firebaseUser.uid;

    // Check if user already exists in Firestore
    const userDocRef = db.collection('users').doc(uid);
    const userDocSnapshot = await userDocRef.get();
    if (userDocSnapshot.exists) {
      res.status(400).json({ error: 'User profile already exists' });
      return;
    }

    // Create user record in Firestore
    const userDoc: any = {
      id: uid,
      email,
      name,
      type,
      points: 0,
      completedPickups: 0,
      totalKgSaved: 0,
      badges: [],
      address: req.body.address || '',
      lat: Number(req.body.lat) || 40.7128,
      lng: Number(req.body.lng) || -74.0060,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (type === 'shelter') {
      userDoc.capacity = Number(req.body.capacity) || 0;
      userDoc.licenseNumber = req.body.licenseNumber || '';
      userDoc.verified = true; // Auto-verify for college hackathon prototype
      userDoc.peopleServed = 0;
    } else if (type === 'individual') {
      userDoc.phone = req.body.phone || '';
    }

    await userDocRef.set(userDoc);

    const savedDoc = await userDocRef.get();
    const responseData = serializeData({ id: uid, ...savedDoc.data() });

    res.status(201).json(responseData);
  } catch (err: any) {
    console.error('Error in /register:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, type } = req.body;
    const firebaseUser = req.user;

    if (!email || !type) {
      res.status(400).json({ error: 'Email and type are required' });
      return;
    }

    // Verify token email matches login email
    if (firebaseUser.email.toLowerCase() !== email.toLowerCase()) {
      res.status(403).json({ error: 'Token email does not match login email' });
      return;
    }

    const uid = firebaseUser.uid;

    // Query Firestore users collection by uid
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'User profile not found in Firestore. Please register.' });
      return;
    }

    const userData = userDoc.data();
    if (userData?.type !== type) {
      res.status(401).json({ error: 'Invalid user type' });
      return;
    }

    const responseData = serializeData({ id: userDoc.id, ...userData });
    res.status(200).json(responseData);
  } catch (err: any) {
    console.error('Error in /login:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

export default router;
