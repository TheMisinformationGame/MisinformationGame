import firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyBwvE41mT2mEf-GHPdZn9NUKtIFGT2nJn8",
    authDomain: "misinformation-game-group-41.firebaseapp.com",
    projectId: "misinformation-game-group-41",
    storageBucket: "misinformation-game-group-41.appspot.com",
    messagingSenderId: "714489298376",
    appId: "1:714489298376:web:04331863fdd6a4a2d914fd",
    measurementId: "G-JZZ7VFM2J6"
};
firebase.initializeApp(firebaseConfig);

// Make the firebase API available to our pages.
export const db = firebase.firestore();
export const storage = firebase.storage();
export const storageRef = storage.ref();
export const auth = firebase.auth();
export const authProvider = new firebase.auth.GoogleAuthProvider();
