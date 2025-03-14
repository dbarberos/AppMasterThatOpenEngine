import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Access the API key from environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: apiKey,
    authDomain: "masterbimdev.firebaseapp.com",
    projectId: "masterbimdev",
    storageBucket: "masterbimdev.firebasestorage.app",
    messagingSenderId: "1042507851251",
    appId: "1:1042507851251:web:fa91cd063b32a560d89e86",
    measurementId: "G-W7JL3FWK0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);