importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Initialize Firebase app
firebase.initializeApp({

    apiKey: "AIzaSyAXHSBpbAFOoM9EMTXs87cccM3xpfaB5bw",
    authDomain: "degrees-1c40e.firebaseapp.com",
    projectId: "degrees-1c40e",
    storageBucket: "degrees-1c40e.firebasestorage.app",
    messagingSenderId: "768156680566",
    appId: "1:768156680566:web:f998bdfa62c42d7acfba57",
    measurementId: "G-C9R2YC93XC"
});
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    alert('Received background message ', payload);
    console.log('Received background message', payload);

    // Log full payload details
    console.log('Notification Title:', payload.notification.title);
    console.log('Notification Body:', payload.notification.body);
    console.log('Additional Data:', payload.data);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});