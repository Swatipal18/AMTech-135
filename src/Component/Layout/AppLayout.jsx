import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigator = useNavigate();
    const location = useLocation();
    const outletRef = useRef(null);

    // Function to handle sidebar state
    const handleSidebarState = (isOpen) => {
        setSidebarOpen(isOpen);
    };

    const [isOn, setIsOn] = useState(true);
    const handleToggle = () => {
        setIsOn((prev) => !prev);
    };

    const logOut = () => {
        localStorage.removeItem("authToken");
        navigator('/');
    }

    // GSAP animation for the Outlet component
    useEffect(() => {
        if (outletRef.current) {
            // Set initial state
            gsap.set(outletRef.current, {
                opacity: 0,
                y: 30,
                scale: 0.98
            });

            // Animate to final state
            gsap.to(outletRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: "power2.out",
                clearProps: "all" // Clean up after animation
            });
        }
    }, [location.pathname]); // Re-run animation when route changes

    return (
        <div className='container-fluid'>
            <div className='row p-0'>
                {/* Sidebar */}
                <div
                    className={`sidebar-wrapper ${sidebarOpen ? 'col-lg-3 col-md-3 col-sm-4 ' : 'col-auto'}`}
                >
                    <Sidebar onToggle={handleSidebarState} />
                </div>

                {/* Main Content */}
                <span className='Sticky-HEader'></span>
                <div
                    className={`main-wrapper ${sidebarOpen ? 'col-lg-9 col-md-9 col-sm-8' : 'col'}`}
                    style={{
                        marginLeft: sidebarOpen ? '300px' : '60px',
                        transition: 'margin-left 0.3s ease',
                        width: sidebarOpen ? 'calc(100% - 300px)' : 'calc(100% - 60px)',
                    }}
                >
                    <div className='main-content p-0 mt-3 '>
                        <div className="Admin-bar mx-5">
                            <div className="toggle-container d-flex align-items-center w-100 justify-content-between ">
                                <div className='d-flex align-items-center store-status'>
                                    <p style={{ marginTop: "9%" }}>STORE STATUS </p> &nbsp;
                                    <div
                                        className={`ms-2 toggle-switch ${isOn ? "on" : "off"}`}
                                        onClick={handleToggle}
                                    >
                                        <div className="toggle-knob"></div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className=" mx-2 ">
                                        <img
                                            src="/src/assets/Images/admin.png"
                                            alt="images"
                                            height={"40px"}
                                            width={"40px"}
                                            style={{ border: '3px solid #0B2545', borderRadius: '50%', objectFit: 'cover', }}
                                        />
                                    </div>
                                    <div className=" ">
                                        <span className='fs-5'>Hello</span>,<span className="fs-5 fw-bold" style={{ color: "#0B2545" }}> Rahul Sharma!</span>
                                        <div className="mt-1">
                                            <button className="logout " onClick={logOut}>LOGOUT </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Wrapper for Outlet with animation */}
                        <div ref={outletRef}>
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppLayout;