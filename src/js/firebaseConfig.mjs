import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAuv12Erp_qZyvQWa4F2A7qZxAlMt8AU0o",
  authDomain: "thankful-journal-42cc4.firebaseapp.com",
  projectId: "thankful-journal-42cc4",
  storageBucket: "thankful-journal-42cc4.firebasestorage.app",
  messagingSenderId: "786055588872",
  appId: "1:786055588872:web:92b4a5a41b2ea17cb7f5bd"
};

// remove this later
console.log("firebaseConfig in code:", firebaseConfig);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

