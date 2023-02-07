import { initializeApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import firebaseConfig from "../../config/firebase-config";
import developmentConfig from "../../config/development-config";


const firebaseApp = initializeApp(firebaseConfig);

// Make the firebase API available to our pages.
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);
export const authProvider = new GoogleAuthProvider();


// When in development mode, we want to connect to the Firebase
// emulators instead of the production Firebase instance.
const devAddress = developmentConfig.developmentAddress;
const atDevAddress = (window.location.hostname === devAddress);
const devMode = developmentConfig.developmentMode;
export const inDevelopmentMode = (devMode === "on" || (devMode === "auto" && atDevAddress));
if (inDevelopmentMode) {
    console.log("Running in development mode!")
    connectAuthEmulator(auth, "http://" + devAddress + ":9099", { disableWarnings: true });
    connectStorageEmulator(storage, devAddress, 9199);
    connectFirestoreEmulator(db, devAddress, 9299);
}
