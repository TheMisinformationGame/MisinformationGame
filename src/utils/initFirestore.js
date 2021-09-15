//Script will initiate the firestore database 
import firebase from './firebase.js';
import {getStorage} from 'firebase/firestore'

const db = firebase.firestore();
const storage = getStorage(firebase)

export const db;
export const storage;
