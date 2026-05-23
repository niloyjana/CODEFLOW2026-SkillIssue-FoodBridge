import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

let app: admin.app.App;

if (process.env.FIREBASE_KEY) {
  console.log('Initializing Firebase Admin SDK with FIREBASE_KEY environment variable');
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (err: any) {
    console.error('Failed to parse FIREBASE_KEY environment variable:', err.message || err);
    throw err;
  }
} else {
  console.warn('---------------------------------------------------------');
  console.warn('WARNING: FIREBASE_KEY environment variable not found!');
  console.warn('Please configure the FIREBASE_KEY variable in backend/.env.');
  console.warn('Attempting to initialize using applicationDefault()...');
  console.warn('---------------------------------------------------------');
  
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

export default app;
