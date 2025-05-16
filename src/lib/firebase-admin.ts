import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if it hasn't been initialized yet
const apps = getApps();

if (!apps.length) {
  try {
    // Try to initialize with environment variables first
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    // If all environment variables are available, use them
    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      console.log('Firebase Admin initialized with environment variables');
    } else {
      // Fallback to credential file if available
      initializeApp();
      console.log('Firebase Admin initialized with default credentials');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    
    // Initialize with a minimal configuration to avoid crashes
    // This won't actually connect to Firebase but prevents code from breaking
    console.log('Initializing Firebase Admin with a minimal configuration');
    initializeApp({
      projectId: 'placeholder-project',
    });
  }
}

// Get Firestore instance
export const adminDb = getFirestore();

// Helper function to create a chain document directly with admin privileges
export async function createChainWithAdmin(userId: string, chainId: string, chainData: any) {
  try {
    const ref = adminDb.collection('users').doc(userId).collection('chains').doc(chainId);
    await ref.set(chainData);
    return true;
  } catch (error) {
    console.error('Error creating chain with admin:', error);
    return false;
  }
} 