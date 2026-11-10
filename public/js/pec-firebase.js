/* Shared Firebase bootstrap for Physical Education Career.
   Reuses the existing pe-exam-hub project. Loaded as ES module. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber,
  setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, addDoc, getDocs, query, where, orderBy, limit, onSnapshot,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
export const firebaseConfig = {
  apiKey: "AIzaSyDI7KGUiLBRNGBXQ-k091qerf63NotTHhY",
  authDomain: "pe-exam-hub.firebaseapp.com",
  projectId: "pe-exam-hub",
  storageBucket: "pe-exam-hub.firebasestorage.app",
  messagingSenderId: "14977805637",
  appId: "1:14977805637:web:067f6af55ccd8993a1222c",
  measurementId: "G-S8FJHM2BQ8"
};
export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
try { await setPersistence(auth, browserLocalPersistence); } catch(_) {}
export {
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  RecaptchaVerifier, signInWithPhoneNumber,
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, addDoc, getDocs, query, where, orderBy, limit, onSnapshot,
  deleteDoc
};
/* Student profile helpers */
export async function ensureStudentProfile(user){
  const ref = doc(db, "students", user.uid);
  const snap = await getDoc(ref);
  if(!snap.exists()){
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
      photo: user.photoURL || "",
      coins: 0, badges: [], testsTaken: 0, totalScore: 0,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    return (await getDoc(ref)).data();
  }
  return snap.data();
}
export async function updateStudentProfile(uid, patch){
  await updateDoc(doc(db,"students",uid), { ...patch, updatedAt: serverTimestamp() });
}
