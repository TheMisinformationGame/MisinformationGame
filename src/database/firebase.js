import firebase from "firebase/app";
import firebaseConfig from "../../config/firebase-config";
import developmentConfig from "../../config/development-config";
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth'

firebase.initializeApp(firebaseConfig);

// Make the firebase API available to our pages.
export const db = firebase.firestore();
export const storage = firebase.storage();
export const storageRef = storage.ref();
export const auth = firebase.auth();
export const authProvider = new firebase.auth.GoogleAuthProvider();


// When in development mode, we want to connect to the Firebase
// emulators instead of the production Firebase instance.
const devAddress = developmentConfig.developmentAddress;
const atDevAddress = (window.location.hostname === devAddress);
const devMode = developmentConfig.developmentMode;
export const inDevelopmentMode = (devMode === "on" || (devMode === "auto" && atDevAddress));
if (inDevelopmentMode) {
    console.log("Running in development mode!")
    auth.useEmulator("http://" + devAddress + ":9099", { disableWarnings: true });
    storage.useEmulator(devAddress, 9199);
    db.useEmulator(devAddress, 9299);
}
