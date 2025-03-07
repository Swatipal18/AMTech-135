import { messaging, getToken, onMessage } from "./firebase-config";

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    // if (permission === "granted") {
    //   const token = await getToken(messaging, {
    //     vapidKey: "YOUR_VAPID_KEY",
    //   });
    //   if (token) {
    //     console.log("FCM Token:", token);
    //   } else {
    //     console.log("No registration token available.");
    //   }
    // } else {
    //   console.log("Permission denied");
    // }
  } catch (error) {
    console.error("An error occurred while retrieving token.", error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground Notification:", payload);
      resolve(payload);
    });
  });
