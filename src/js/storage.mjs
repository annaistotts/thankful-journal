import { db } from "./firebaseConfig.mjs";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { getCurrentUser } from "./auth.mjs";

function entriesCollection() {
  return collection(db, "entries");
}

export async function saveEntry(entry) {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("User must be logged in to save entries.");
  }

  const entryToSave = {
    ...entry,
    userId: user.uid,
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(entriesCollection(), entryToSave);
  return { id: docRef.id, ...entryToSave };
}

export async function getEntries() {
  const user = getCurrentUser();
  if (!user) return [];

  try {
    const q = query(
      entriesCollection(),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const results = [];
    snapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return results;
  } catch (err) {
    console.error("Firestore query error (trying without orderBy):", err);
    
    // Fallback: query without orderBy if index doesn't exist
    const q = query(
      entriesCollection(),
      where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);
    const results = [];
    snapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort in memory
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export async function getEntryById(id) {
  const user = getCurrentUser();
  if (!user) return null;

  const docRef = doc(db, "entries", id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return null;

  const data = snap.data();
  if (data.userId !== user.uid) {
    return null;
  }

  return { id: snap.id, ...data };
}

export async function updateEntry(id, updates) {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("User must be logged in to update entries.");
  }

  const docRef = doc(db, "entries", id);
  await updateDoc(docRef, updates);
}

export async function getFavoriteEntries() {
  const user = getCurrentUser();
  if (!user) return [];

  try {
    const q = query(
      entriesCollection(),
      where("userId", "==", user.uid),
      where("favorite", "==", true),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const results = [];
    snapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return results;
  } catch (err) {
    console.error("Firestore query error (trying without orderBy):", err);
    
    // Fallback: query without orderBy if index doesn't exist
    const q = query(
      entriesCollection(),
      where("userId", "==", user.uid),
      where("favorite", "==", true)
    );

    const snapshot = await getDocs(q);
    const results = [];
    snapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort in memory
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}
