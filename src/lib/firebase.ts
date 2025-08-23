import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBqkIZs8U3ZuJNvDh_w8a1m2gOwLaPNpyk",
  authDomain: "podcast-app-7d98d.firebaseapp.com",
  projectId: "podcast-app-7d98d",
  storageBucket: "podcast-app-7d98d.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);