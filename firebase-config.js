// Firebase Configuration
// Project: projectpath-22570
const firebaseConfig = {
    apiKey: "AIzaSyDOc_w327HtKbjcsKDcnymPR-99H7NccB0",
    authDomain: "projectpath-22570.firebaseapp.com",
    databaseURL: "https://projectpath-22570-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "projectpath-22570",
    storageBucket: "projectpath-22570.firebasestorage.app",
    messagingSenderId: "766890964416",
    appId: "1:766890964416:web:be5146ee7023b9c6910425"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const database = firebase.database();
const storage = firebase.storage();
const auth = firebase.auth();
