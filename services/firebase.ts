
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: In a production environment, these should be environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyAs-EXAMPLE-KEY", 
  authDomain: "habitflow-example.firebaseapp.com",
  projectId: "habitflow-example",
  storageBucket: "habitflow-example.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:example"
};

// Initialize Firebase modularly
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
