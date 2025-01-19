import React, { useState } from 'react';
import { Menu, Search, Store, Briefcase } from 'lucide-react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RiHome3Line } from "react-icons/ri";
import { RiCupLine } from "react-icons/ri";
import { RiUserCommunityFill } from "react-icons/ri";
import { RiUserStarFill } from "react-icons/ri";
import { HiUserGroup } from "react-icons/hi";
import { AiFillPieChart } from "react-icons/ai";
import { RiBarChartFill } from "react-icons/ri";
import { RiNotification2Fill } from "react-icons/ri";
import { FaAd } from "react-icons/fa";
import { RiBuilding2Fill } from "react-icons/ri";


const Sidebar = ({ onToggle, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
        onToggle && onToggle(!isOpen);
    };

    const toggleDropdown = (name) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const menuItems = [
        {
            title: 'Dashboard',
            icon: <RiHome3Line size={20} className='m-2' />,
            path: '/Admin'
        },
        {
            title: 'Franchise Management',
            icon: <Store size={20} className='m-2' />,
            path: '/franchise'
        },
        {
            title: 'Items Management',
            icon: <RiCupLine size={20} className='m-2' />,
            subItems: [
                { label: 'All Items', path: '/all-items' },
                { label: 'Add New Item', path: '/AddNewItem' },
                { label: 'Categories', path: '/categories' },
                { label: 'Sizes', path: '/sizes' }
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
            icon: <RiUserStarFill size={20} className='m-2' />,
            subItems: [
                { label: 'All Orders', path: '/AllOrders' },
                { label: 'New Orders', path: '/OrderManagement' },
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
            path: '/notifications'
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
            <div className="sidebar-content">
                {menuItems.map((item, index) => (
                    <div key={index}>
                        <div
                            className="menu-item"
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
                                    <span className="icon">{item.icon}</span>
                                    {isOpen && <span className="title">{item.title}</span>}
                                </Link>
                            )}
                        </div>
                        {item.isDropdown && activeDropdown === item.title && isOpen && (
                            <div className="submenu">
                                {item.subItems.map((subItem, subIndex) => (
                                    <Link
                                        key={subIndex}
                                        to={subItem.path}
                                        className="submenu-item text-white text-decoration-none"
                                    >
                                        <span>{subItem.label}</span>
                                        <ChevronRight size={16} className="chevron-icon" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
