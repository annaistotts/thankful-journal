import { auth } from "./firebaseConfig.mjs";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

let currentUser = null;

export function initAuth(onUserChanged) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      if (onUserChanged) onUserChanged(user);
      resolve(user);
    });
  });
}

export function getCurrentUser() {
  return currentUser;
}

export async function register(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}
