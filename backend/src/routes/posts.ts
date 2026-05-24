import { Router, Response } from 'express';
import { db } from '../config/firebase';
import * as admin from 'firebase-admin';
import { serializeData } from './auth';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Haversine formula to compute distance between two coordinates
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// GET /api/posts
// Protected by requireAuth
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, restaurantId, userId, lat, lng, radius } = req.query;

    let query: admin.firestore.Query = db.collection('posts');

    if (status) {
      query = query.where('status', '==', status);
    }
    if (restaurantId) {
      query = query.where('restaurantId', '==', restaurantId);
    }
    if (userId) {
      query = query.where('claimedBy', '==', userId);
    }

    if (restaurantId) {
      query = query.orderBy('createdAt', 'desc');
    } else if (status) {
      query = query.orderBy('pickupBy', 'asc');
    } else {
      query = query.orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();
    let posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (lat && lng && radius) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const rad = parseFloat(radius as string);

      posts = posts.filter((p: any) => {
        if (p.lat === undefined || p.lng === undefined) return false;
        const dist = getDistance(latitude, longitude, p.lat, p.lng);
        return dist <= rad;
      });
    }

    res.status(200).json(serializeData(posts));
  } catch (err: any) {
    console.error('Error in GET /api/posts:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch posts' });
  }
});

// POST /api/posts
// Protected by requireAuth
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { portions, mealTime, venueType, seatingCapacity, currentUser } = req.body;
    const firebaseUser = req.user;

    if (portions === undefined || !mealTime || !venueType || seatingCapacity === undefined || !currentUser) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    // Verify token UID matches post creator UID
    if (currentUser.id !== firebaseUser.uid) {
      res.status(403).json({ error: 'Forbidden: Cannot create post on behalf of another user' });
      return;
    }

    // AI Prediction simulation formula
    const portionsFactor = portions * 0.18;
    const capacityFactor = (seatingCapacity / 100) * (mealTime === 'dinner' ? 1.4 : 0.8);
    const venueFactor = venueType === 'fastfood' ? 0.9 : venueType === 'restaurant' ? 0.5 : 0.2;
    const predictedWasteKg = Math.max(0.5, parseFloat((portionsFactor + capacityFactor + venueFactor).toFixed(2)));

    const pickupTime = new Date();
    pickupTime.setHours(pickupTime.getHours() + 4);

    const postRef = db.collection('posts').doc(); // auto ID

    const newPost = {
      id: postRef.id,
      restaurantId: currentUser.id,
      restaurantName: currentUser.name,
      portions,
      predictedWasteKg,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      pickupBy: admin.firestore.Timestamp.fromDate(pickupTime),
      address: currentUser.address || 'Mock Restaurant Address',
      lat: currentUser.lat || 40.7128,
      lng: currentUser.lng || -74.0060,
    };

    // Run in a transaction to update both post and restaurant user stats
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(currentUser.id);
      const userSnapshot = await transaction.get(userRef);

      if (!userSnapshot.exists) {
        throw new Error('Restaurant user does not exist');
      }

      transaction.set(postRef, newPost);
      transaction.update(userRef, {
        points: admin.firestore.FieldValue.increment(10),
        totalKgSaved: admin.firestore.FieldValue.increment(predictedWasteKg),
      });
    });

    const savedDoc = await postRef.get();
    res.status(201).json(serializeData(savedDoc.data()));
  } catch (err: any) {
    console.error('Error in POST /api/posts:', err);
    res.status(500).json({ error: err.message || 'Failed to create post' });
  }
});

// POST /api/posts/claim
// Protected by requireAuth
router.post('/claim', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId, userId } = req.body;
    const firebaseUser = req.user;

    if (!postId || !userId) {
      res.status(400).json({ error: 'Post ID and User ID are required' });
      return;
    }

    // Verify token UID matches claiming user UID
    if (userId !== firebaseUser.uid) {
      res.status(403).json({ error: 'Forbidden: Cannot claim post on behalf of another user' });
      return;
    }

    const postRef = db.collection('posts').doc(postId);
    const userRef = db.collection('users').doc(userId);
    const claimRef = db.collection('claims').doc(); // Auto-generated ID

    const updatedPost = await db.runTransaction(async (transaction) => {
      const postSnapshot = await transaction.get(postRef);
      const userSnapshot = await transaction.get(userRef);

      if (!postSnapshot.exists) {
        throw new Error('Post not found');
      }

      if (!userSnapshot.exists) {
        throw new Error('User not found');
      }

      const postData = postSnapshot.data();
      const userData = userSnapshot.data();

      if (postData?.status !== 'active') {
        throw new Error('Post is already claimed or completed');
      }

      if (userData?.type !== 'individual') {
        throw new Error('Only individual volunteers can claim posts');
      }

      // Claim record details
      const newClaim = {
        id: claimRef.id,
        postId,
        userId,
        claimedAt: admin.firestore.FieldValue.serverTimestamp(),
        pointsAwarded: 15,
      };

      // Calculate badges for volunteer
      const newCompletedPickups = (userData.completedPickups || 0) + 1;
      const currentBadges: string[] = userData.badges || [];
      if (newCompletedPickups >= 15 && !currentBadges.includes('Surplus Savior')) {
        currentBadges.push('Surplus Savior');
      }
      if (newCompletedPickups >= 10 && !currentBadges.includes('Community Hero')) {
        currentBadges.push('Community Hero');
      }
      if (newCompletedPickups >= 1 && !currentBadges.includes('First Step')) {
        currentBadges.push('First Step');
      }

      transaction.update(postRef, {
        status: 'claimed',
        claimedBy: userId,
        claimedByName: userData.name,
      });

      transaction.set(claimRef, newClaim);

      transaction.update(userRef, {
        points: admin.firestore.FieldValue.increment(15),
        completedPickups: admin.firestore.FieldValue.increment(1),
        badges: currentBadges,
      });

      return {
        ...postData,
        id: postId,
        status: 'claimed',
        claimedBy: userId,
        claimedByName: userData.name,
      };
    });

    res.status(200).json(serializeData(updatedPost));
  } catch (err: any) {
    console.error('Error in /claim:', err);
    res.status(500).json({ error: err.message || 'Failed to claim post' });
  }
});

// POST /api/posts/:postId/complete
router.post('/:postId/complete', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    const firebaseUser = req.user;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (userId !== firebaseUser.uid) {
      res.status(403).json({ error: 'Forbidden: Action user does not match token UID' });
      return;
    }

    const postRef = db.collection('posts').doc(postId);
    const postSnapshot = await postRef.get();

    if (!postSnapshot.exists) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const postData = postSnapshot.data();

    if (postData?.claimedBy !== userId) {
      res.status(403).json({ error: 'Forbidden: Only the claiming user can mark this post as completed' });
      return;
    }

    if (postData?.status !== 'claimed') {
      res.status(400).json({ error: 'Post is not in claimed status' });
      return;
    }

    await postRef.update({ status: 'completed' });

    // Create notification for the donor
    const notificationRef = db.collection('notifications').doc();
    const newNotification = {
      id: notificationRef.id,
      recipientId: postData.restaurantId,
      title: 'Donation Received! ❤️',
      message: `Your donation of "${postData.mealTime || 'food'}" has been marked as distributed/delivered to neighbors by ${postData.claimedByName || 'a shelter/volunteer'}.`,
      type: 'complete',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      postId: postId,
    };
    await notificationRef.set(newNotification);

    res.status(200).json(serializeData({
      ...postData,
      id: postId,
      status: 'completed'
    }));
  } catch (err: any) {
    console.error('Error in POST /posts/:postId/complete:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to complete post' });
  }
});

export default router;
