import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function AllNotifications() {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');
    const selectRole = (event) => {
        setRole(event.target.value);
    };
    const searchName = (event) => {
        setSearch(event.target.value);
    };

    return (
        <div className="page-container">
            <div className="header">
                <div className="add-item ">
                    <FaPlus className="plus-icon me-2" />
                    <Link className="text-decoration-none text-white" to="/AddNewItem"> Add New Notification</Link>
                </div>

                <div className="search w-50">
                    <FaSearch className="search-icons" />
                    <input
                        type="search"
                        placeholder="Search By Item Name"
                        value={search}
                        onChange={searchName}
                    />
                </div>

                <select className="form-select  custom-select text-center" onChange={selectRole}>
                    <option value="all">All</option>
                    <option value="business">Business</option>
                    <option value="personal">Personal</option>
                </select>
            </div >
        </div>
    )
}

export default AllNotifications