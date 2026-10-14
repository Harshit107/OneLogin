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

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    try {
      serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err) {
      console.warn("Failed to load FIREBASE_SERVICE_ACCOUNT from path:", err.message);
    }
  }
} else {
  try {
    serviceAccount = require("./admin-key-onelogin.json");
  } catch (e) {
    console.warn("Warning: admin-key-onelogin.json not found and FIREBASE_SERVICE_ACCOUNT not set.");
  }
}

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      process.env.FIREBASE_DATABASE_URL ||
      "https://onelog-in-default-rtdb.asia-southeast1.firebasedatabase.app/",
  });
}

const db = admin.apps.length ? admin.database() : null;

module.exports = db;
