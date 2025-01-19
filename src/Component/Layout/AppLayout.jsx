import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Function to handle sidebar state
    const handleSidebarState = (isOpen) => {
        setSidebarOpen(isOpen);
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
                <div
                    className={`main-wrapper ${sidebarOpen ? 'col-lg-9 col-md-9 col-sm-8' : 'col'}`}
                    style={{
                        marginLeft: sidebarOpen ? '300px' : '60px',
                        transition: 'margin-left 0.3s ease',
                        width: sidebarOpen ? 'calc(100% - 300px)' : 'calc(100% - 60px)',
                    }}
                >
                    <div className='main-content p-0 '>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppLayout;
