import React, { useState, useEffect } from "react";
import logo from "./assets/Images/logo.png";
import userLogo from "./assets/Images/userLogo.png";
import key from "./assets/Images/key.png";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    isMobile,
    isTablet,
    isDesktop,
    browserName,
    osName,
    deviceType
} from 'react-device-detect';
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase-config";

const Login = () => {
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [fcmToken, setFcmToken] = useState(null);
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_URL;
    // Generate a unique device ID
    const generateDeviceId = () => {
        return `${browserName}_${osName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // Request FCM Token
    const requestNotificationPermission = async () => {
        try {
            // Check if the browser supports notifications
            if (!("Notification" in window)) {
                console.log("This browser does not support desktop notification");
                return;
            }

            // Request permission
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                // Get FCM token
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                });

                if (token) {
                    setFcmToken(token);
                    // localStorage.setItem('fcmToken', token);
                    return token;
                }
            } else {
                console.log('Notification permission denied');
            }
        } catch (error) {
            console.error("Error getting FCM token:", error);
        }
        return null;
    };

    // Check token and handle initial navigation
    useEffect(() => {
        // Check if auth token exists in local storage
        const authToken = localStorage.getItem("authToken");

        if (authToken) {
            // If token exists, navigate to admin page
            navigate("/Admin");
        } else {
            // If no token, request FCM permission
            requestNotificationPermission();
        }

        // Optional: Listen for messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message:', payload);
            toast.info(payload.notification.body, {
                position: "top-right",
                autoClose: 3000,
            });
        });

        // Cleanup subscription
        return () => {
            unsubscribe();
        };
    }, [navigate]);

    const onSubmit = async (data) => {
        setLoading(true);

        // Get FCM token if not already obtained
        const currentFcmToken = fcmToken || localStorage.getItem('fcmToken') || await requestNotificationPermission();

        // Prepare device information
        const deviceInfo = {
            deviceId: generateDeviceId(),
            deviceType: deviceType,
            isMobile: isMobile,
            isTablet: isTablet,
            isDesktop: isDesktop,
            browserName: browserName,
            osName: osName,
        };
        // console.log('deviceInfo: ', deviceInfo);

        try {
            const response = await axios.post(
                `${baseUrl}/auth/login`,
                {
                    username: data.username,
                    password: data.password,
                    deviceId: deviceInfo.deviceId,
                    fcmToken: currentFcmToken
                }
            );
            const token = response.data.data.token;
            localStorage.setItem("authToken", token);
            // localStorage.setItem("deviceInfo", JSON.stringify(deviceInfo));
            toast.success("Login successful!", {
                position: "top-right",
                autoClose: 2000,
                theme: "colored",
            });

            // Reset form
            reset();

            // Navigate after successful login
            setTimeout(() => {
                navigate("/Admin");
            }, 1000);

        } catch (err) {
            console.log(err);
            let errorMessage = "An error occurred. Please try again.";
            if (err.response && err.response.data) {
                errorMessage = err.response.data.message || errorMessage;
            }

            // Show error toast
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid banner">
            <div className="row bg-logoImg">
                <div className="col-lg-6">
                    <div className="container py-5 mt-5">
                        <div className="row py-5">
                            <div className="col-lg-12">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-lg-12 ms-0 ms-lg-5 mt-5 pt-5">
                                            <img
                                                src={logo}
                                                width={180}
                                                alt="Logo"
                                                className="img-fluid mx-auto d-block"
                                            />
                                            <div>
                                                <div className="border border-2 login-round p-4 mt-3 login-Main-Div w-75 ms-5">
                                                    <p className="text-center loginToAccount text-uppercase text-white">
                                                        Login to your account
                                                    </p>
                                                    <form onSubmit={handleSubmit(onSubmit)}>
                                                        <div className="form-group py-2 userName d-flex rounded rounded-pill mb-3">
                                                            <img
                                                                src={userLogo}
                                                                alt=""
                                                                width={20}
                                                                height={20}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="form-control bg-transparent rounded rounded-pill ms-3 w-100 text-white"
                                                                placeholder="Enter Username"
                                                                {...register("username", { required: true })}
                                                            />
                                                        </div>
                                                        <div className="form-group userName py-2 rounded rounded-pill mb-3">
                                                            <img
                                                                src={key}
                                                                alt="keyLogo"
                                                                width={20}
                                                                className="mt-1"
                                                            />
                                                            <input
                                                                type="password"
                                                                className="form-control bg-transparent rounded rounded-pill ms-3"
                                                                placeholder="Enter Password"
                                                                {...register("password", { required: true })}
                                                            />
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary rounded rounded-pill bg-light text-transparent w-100 loginButton"
                                                            disabled={loading}
                                                        >
                                                            {loading ? "Logging in..." : "LOGIN"}
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Login;