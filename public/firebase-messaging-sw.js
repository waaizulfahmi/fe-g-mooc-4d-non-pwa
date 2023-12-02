importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: 'AIzaSyBuyOi5a5jU6Vo3ePzV4_mOHYv1QTk7i_I',
    authDomain: 'g-mooc4d.firebaseapp.com',
    projectId: 'g-mooc4d',
    storageBucket: 'g-mooc4d.appspot.com',
    messagingSenderId: '402510284693',
    appId: '1:402510284693:web:3c25ade37d0703eea8d89c',
    measurementId: 'G-G5Q8GD2YLB',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
