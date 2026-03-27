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

// Validate Firebase config
if (!firebaseConfig.apiKey) {
  console.error('[Firebase] Configuration missing. Check .env.local')
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth = getAuth(app)

// Initialize providers
export const googleProvider = new GoogleAuthProvider()

// Configure Google provider for popup
googleProvider.addScope('profile')
googleProvider.addScope('email')

/**
 * Sign in with Google using popup
 * @returns {Promise<Object>} User data {uid, email, displayName, photoURL}
 */
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
    throw new Error(error.message)
  }
}

/**
 * Send magic link to email
 * @param {string} email - User's email
 * @param {string} actionCodeSettings - Action code settings for email link
 * @returns {Promise<void>}
 */
export const sendMagicLink = async (email) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/complete-magic-link`,
    handleCodeInApp: true,
  }

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    // Save email for later verification
    window.localStorage.setItem('emailForSignIn', email)
  } catch (error) {
    throw new Error(error.message)
  }
}

/**
 * Complete magic link sign in
 * @param {string} email - User's email
 * @returns {Promise<Object>} User data {uid, email, displayName}
 */
export const completeMagicLinkSignIn = async (email) => {
  try {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const result = await signInWithEmailLink(auth, email, window.location.href)
      window.localStorage.removeItem('emailForSignIn')
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || email,
        provider: 'email-link',
      }
    } else {
      throw new Error('Invalid magic link or link expired')
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const firebaseSignOut = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error(error.message)
  }
}

/**
 * Subscribe to auth state changes
 * @param {function} callback - Called with user object or null
 * @returns {function} Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken()
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        token,
      })
    } else {
      callback(null)
    }
  })
}

export default app
