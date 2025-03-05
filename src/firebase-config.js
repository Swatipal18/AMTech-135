import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAXHSBpbAFOoM9EMTXs87cccM3xpfaB5bw",
    authDomain: "degrees-1c40e.firebaseapp.com",
    projectId: "degrees-1c40e",
    storageBucket: "degrees-1c40e.firebasestorage.app",
    messagingSenderId: "768156680566",
    appId: "1:768156680566:web:f998bdfa62c42d7acfba57",
    measurementId: "G-C9R2YC93XC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to request notification token
export const requestNotificationToken = async () => {
    try {
        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            // Get token
            const token = await getToken(messaging, {
                vapidKey: "YOUR_VAPID_KEY" 
            });
            
            if (token) {
                console.log('Notification Token:', token);
                return token;
            } else {
                console.log('No registration token available.');
                return null;
            }
        } else {
            console.log('Notification permission denied.');
            return null;
        }
    } catch (error) {
        console.error('Error getting notification token:', error);
        return null;
    }
};
export const listenToForegroundNotifications = () => {
    onMessage(messaging, (payload) => {
        console.log('Foreground Notification Received:', payload);
        console.log('Notification Title:', payload.notification?.title);
        console.log('Notification Body:', payload.notification?.body);
        console.log('Additional Data:', payload.data);
    });
};

export { messaging };

