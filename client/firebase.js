// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:  import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-real-estate-fdb1f.firebaseapp.com",
  projectId: "mern-real-estate-fdb1f",
  storageBucket: "mern-real-estate-fdb1f.appspot.com",
  messagingSenderId: "746984911476",
  appId: "1:746984911476:web:3131f4c511ffe4ee895721",
  measurementId: "G-J0ZM820TLT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);