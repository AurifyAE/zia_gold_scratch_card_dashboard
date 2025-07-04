import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-analytics.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDdUZhou7gkqRHcN0ei1WnQPbzuV4x_bf4",
    authDomain: "scratch-card-97dc9.firebaseapp.com",
    projectId: "scratch-card-97dc9",
    storageBucket: "scratch-card-97dc9.firebasestorage.app",
    messagingSenderId: "597225697613",
    appId: "1:597225697613:web:ebdb786cc2dd2269360704"
};

// Configuration For Fixing Bugs When App is Live
// const firebaseConfig = {
//     apiKey: "AIzaSyBkXS5aN0HO1YOeZN9YC9Tl-X-lqVpz86w",
//     authDomain: "scratch-card-d1196.firebaseapp.com",
//     projectId: "scratch-card-d1196",
//     storageBucket: "scratch-card-d1196.appspot.com",
//     messagingSenderId: "633923933151",
//     appId: "1:633923933151:web:7a7ae3baa3b0bd90a26a6a"
// };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app }