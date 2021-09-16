//Script will initiate the firestore database 
import firebase from './firebase.js';
import 'firebase/firestore';
import 'firebase/storage';

export const db = firebase.firestore();
export const storage = firebase.storage();
export const storageRef = storage.ref();