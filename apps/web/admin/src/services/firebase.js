import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth = getAuth(app)

// Initialize Google Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('profile')
googleProvider.addScope('email')

// -----------------------------------
// Sign in with Google
// -----------------------------------
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      provider: 'google',
    }
  } catch (error) {
    throw error
  }
}

// -----------------------------------
// Send Magic Link to Email
// -----------------------------------
export const sendMagicLink = async (email) => {
  const actionCodeSettings = {
    url: `${window.location.origin}?signInEmail`,
    handleCodeInApp: true,
  }

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    window.localStorage.setItem('adminEmailForSignIn', email)
  } catch (error) {
    console.error('Error sending magic link:', error)
    throw error
  }
}

// -----------------------------------
// Complete Magic Link Sign In
// -----------------------------------
export const completeMagicLinkSignIn = async (email) => {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    throw new Error('Invalid sign-in link')
  }

  try {
    const result = await signInWithEmailLink(auth, email, window.location.href)
    window.localStorage.removeItem('adminEmailForSignIn')
    return result.user
  } catch (error) {
    console.error('Error completing sign in:', error)
    throw error
  }
}

// -----------------------------------
// Subscribe to Auth State Changes
// -----------------------------------
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// -----------------------------------
// Sign Out
// -----------------------------------
export const firebaseSignOut = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}
