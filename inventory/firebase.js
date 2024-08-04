// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDAwArF_221wfWTOv4qk5a9pmq8w9-thZ0",
  authDomain: "pantry-tracker-8add1.firebaseapp.com",
  projectId: "pantry-tracker-8add1",
  storageBucket: "pantry-tracker-8add1.appspot.com",
  messagingSenderId: "484877876794",
  appId: "1:484877876794:web:3c5d87c8671f7d54dcbf03",
  measurementId: "G-4RG6SR99DH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export{firestore};