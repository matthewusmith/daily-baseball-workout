import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

// ⚠️ STEP 1: Paste your Firebase Config here
// Go to Firebase Console -> Project Settings -> General -> Your Apps -> Config
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
const db = getFirestore(app);

// Load the data from your JSON file
try {
  const rawData = fs.readFileSync("./firestore_data.json", "utf-8");
  const workouts = JSON.parse(rawData);

  async function seedDatabase() {
    console.log("🚀 Starting database seed...");

    for (const [day, data] of Object.entries(workouts)) {
      try {
        // This creates a document in the "workouts" collection with the ID "monday", "wednesday", etc.
        await setDoc(doc(db, "workouts", day), data);
        console.log(`✅ Successfully uploaded: ${day}`);
      } catch (error) {
        console.error(`❌ Error uploading ${day}:`, error);
      }
    }

    console.log("🎉 Database seeding complete!");
    process.exit(0);
  }

  seedDatabase();

} catch (err) {
  console.error("❌ Could not read firestore_data.json. Make sure it is in the same folder as this script!");
  console.error(err);
}