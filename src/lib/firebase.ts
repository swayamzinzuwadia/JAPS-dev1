import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCF3mIrwKciFHUD2oXbRxvvB1iXWGpdi5k",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "japs-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "japs-dev",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "japs-dev.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "159427250831",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:159427250831:web:e3920238cabeff69fdfefa",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-J0MFFCM9ZM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics (only in production)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

// Admin credentials for testing (in production, use Firebase Admin SDK on server)
export const ADMIN_CREDENTIALS = {
  email: "admin@neelkanthresidency.com",
  password: "Admin@123456",
  uid: "admin-uid-neelkanth",
};

// Authentication functions
export const signInAsAdmin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      ADMIN_CREDENTIALS.email,
      ADMIN_CREDENTIALS.password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Admin sign-in error:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-out error:", error);
    throw error;
  }
};

// Connect to emulators in development (optional)
// Uncomment these lines if you want to use Firebase emulators
// if (import.meta.env.DEV) {
//   import { connectFirestoreEmulator } from "firebase/firestore";
//   import { connectAuthEmulator } from "firebase/auth";
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app;
