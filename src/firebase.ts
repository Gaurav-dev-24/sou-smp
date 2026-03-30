// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDV_ZIAgigdD1feD_ZptwSkf3j44vg8Aw",
  authDomain: "sbversion-07march.firebaseapp.com",
  projectId: "sbversion-07march",
  storageBucket: "sbversion-07march.appspot.com",
  messagingSenderId: "782993596072",
  appId: "1:782993596072:web:b8a798cd10e5b386802c9d",
  measurementId: "G-V4B248XTGS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;