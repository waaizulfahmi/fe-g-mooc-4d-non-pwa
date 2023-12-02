// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyBuyOi5a5jU6Vo3ePzV4_mOHYv1QTk7i_I',
    authDomain: 'g-mooc4d.firebaseapp.com',
    projectId: 'g-mooc4d',
    storageBucket: 'g-mooc4d.appspot.com',
    messagingSenderId: '402510284693',
    appId: '1:402510284693:web:3c25ade37d0703eea8d89c',
    measurementId: 'G-G5Q8GD2YLB',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
// const analytics = getAnalytics(app);
