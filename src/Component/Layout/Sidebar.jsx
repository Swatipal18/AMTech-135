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
import { GiWallet } from "react-icons/gi";
import { IoSettingsSharp } from "react-icons/io5";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { BiBox } from "react-icons/bi";

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
            icon: <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" className='m-2 sidebar-icon'>
                <path d="M15.5 15.6667C15.5 16.1269 15.1269 16.5 14.6667 16.5H1.33333C0.8731 16.5 0.5 16.1269 0.5 15.6667V6.90756C0.5 6.6504 0.618725 6.40764 0.821717 6.24977L7.48842 1.06458C7.78933 0.830526 8.21067 0.830526 8.51158 1.06458L15.1782 6.24977C15.3812 6.40764 15.5 6.6504 15.5 6.90756V15.6667ZM3.83333 11.5V13.1667H12.1667V11.5H3.83333Z" fill="#8DA9C4" />
            </svg>
            ,
            path: '/Admin'
        },
        {
            title: 'Franchise Management',
            icon: <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg" className='m-2 sidebar-icon'>
                <path d="M17.5002 2.33329V14.6012C17.5002 14.766 17.4029 14.9155 17.2522 14.9822L10.0002 18.1927L2.74815 14.9822C2.59739 14.9155 2.50016 14.766 2.50016 14.6012V2.33329H0.833496V0.666626H19.1668V2.33329H17.5002ZM6.66683 8.99996V10.6666H13.3335V8.99996H6.66683ZM6.66683 5.66663V7.33329H13.3335V5.66663H6.66683Z" fill="#8DA9C4" />
            </svg>,

            path: '/franchise'
        },
        {
            title: 'Items Management',
            icon: <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" className='m-2 sidebar-icon'>
                <path d="M3.16699 0.5H15.667C16.5875 0.5 17.3337 1.24619 17.3337 2.16667V4.66667C17.3337 5.58714 16.5875 6.33333 15.667 6.33333H14.0003V8.83333C14.0003 10.6742 12.5079 12.1667 10.667 12.1667H5.66699C3.82604 12.1667 2.33366 10.6742 2.33366 8.83333V1.33333C2.33366 0.8731 2.70676 0.5 3.16699 0.5ZM14.0003 2.16667V4.66667H15.667V2.16667H14.0003ZM0.666992 13.8333H15.667V15.5H0.666992V13.8333Z" fill="#8DA9C4" />
            </svg>,
            subItems: [
                { label: 'All Items', path: '/all-items' },
                { label: 'Add New Item', path: '/AddNewItem' },
                { label: 'Categories', path: '/categories' },
                { label: 'Sizes', path: '/sizes' },
            ],
            isDropdown: true
        },
        {
            title: 'Subscriptions',
            icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className='m-2 sidebar-icon'>
                <path d="M3.83301 15.9166C1.76194 15.9166 0.0830078 14.2377 0.0830078 12.1666C0.0830078 10.0956 1.76194 8.41665 3.83301 8.41665C5.90407 8.41665 7.58301 10.0956 7.58301 12.1666C7.58301 14.2377 5.90407 15.9166 3.83301 15.9166ZM12.1663 7.58331C10.0953 7.58331 8.41634 5.90438 8.41634 3.83331C8.41634 1.76225 10.0953 0.083313 12.1663 0.083313C14.2374 0.083313 15.9163 1.76225 15.9163 3.83331C15.9163 5.90438 14.2374 7.58331 12.1663 7.58331ZM0.499674 4.66665C0.499674 2.36546 2.36516 0.49998 4.66634 0.49998H7.16634V2.16665H4.66634C3.28563 2.16665 2.16634 3.28594 2.16634 4.66665V7.16665H0.499674V4.66665ZM13.833 8.83331V11.3333C13.833 12.7141 12.7138 13.8333 11.333 13.8333H8.83301V15.5H11.333C13.6342 15.5 15.4997 13.6345 15.4997 11.3333V8.83331H13.833Z" fill="#8DA9C4" />
            </svg>
            ,
            subItems: [
                { label: 'All Subscriptions', path: '/AllSubscriptions' },
                { label: 'New Subscriptions', path: '/Subscription' },
                { label: 'Active Subscription', path: '/ActiveSubscription' },
            ],
            isDropdown: true
        },
        {
            title: 'Staff Management',
            icon: <RiUserStarFill size={20} className='m-2 sidebar-icon' />,
            subItems: [
                { label: 'All Staff', path: '/AllStaff' },
                { label: 'Add New Staff', path: '/AddStaff' }
            ],
            isDropdown: true
        },
        {
            title: 'Order Management',
            icon: <RiUserCommunityFill size={20} className='m-2 sidebar-icon' />,
            subItems: [
                { label: 'All Orders', path: '/AllOrders' },
                { label: 'New Orders', path: '/OrderManagement' },
                { label: 'Current Orders', path: '/PreperingOrder' },
                { label: 'Out For Delivery Orders', path: '/Outfordelivery' }
            ],
            isDropdown: true
        },
        {
            title: 'History Management',
            icon: <GiWallet size={20} className='m-2 sidebar-icon' />,
            path: '/history'
        },
        {
            title: 'User Management',
            icon: <HiUserGroup size={20} className='m-2 sidebar-icon' />,
            subItems: [
                { label: 'All Users', path: '/users' },
                { label: 'New Users', path: '/NewUser' },
            ],
            isDropdown: true
        },

        {
            title: 'Sales Management',
            icon: <RiBarChartFill size={20} className='m-2 sidebar-icon' />,
            path: '/sales'
        },
        {
            title: 'Reports & Analytics',
            icon: <AiFillPieChart size={20} className='m-2 sidebar-icon' />,
            path: '/reports'
        },
        {
            title: 'Push Notifications',
            icon: <RiNotification2Fill size={20} className='m-2 sidebar-icon' />,
            subItems: [
                { label: 'All Notifications', path: '/AllNotifications' },
                { label: 'Send  A New Notification', path: '/NewNotification' },
            ],
            isDropdown: true
        },
        {
            title: 'Upload Banners',
            icon: <FaAd size={20} className='m-2 sidebar-icon' />,
            subItems: [
                { label: 'All banners', path: '/AllBanners' },
                { label: 'New Banners', path: '/NewBanner' },
            ],
            isDropdown: true
        },
        {
            title: 'Business Management',
            icon: <RiBuilding2Fill size={20} className='m-2 sidebar-icon' />,
            path: '/business'
        },
        {
            title: 'Menu Management',
            icon: <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" className='m-2 sidebar-icon'>
                <path d="M17.3337 14.6667V3.83333L15.667 0.5H2.33366L0.666992 3.83627V14.6667C0.666992 15.1269 1.04009 15.5 1.50033 15.5H16.5003C16.9606 15.5 17.3337 15.1269 17.3337 14.6667ZM3.36351 2.16667H14.6368L15.4702 3.83333H2.53101L3.36351 2.16667ZM6.50033 7.16667H11.5003V8.83333H6.50033V7.16667Z" fill="#8DA9C4" />
            </svg>
            ,
            path: '/menu'
        },
        {
            title: 'Support',
            icon: <BsFillQuestionCircleFill size={20} className='m-2 sidebar-icon' />,
            path: '/support'
        },
        {
            title: 'Settings',
            icon: <IoSettingsSharp size={20} className='m-2 sidebar-icon' />,
            path: '/settings'
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
                            <Link to="/admin" className="logo ms-5">
                                <img src="/main-logo.png" alt="Logo" />
                            </Link>

                        </div>
                    )}
                </div>
            </div>
            <div className={`sidebar-content ${isOpen ? '' : 'mt-5'}`} >
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
