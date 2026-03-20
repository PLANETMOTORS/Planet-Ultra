/**
 * Planet Motors — Firebase Configuration
 * ─────────────────────────────────────────────────────────────
 * SETUP INSTRUCTIONS:
 *  1. Go to https://console.firebase.google.com
 *  2. Create a new project → "planet-motors"
 *  3. Add a Web App → copy the firebaseConfig object below
 *  4. Enable Authentication → Sign-in methods: Email/Password + Google
 *  5. Create Firestore Database → Start in production mode
 *  6. Set Firestore rules (see bottom of this file)
 *  7. Replace the placeholder values below with your real config
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAnalytics }  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword,
         createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
         sendPasswordResetEmail, signOut, updateProfile }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, deleteDoc,
         collection, query, where, getDocs, addDoc,
         serverTimestamp, onSnapshot }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ─── YOUR FIREBASE CONFIG (replace with values from Firebase Console) ──────
const firebaseConfig = {
  apiKey:            "AIzaSyDcxrkYkUx1NSRpUWdahTF4L1BZQuva1TI",
  authDomain:        "planet-motors.firebaseapp.com",
  projectId:         "planet-motors",
  storageBucket:     "planet-motors.firebasestorage.app",
  messagingSenderId: "1023446278941",
  appId:             "1:1023446278941:web:456b6055a91485eb5137f4",
  measurementId:     "G-HWBYXW3Y72"
};
// ────────────────────────────────────────────────────────────────────────────

const app       = initializeApp(firebaseConfig);
const auth      = getAuth(app);
const db        = getFirestore(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider,
         onAuthStateChanged, signInWithEmailAndPassword,
         createUserWithEmailAndPassword, signInWithPopup,
         sendPasswordResetEmail, signOut, updateProfile,
         doc, setDoc, getDoc, deleteDoc, collection,
         query, where, getDocs, addDoc, serverTimestamp, onSnapshot };

/*
 * ─── FIRESTORE SECURITY RULES ─────────────────────────────────
 * Paste these into Firebase Console → Firestore → Rules
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *
 *     // Users can only read/write their own data
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *     match /savedVehicles/{docId} {
 *       allow read, write: if request.auth != null
 *         && request.auth.uid == resource.data.userId;
 *       allow create: if request.auth != null
 *         && request.auth.uid == request.resource.data.userId;
 *     }
 *     match /priceAlerts/{docId} {
 *       allow read, write: if request.auth != null
 *         && request.auth.uid == resource.data.userId;
 *       allow create: if request.auth != null
 *         && request.auth.uid == request.resource.data.userId;
 *     }
 *     // Contact/sell forms — write-only for anyone
 *     match /contacts/{docId} {
 *       allow create: if true;
 *     }
 *     match /sellRequests/{docId} {
 *       allow create: if true;
 *     }
 *     match /reservations/{docId} {
 *       allow create: if true;
 *       allow read: if request.auth != null
 *         && request.auth.uid == resource.data.userId;
 *     }
 *   }
 * }
 */
