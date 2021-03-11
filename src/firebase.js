// src/firebase.js
import firebase from 'firebase'
if(!firebase.apps.length)
    firebase.initializeApp({
        apiKey: "AIzaSyA8S-srH-tHf8zNFjm-K8wExlaxY0xEn0Q",
        authDomain: "carta-engine.firebaseapp.com",
        projectId: "carta-engine",
        storageBucket: "carta-engine.appspot.com",
        messagingSenderId: "129718650492",
        appId: "1:129718650492:web:6a0311a65b93ebbef36bf9",
        measurementId: "G-T9VZHWB6KX"
    })

export const provider = new firebase.auth.GoogleAuthProvider()
export const auth = firebase.auth()
export default firebase