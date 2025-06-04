// @ts-nocheck

import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function registerUser({ firstName, lastName, email, password }) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  // Write initial profile data to Firestore:
  await setDoc(doc(db, 'users', uid), {
    fornavn: firstName,
    etternavn: lastName,
    email,
    isAdmin: false,
    totalCrosses: 0,
    drinkCount: 0
  });

  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
}
