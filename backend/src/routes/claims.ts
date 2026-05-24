import { Router, Response } from 'express';
import { db } from '../config/firebase';
import * as admin from 'firebase-admin';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { serializeData } from './auth';

const router = Router();

// POST /api/claims/individual
router.post('/individual', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId, userId } = req.body;
    const firebaseUser = req.user;

    if (!postId || !userId) {
      res.status(400).json({ error: 'Post ID and User ID are required' });
      return;
    }

    if (userId !== firebaseUser.uid) {
      res.status(403).json({ error: 'Forbidden: Cannot claim on behalf of another user' });
      return;
    }

    const postRef = db.collection('posts').doc(postId);
    const userRef = db.collection('users').doc(userId);
    const claimRef = db.collection('claims').doc();

    const updatedPost = await db.runTransaction(async (transaction) => {
      const postSnapshot = await transaction.get(postRef);
      const userSnapshot = await transaction.get(userRef);

      if (!postSnapshot.exists) {
        throw new Error('Post not found');
      }
      if (!userSnapshot.exists) {
        throw new Error('User profile not found');
      }

      const postData = postSnapshot.data();
      const userData = userSnapshot.data();

      if (postData?.status !== 'active' || (postData.portions || 0) < 1) {
        throw new Error('No portions available for claim');
      }

      if (userData?.type !== 'individual') {
        throw new Error('Only individual volunteers can claim individual portions');
      }

      const newPortions = (postData.portions || 0) - 1;
      const shouldDeactivate = newPortions === 0;

      const newClaim = {
        id: claimRef.id,
        postId,
        userId,
        claimedAt: admin.firestore.FieldValue.serverTimestamp(),
        pointsAwarded: 10,
        portionsClaimed: 1,
      };

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

      const postUpdates: any = {
        portions: newPortions,
      };

      if (shouldDeactivate) {
        postUpdates.status = 'claimed';
        postUpdates.claimedBy = userId;
        postUpdates.claimedByName = userData.name;
      }

      transaction.update(postRef, postUpdates);
      transaction.set(claimRef, newClaim);
      transaction.update(userRef, {
        points: admin.firestore.FieldValue.increment(10),
        completedPickups: admin.firestore.FieldValue.increment(1),
        badges: currentBadges,
      });

      // Create notification for the donor
      const notificationRef = db.collection('notifications').doc();
      const newNotification = {
        id: notificationRef.id,
        recipientId: postData.restaurantId,
        title: 'Donation Claimed! 🍱',
        message: `${userData.name} has claimed 1 portion of your donation: "${postData.mealTime || 'food'}".`,
        type: 'claim',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        postId: postId,
      };
      transaction.set(notificationRef, newNotification);

      return {
        ...postData,
        ...postUpdates,
      };
    });

    res.status(200).json(serializeData(updatedPost));
  } catch (err: any) {
    console.error('Error in /claims/individual:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to claim individual portion' });
  }
});

// POST /api/claims/bulk
router.post('/bulk', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId, userId, portions } = req.body;
    const firebaseUser = req.user;

    if (!postId || !userId || portions === undefined || portions <= 0) {
      res.status(400).json({ error: 'Post ID, User ID, and a valid portions count are required' });
      return;
    }

    if (userId !== firebaseUser.uid) {
      res.status(403).json({ error: 'Forbidden: Cannot claim on behalf of another user' });
      return;
    }

    const postRef = db.collection('posts').doc(postId);
    const userRef = db.collection('users').doc(userId);
    const claimRef = db.collection('claims').doc();

    const updatedPost = await db.runTransaction(async (transaction) => {
      const postSnapshot = await transaction.get(postRef);
      const userSnapshot = await transaction.get(userRef);

      if (!postSnapshot.exists) {
        throw new Error('Post not found');
      }
      if (!userSnapshot.exists) {
        throw new Error('User profile not found');
      }

      const postData = postSnapshot.data();
      const userData = userSnapshot.data();

      if (postData?.status !== 'active' || (postData.portions || 0) < portions) {
        throw new Error(`Only ${postData?.portions || 0} portions are available`);
      }

      if (userData?.type !== 'shelter') {
        throw new Error('Only shelters can claim bulk orders');
      }

      const newPortions = (postData.portions || 0) - portions;
      const shouldDeactivate = newPortions === 0;
      const pointsAwarded = portions * 5;

      const newClaim = {
        id: claimRef.id,
        postId,
        userId,
        claimedAt: admin.firestore.FieldValue.serverTimestamp(),
        pointsAwarded,
        portionsClaimed: portions,
      };

      const postUpdates: any = {
        portions: newPortions,
      };

      if (shouldDeactivate) {
        postUpdates.status = 'claimed';
        postUpdates.claimedBy = userId;
        postUpdates.claimedByName = userData.name;
      }

      transaction.update(postRef, postUpdates);
      transaction.set(claimRef, newClaim);
      transaction.update(userRef, {
        points: admin.firestore.FieldValue.increment(pointsAwarded),
        completedPickups: admin.firestore.FieldValue.increment(1),
        peopleServed: admin.firestore.FieldValue.increment(portions),
      });

      // Create notification for the donor
      const notificationRef = db.collection('notifications').doc();
      const newNotification = {
        id: notificationRef.id,
        recipientId: postData.restaurantId,
        title: 'Donation Claimed! 🍱',
        message: `${userData.name} has claimed ${portions} portions of your donation: "${postData.mealTime || 'food'}".`,
        type: 'claim',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        postId: postId,
      };
      transaction.set(notificationRef, newNotification);

      return {
        ...postData,
        ...postUpdates,
      };
    });

    res.status(200).json(serializeData(updatedPost));
  } catch (err: any) {
    console.error('Error in /claims/bulk:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to claim bulk portions' });
  }
});

export default router;
