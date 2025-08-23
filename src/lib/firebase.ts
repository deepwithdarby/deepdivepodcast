import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAGWholubNmSE4wVI-ug08fAecmZQPpbRg",
  authDomain: "music-streaming-website33.firebaseapp.com",
  databaseURL: "https://music-streaming-website33-default-rtdb.firebaseio.com",
  projectId: "music-streaming-website33",
  storageBucket: "music-streaming-website33.firebasestorage.app",
  messagingSenderId: "32814188597",
  appId: "1:32814188597:web:a60c9de2d93183b77f097c",
  measurementId: "G-NVYC6PNDWK"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
