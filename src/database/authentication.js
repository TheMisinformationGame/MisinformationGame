import firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';


export function adminSignIn(email,password){
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            return user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });

}

export function adminSignup(email,password){


    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            return user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });
}

export function adminSignOut(email,password){
    return firebase.auth().signOut();
}
