import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

// Add custom CSS for the notification styling
const style = document.createElement('style');
style.textContent = `
//   .custom-notification {
//     position: relative;
//     padding-right: 30px !important;
//     border-radius: 8px;
//     font-family: Arial, sans-serif;
//     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//   }
  .custom-notification .toast-close {
    position: absolute !important;
    right: 8px !important;
    top: 8px !important;
  }
`;
document.head.appendChild(style);

const firebaseConfig = {
    apiKey: "AIzaSyAXHSBpbAFOoM9EMTXs87cccM3xpfaB5bw",
    authDomain: "degrees-1c40e.firebaseapp.com",
    projectId: "degrees-1c40e",
    storageBucket: "degrees-1c40e.firebasestorage.app",
    messagingSenderId: "768156680566",
    appId: "1:768156680566:web:f998bdfa62c42d7acfba57",
    measurementId: "G-C9R2YC93XC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationToken = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: "BAifcfY1bzqN0oekopyzm6RXYqniw5WvPG_xq5zjzvuM1Kx_I1UdeqfJnQLhC0jmRKUJ4hPNBbu4ago6CYheLDY"
            });
            if (token) {
                // Show token received notification
                showNotification('Notification Token Received', 'You will now receive notifications');
                // console.log('Notification Token:', token);
                return token;
            } else {
                console.log('No registration token available.');
                showNotification('Notification Error', 'No registration token available');
                return null;
            }
        } else {
            console.log('Notification permission denied.');
            showNotification('Permission Denied', 'Notification permission was denied');
            return null;
        }
    } catch (error) {
        console.error('Error getting notification token:', error);
        showNotification('Error','Failed to get notification token');
        return null;
    }
};

export const listenToForegroundNotifications = () => {
    onMessage(messaging, (payload) => {
        console.log("Foreground notification received:", payload);

        const notification = payload.notification || {};
        const title = notification.title || 'New Notification';
        const body = notification.body || 'You have a new notification';
        showNotification(title, body);
        const notificationType = notification.data.type;
        if (notificationType) {
            // Add your type-based routing logic here
            switch (notificationType) {
                case 'Order-Receive':
                    window.location.href = '/OrderManagement';
                    break;
                case 'Order-Preparing':
                    window.location.href = '/PreperingOrder';
                    break;
                case 'Order-OutForDelivery':
                    window.location.href = '/Outfordelivery';
                    break;
                default:
                    window.location.href = notification.data.url || '/';
            }
        } else if (notification.data.url) {
            window.location.href = notification.data.url;
        }
    });
};

// Helper function to display notifications
const showNotification = (title, message) => {
    Toastify({
        text: `<strong>${title}</strong><br/>${message}`,
        duration: 5000,
        gravity: "top",
        position: "right",
        backgroundColor: "#4CAF50",
        stopOnFocus: true,
        escapeMarkup: false,
        className: "custom-notification",
        close: true,
        onClick: function () { }
    }).showToast();

    
};

// For background notifications, you need to set up a service worker
export const setupBackgroundNotifications = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }
};

// Initialize notifications (call this function when your app starts)
export const initializeNotifications = async () => {
    const token = await requestNotificationToken();
    if (token) {
        listenToForegroundNotifications();
        setupBackgroundNotifications();
    }
    return token;
};

export { messaging };