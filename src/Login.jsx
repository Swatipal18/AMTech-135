import React, { useState } from "react";
import logo from "./assets/Images/logo.png";
import userLogo from "./assets/Images/userLogo.png";
import key from "./assets/Images/key.png";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            const response = await axios.post(
                "http://192.168.1.12:9000/auth/login",
                {
                    username: data.username,
                    password: data.password,
                }
            );
            // console.log(response.data);
            toast.success("Login successful!", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            reset();
            navigate("/Admin");
            // const token = response.data.data.token;
            // console.log(token, "response");

            // localStorage.setItem("authToken", token);


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
        <div className="container-fluid  banner">
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
                                                className="img-fluid mx-auto d-block "
                                            />
                                            <div>
                                                <div className="border border-2 login-round p-4 mt-3 login-Main-Div w-75 ms-5">
                                                    <p className="text-center loginToAccount text-uppercase text-white">
                                                        Login to your account
                                                    </p>
                                                    <form onSubmit={handleSubmit(onSubmit)}>
                                                        <div className="form-group py-2 userName d-flex  rounded rounded-pill mb-3">
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
                                                        <div className="form-group userName py-2  rounded rounded-pill mb-3">
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
            {/* Toast Container */}
            <ToastContainer />
        </div>
    );
};

export default Login;
