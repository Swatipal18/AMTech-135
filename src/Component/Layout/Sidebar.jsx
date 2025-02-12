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
import { BiSolidBookmarkMinus } from "react-icons/bi";

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
            icon: <RiHome3Line size={20} className='m-2 sidebar-icon' />,
            path: '/Admin'
        },
        {
            title: 'Franchise Management',
            // icon: <BiSolidBookmarkMinus size={20} className='m-2 sidebar-icon' />,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path className='m-2 sidebar-icon' d="M12 4C9.4095 4 7.10606 5.23053 5.64274 7.14274L8 9.5H2V3.5L4.21863 5.71863C6.05061 3.452 8.85558 2 12 2 17.5228 2 22 6.47715 22 12H20C20 7.58172 16.4183 4 12 4ZM4 12C4 16.4183 7.58172 20 12 20 14.5905 20 16.894 18.7695 18.3573 16.8573L16 14.5 22 14.5V20.5L19.7814 18.2814C17.9494 20.548 15.1444 22 12 22 6.47715 22 2 17.5228 2 12H4Z"></path></svg>,

            path: '/franchise'
        },
        {
            title: 'Items Management',
            icon: <RiCupLine size={20} className='m-2 sidebar-icon' />,
            subItems: [
                { label: 'All Items', path: '/all-items' },
                { label: 'Add New Item', path: '/AddNewItem' },
                { label: 'Categories', path: '/categories' },
                { label: 'Sizes', path: '/sizes' },
                { label: 'Subscriptions', path: '' }
            ],
            isDropdown: true
        },
        {
            title: 'Subscriptions',
            icon: <HiUserGroup size={20} className='m-2 sidebar-icon' />,
            subItems: [
                { label: 'All Subscriptions', path: '/AllSubscriptions' },
                { label: 'New Subscriptions', path: '/Subscription' },
                { label: 'Active Subscription', path: '/ActiveSubscription' },  
            ],
            isDropdown: true
        },
        {
            title: 'Staff Management',
            icon: <RiUserCommunityFill size={20} className='m-2 sidebar-icon' />,
            subItems: [
                { label: 'All Staff', path: '/AllStaff' },
                { label: 'Add New Staff', path: '/AddStaff' }
            ],
            isDropdown: true
        },
        {
            title: 'Order Management',
            icon: <RiUserStarFill size={20} className='m-2 sidebar-icon' />,
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
                // { label: 'Current Orders', path: '/PreperingOrder' },
                // { label: 'Out For Delivery Orders', path: '/Outfordelivery' }
            ],
            isDropdown: true
        },
        // {
        //     title: 'User Management',
        //     icon: <HiUserGroup size={20} className='m-2 sidebar-icon' />,
        //     path: '/users'
        // },
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
            icon: <BiBox size={20} className='m-2 sidebar-icon' />,
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
