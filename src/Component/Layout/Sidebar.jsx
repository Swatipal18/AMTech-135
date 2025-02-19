import React, { useEffect, useState } from 'react';
import { Menu, Search, Store, Briefcase } from 'lucide-react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { RiHome3Line } from "react-icons/ri";
import { RiCupLine } from "react-icons/ri";
import { RiUserCommunityFill } from "react-icons/ri";
import { RiUserStarFill } from "react-icons/ri";
import { HiUserGroup } from "react-icons/hi";
import { AiFillPieChart } from "react-icons/ai";
import { RiBarChartFill } from "react-icons/ri";
import { RiNotification2Fill } from "react-icons/ri";
import { FaAd, FaFileInvoice } from "react-icons/fa";
import { RiBuilding2Fill } from "react-icons/ri";
import { io } from 'socket.io-client';

const socket_url =  import.meta.env.VITE_SOCKET_URL
const socket = io(socket_url , {
    transports: ["websocket"],
  });
  
const Sidebar = ({ onToggle, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [length , setlenght] = useState()
    const location = useLocation();
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
        onToggle && onToggle(!isOpen);
    };

    const toggleDropdown = (name) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };
 
    
      useEffect(() => {
        socket.emit("total-records", {});
        socket.on("total-records-received", (data) => {
            setlenght(data.data)
            console.log('---------------- data.data: ', data.data);
        
        });
    
        const interval = setInterval(() => {
       
            socket.emit("total-records", {});
        }, 1000);
        
        return () => {
          clearInterval(interval);
          socket.off("");
        };
    
      },[]);

    
    const menuItems = [
        {
            title: 'Dashboard',
            icon: <RiHome3Line size={20} className='m-2' />,
            path: '/Admin'
        },
        {
            title: 'InvoiceHistory',
            icon:<FaFileInvoice size={20} className='m-2'/>  ,
            path: '/InvoiceHistory'
        },
        {
            title: 'Items Management',
            icon: <RiCupLine size={20} className='m-2' />,
            subItems: [
                { label: 'All Items', path: '/all-items' },
                { label: 'Add New Item', path: '/AddNewItem' },
                { label: 'Categories', path: '/categories' },
                { label: 'Sizes', path: '/sizes' },
                { label: 'Subscriptions', path: '/Subscription' },
                { label: ' All Subscriptions', path: '/All-Subscription' },
            ],
            isDropdown: true
        },
        {
            title: 'Staff Management',
            icon: <RiUserCommunityFill size={20} className='m-2' />,
            subItems: [
                { label: 'All Staff', path: '/AllStaff' },
                { label: 'Add New Staff', path: '/AddStaff' }
            ],
            isDropdown: true
        },
        {
            title: 'Order Management',
            icon:<><div className='dot-parent'> <RiUserStarFill size={20} className='m-2 ' /> <span className={`${length > 0 ? 'red-dot' : 'red-none'}`}></span></div></> ,
            subItems: [
                { label: 'All Orders', path: '/AllOrders'  },
                { 
                    label: (
                        <div className='dot-parent'>
                            New Orders
                            <span className={`${length > 0 ? 'red-dot-2' : 'red-none'}`}></span>
                        </div>
                    ), 
                    path: '/OrderManagement',

                  },
                { label: 'Current Orders', path: '/PreperingOrder' },
                { label: 'Out For Delivery Orders', path: '/Outfordelivery' }
            ],
            isDropdown: true
        },
       
        {
            title: 'User Management',
            icon: <HiUserGroup size={20} className='m-2' />,
            path: '/users'
        },
        {
            title: 'Sales Management',
            icon: <RiBarChartFill size={20} className='m-2' />,
            path: '/sales'
        },
        {
            title: 'Reports & Analytics',
            icon: <AiFillPieChart size={20} className='m-2' />,
            path: '/reports'
        },
        {
            title: 'Push Notifications',
            icon: <RiNotification2Fill size={20} className='m-2' />,
            subItems: [
                { label: 'All Notifications', path: '/AllNotifications' },
                { label: 'Send  A New Notification', path: '/NewNotification' },
            ],
            isDropdown: true
        },
        {
            title: 'Upload Banners',
            icon: <FaAd size={20} className='m-2' />,
            path: '/banners'
        },
        {
            title: 'Business Management',
            icon: <RiBuilding2Fill size={20} className='m-2' />,
            path: '/business'
        },
        {
            title: 'Menu Management',
            icon: <RiBuilding2Fill size={20} className='m-2' />,
            path: '/business'
        },
        {
            title: 'Business Management',
            icon: <RiBuilding2Fill size={20} className='m-2' />,
            path: '/business'
        }
    ];

    
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
            <div className="header-content">
                <button className="menu-btn" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                {isOpen && (
                    <div className='mt-3 mx-2'>
                        <Link to="/" className="logo ms-5">
                            <img src="/main-logo.png" alt="Logo" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
        <div className={`sidebar-content ${isOpen ? '' : 'mt-5'}`}>
            {menuItems.map((item, index) => {
                const isActive = location.pathname === item.path; // Check if the item is active

                return (
                    <div key={index}  style={{marginRight:`${isOpen ? '' : '10px'}`}}>
                        <div
                            className={`menu-item ${isActive ? 'active' : ''}` }
                            style={{borderRadius:`${item.isDropdown && activeDropdown === item.title && isOpen  ? '0px 15px 0px 0px' : '0px 15px 15px 0px'}`}}
                            onClick={() => item.isDropdown && toggleDropdown(item.title)}
                        >
                            {item.isDropdown ? (
                                <>
                                    <span className="icon">{item.icon}</span>
                                    {isOpen && (
                                        <>
                                            <span className="title text-white">{item.title}</span>
                                            <span className="dropdown-icon">
                                                {activeDropdown === item.title ? (
                                                    <ChevronDown size={20} />
                                                ) : (
                                                    <ChevronRight size={20} />
                                                )}
                                            </span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <Link to={item.path} className="menu-link text-white text-decoration-none w-100 d-flex align-items-center">
                                    <span className="icon ">{item.icon}</span>
                                    {isOpen && <span className="title">{item.title}</span>}
                                </Link>
                            )}
                        </div>
                        {item.isDropdown && activeDropdown === item.title && isOpen && (
                            <div className="submenu ">
                                {item.subItems.map((subItem, subIndex) => {
                                    const isSubActive = location.pathname === subItem.path; // Check if the sub-item is active
                                    return (
                                        <Link
                                            key={subIndex}
                                            to={subItem.path}
                                            className={`submenu-item text-white text-decoration-none ${isSubActive ? 'active' : ''}`}
                                        >
                                            <span>{subItem.label}</span>
                                            <ChevronRight size={16} className="chevron-icon" />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);
};

export default Sidebar;
