// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDpizBz0d_pLS8rl08ORHL4hX0iKORHLIQ",
//   authDomain: "onelog-in.firebaseapp.com",
//   projectId: "onelog-in",
//   storageBucket: "onelog-in.appspot.com",
//   messagingSenderId: "108742549015",
//   appId: "1:108742549015:web:bc4c70d056ddf37eae0652",
//   measurementId: "G-6PZWHZDP7V",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);



const admin = require("firebase-admin");

const serviceAccount = require("./admin-key-onelogin.json"); // Replace with the path to your service account key JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://harshit107-file-ecosystem-default-rtdb.firebaseio.com/", // Replace with your Firebase database URL
  databaseURL:
    "https://onelog-in-default-rtdb.asia-southeast1.firebasedatabase.app/", // Replace with your Firebase database URL
});
const db = admin.database();

module.exports = db;
