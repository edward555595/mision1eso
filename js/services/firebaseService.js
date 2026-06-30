import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export const FirebaseService = {
  async init(){
    const cfg = window.M1ESO_FIREBASE_CONFIG || {};
    const configured = cfg.apiKey && !String(cfg.apiKey).includes("PEGA_AQUI");
    if(!configured) return {configured:false};
    const app = initializeApp(cfg);
    return {
      configured:true,
      app,
      auth:getAuth(app),
      db:getFirestore(app),
      adminUids: window.M1ESO_ADMIN_UIDS || [],
      api: {onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, doc, getDoc, setDoc, collection, getDocs, serverTimestamp}
    };
  }
};
