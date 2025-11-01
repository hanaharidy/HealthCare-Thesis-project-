import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDqvKDbp2DaAzuSNoINYlt5igJDgg2X-9M",
  authDomain: "onlinemedicalcounseling.firebaseapp.com",
  projectId: "onlinemedicalcounseling",
  storageBucket: "onlinemedicalcounseling.firebasestorage.app",
  messagingSenderId: "268968609329",
  appId: "1:268968609329:web:ba5f8e06df278bf78db710",
  measurementId: "G-NGLK1YS7C0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);