// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCAoImlC1rHI2KyRLRZk5oMYXq__T0J7is',
  authDomain: 'ridefusion-e479d.firebaseapp.com',
  projectId: 'ridefusion-e479d',
  storageBucket: 'ridefusion-e479d.appspot.com',
  messagingSenderId: '704885400928',
  appId: '1:704885400928:web:29d6c80d89d37a7e016a05',
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
