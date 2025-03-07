importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAXHSBpbAFOoM9EMTXs87cccM3xpfaB5bw",
    authDomain: "degrees-1c40e.firebaseapp.com",
    projectId: "degrees-1c40e",
    storageBucket: "degrees-1c40e.firebasestorage.app",
    messagingSenderId: "768156680566",
    appId: "1:768156680566:web:f998bdfa62c42d7acfba57",
    measurementId: "G-C9R2YC93XC",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);
    const notification = payload.notification;
    if (notification) {
        self.registration.showNotification(notification.title, {
            body: notification.body,
            icon: notification.icon || '/notification-icon.png',
            badge: '/badge-icon.png',
            data: payload.data
        });
    }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    // Close the notification
    event.notification.close();

    // Get notification data
    const notificationData = event.notification.data || {};
    const notificationType = notificationData.type;

    // Determine URL based on notification type
    let urlToOpen = '/';

    if (notificationType) {
        // Add your type-based routing logic here
        switch (notificationType) {
            case 'Order-Receive':
                urlToOpen = '/OrderManagement';
                break;
            case 'Order-Preparing':
                urlToOpen = '/PreperingOrder';
                break;
            case 'Order-OutForDelivery':
                urlToOpen = '/Outfordelivery';
                break;
            default:
                urlToOpen = notificationData.url || '/';
        }
    } else if (notificationData.url) {
        urlToOpen = notificationData.url;
    }

    const windowClients = self.clients;

    event.waitUntil(
        windowClients.matchAll({ type: 'window' }).then((clientList) => {
            // Check if there's already a window/tab open with the target URL
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }

            // If no window/tab is open, open a new one
            if (windowClients.openWindow) {
                return windowClients.openWindow(urlToOpen);
            }
        })
    );
});