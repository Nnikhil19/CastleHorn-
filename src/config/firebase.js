import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3u0tVnJ1sMcIq4YNNZKs5ZHvkRgkB-S4",
  authDomain: "castlehorn-6a3d2.firebaseapp.com",
  projectId: "castlehorn-6a3d2",
  storageBucket: "castlehorn-6a3d2.firebasestorage.app",
  messagingSenderId: "736947602623",
  appId: "1:736947602623:web:fde0021d61ad011060720a",
  measurementId: "G-WXJDYZE02F",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
