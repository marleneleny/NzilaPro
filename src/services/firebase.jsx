// Importações corretas para Firebase v9+

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAew0ydA3O3yHsvKs8oAiK8j3rMBdRRJg",
  authDomain: "nzilapro.firebaseapp.com",
  projectId: "nzilapro",
  storageBucket: "nzilapro.firebasestorage.app",
  messagingSenderId: "329495093817",
  appId: "1:329495093817:web:830d21345b5548fc4623e8"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth e Firestore
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };







