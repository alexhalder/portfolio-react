import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserNone } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// These should be set in your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyAaUqWaYbVubjjUCZ00GlwH2h5VCLwo8JY",
  authDomain: "ax-alex-portfolio.firebaseapp.com",
  databaseURL: "https://ax-alex-portfolio-default-rtdb.firebaseio.com",
  projectId: "ax-alex-portfolio",
  storageBucket: "ax-alex-portfolio.firebasestorage.app",
  messagingSenderId: "1007402967379",
  appId: "1:1007402967379:web:3ccdd877141e9a51a5c1a6",
  measurementId: "G-8HK92J3B35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ⚠️ SECURITY: Disable session persistence
// User must login every time they access the admin panel
// - No cookies saved
// - No localStorage used
// - Session ends on page refresh or browser close
setPersistence(auth, browserNone).catch((error) => {
  console.warn("Could not disable persistence:", error);
});

export const db = getFirestore(app);
