import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCi01BKJBXS87lYKo5HLXrmuXC-fLMwn0M",
  authDomain: "daily-baseball-workout.firebaseapp.com",
  projectId: "daily-baseball-workout",
  storageBucket: "daily-baseball-workout.firebasestorage.app",
  messagingSenderId: "207054206442",
  appId: "1:207054206442:web:57ffc1c7fcb205113f6e93",
  measurementId: "G-FGYHXX6CRQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);