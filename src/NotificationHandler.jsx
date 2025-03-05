import { useEffect } from 'react';
import { requestNotificationToken, listenToForegroundNotifications } from './firebase-config';

function NotificationHandler() {
    useEffect(() => {
        // Request notification token when component mounts
        const initializeNotifications = async () => {
            // Request token
            await requestNotificationToken();

            // Start listening to foreground notifications
            listenToForegroundNotifications();
        };

        initializeNotifications();
    }, []);

    return null; // This component doesn't render anything
}

export default NotificationHandler;