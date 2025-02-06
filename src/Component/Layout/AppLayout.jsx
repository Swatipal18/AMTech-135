import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Function to handle sidebar state
    const handleSidebarState = (isOpen) => {
        setSidebarOpen(isOpen);
    };
    const [isOn, setIsOn] = useState(true);
    const handleToggle = () => {
        setIsOn((prev) => !prev);
    };


    return (
        <div className='container-fluid'>
            <div className='row p-0'>
                {/* Sidebar */}
                <div
                    className={`sidebar-wrapper ${sidebarOpen ? 'col-lg-3 col-md-3 col-sm-4' : 'col-auto'}`}
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
                            <div className="toggle-container mt-0 d-flex align-items-center w-100 justify-content-between ">
                                <div className='d-flex align-items-center  store-status'>
                                    <p style={{ marginTop: "9%" }}>STORE STATUS </p> &nbsp;
                                    <div
                                        className={`toggle-switch ${isOn ? "on" : "off"}`}
                                        onClick={handleToggle}
                                    >
                                        <div className="toggle-knob"></div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className=" mx-2">
                                        <img
                                            src="/src//assets//Images/admin.png"
                                            alt="images"
                                            height={"40px"}
                                            style={{border:'3px solid #0B2545', borderRadius:'50%', objectFit:'cover', }}
                                        />
                                    </div>
                                    <div className="">
                                        <span className='fs-5'>Hello</span>,<span className="fs-5 fw-bold" style={{ color: "#0B2545" }}>Rahul Sharma!</span>
                                        <div className="">
                                            <button className="logout">LOGOUT </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppLayout;
