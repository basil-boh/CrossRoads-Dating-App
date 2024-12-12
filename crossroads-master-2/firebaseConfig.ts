import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAC5SxUZV2m7r5CUdru54FqjKl4N9LKla4",
    authDomain: "crossroads-cb.firebaseapp.com",
    projectId: "crossroads-cb",
    storageBucket: "crossroads-cb.appspot.com",
    messagingSenderId: "350698148646",
    appId: "1:350698148646:android:1bfb7dedd7cd0a6e3a27e7"
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_AUTH = getAuth(FIREBASE_APP);
const FIREBASE_FIRESTORE = getFirestore(FIREBASE_APP);
const FIREBASE_STORAGE = getStorage(FIREBASE_APP);

export { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_FIRESTORE, FIREBASE_STORAGE };
