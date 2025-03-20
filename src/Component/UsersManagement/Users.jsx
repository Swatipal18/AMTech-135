import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiOutlineInformationCircle } from "react-icons/hi2";

function Users() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [items, setItems] = useState([]);
    const [role, setRole] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const navigate = useNavigate();
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    useEffect(() => {
        fetchItems(currentPage, searchTerm);
    }, [currentPage, limit,role]);

    function Allitemsearch(e) {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        if (newSearchTerm.length > 2) {
            fetchItems(currentPage, newSearchTerm);
        }
        if (newSearchTerm.length <= 2 && searchTerm.length > 2) {
            fetchItems(currentPage); // Reset to default items or handle as needed
        }
    }
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const getRoleText = (roleNumber) => {
        const role = Number(roleNumber);
        if (role === 0) return "Business";
        if (role === 1) return "Personal";
        return roleNumber;
    };
    const fetchItems = async (page, search) => {
        try {
            setLoading(true);
            setError(null);
            const pageNumber = Math.max(Number(page), 1);
            const limitNumber = Number(limit);
            const response = await axios.get(`${baseUrl}/admin-business/list`, {
                params: { page: pageNumber, limit: limitNumber, search: search || '',role:role }
            });
            // console.log('response: ', response.data);
            if (response.data?.data?.businessList) {
                setItems(response.data.data.businessList || []);
                setTotalItems(response.data.data.businessList.length || 0);
            } else {
                setError('No Users found.');
            }
        } catch (error) {
            setError('Failed to fetch items. Please try again later.');
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectRole = (event) => {
        setRole(event.target.value);
    };
    const Pagination = () => {
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (currentPage - 1) * limit + 1;
        const endIndex = Math.min(currentPage * limit, totalItems);
        const isNextButtonDisabled = totalItems < limit;

        return (
            <div className="pagination-container ">
                <div className="d-flex align-items-center">

                    <span className="showing-text">
                        Showing {startIndex} Of
                        <select
                            className="me-1 text-center customselect border-0"
                            value={limit}
                            style={{ width: '-80px', border: 'none', backgroundColor: '#EEF4ED', color: '#0B2545' }}
                            onChange={(e) => {
                                const newLimit = Number(e.target.value);
                                setLimit(newLimit);
                                setCurrentPage(1);
                            }}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>User
                    </span>
                </div>

                <div className="pagination-controls">
                    <button
                        className='pagination-button'
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft />
                    </button>
                    <span
                        style={{
                            fontWeight: 'bold',
                            backgroundColor: '#8DA9C4',
                            color: '#0B2545',
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {currentPage}
                    </span>
                    <button
                        className='pagination-button'
                        onClick={() => setCurrentPage(prev => Math.max(prev + 1, totalPages))}
                        disabled={isNextButtonDisabled}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div >
        );
    };
    const handleDelete = async (_id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${baseUrl}/admin-business/delete/${_id}`);
                fetchItems(currentPage, searchTerm, limit);
                toast.success('Item deleted successfully!', {
                    position: "top-right",
                    autoClose: 1000,
                    theme: "colored",
                });
            } catch (error) {
                setError('Failed to delete user. Please try again.');
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user. Please try again.', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/EditUser/${id}`);
    };

    const handleInfoClick = async (userId) => {
        try {
            setLoadingDetails(true);
            setShowModal(true);
            const response = await axios.get(`${baseUrl}/admin-business/details/${userId}`);
            setSelectedUserData(response.data.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to fetch user details');
        } finally {
            setLoadingDetails(false);
        }
    };
    const handleCheckboxChange = async (userId, type, item) => {
        // Get current active state from the item directly
        const isCurrentlyActive = item.isActive;

        try {
            // Call the API to update the status (toggle isActive)
            const payload = {
                userId: userId,
                isActive: !isCurrentlyActive // Toggle the current state
            };

            // Update the endpoint to match your user status update API
            const response = await axios.put(`${baseUrl}/admin-business/update-status`, payload);

            // Show success message
            toast.success(`User ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully!`, {
                position: "top-right",
                autoClose: 1000,
                theme: "colored",
            });

            // Refresh the items list to get updated data
            fetchItems(currentPage, searchTerm);

        } catch (error) {
            console.error(`Error updating user status:`, error);
            toast.error(`Failed to update user status. Please try again.`, {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        }
    };

    return (
        <div className="page-container">
            <div className="header">
                <div className="add-item ">

                    <Link className="text-decoration-none text-white" to="/NewUser">
                        <FaPlus className="plus-icon me-2" />
                        Add New User</Link>
                </div>

                <div className="search w-50 ms-3">
                    <FaSearch className="search-icons" />
                    <input
                        type="search"
                        placeholder="Search By User Name"
                        value={searchTerm}
                        onChange={(e) => {
                            Allitemsearch(e)

                        }}
                    />
                </div>
                <div className='d-flex justify-content-end '>
                    <select className="form-select  custom-select text-center" onChange={selectRole}>
                        <option value="all">All</option>
                        <option value="business">Business</option>
                        <option value="personal">Personal</option>
                    </select>
                    <select className="form-select  custom-select text-center" onChange={selectRole}>
                        <option value="all">All</option>
                        <option value="business">Business</option>
                        <option value="personal">Personal</option>
                    </select>
                </div>
            </div >
            {
                loading ? (
                    <div className="loader-container d-flex justify-content-center">
                        <div className="loader"></div>
                    </div>
                ) :
                    items.length === 0 ? (
                        <div className="no-data mt-4 text-center text-danger fw-bold fs-4 ">No User Found</div>
                    ) :
                        error ? (
                            <div className="error-message">{error}</div>
                        ) :
                            (
                                <>
                                    <table className="table mt-3">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Type</th>
                                                <th>Registered</th>
                                                <th>Device Type </th>
                                                <th>Perks</th>
                                                <th>Orders</th>
                                                <th>Total Spend</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {items.map((item, index) => (

                                                <tr key={`${item._id}-${index}`} className="table-row">
                                                    <td className='text-capitalize'>{item.ownerName}</td>
                                                    <td className='text-capitalize'>{getRoleText(item.role)}</td>
                                                    <td className='text-capitalize'>{formatDate(item.createdAt)}</td>
                                                    <td className='text-capitalize'>{item.deviceType}</td>
                                                    <td>&#8377;  {item.availablePerks}</td>
                                                    <td>{item.totalOrder}</td>
                                                    <td>&#8377;  {item.totalSpend}</td>
                                                    <td>
                                                        <label className={`switch`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={item.isActive}
                                                                onChange={() => handleCheckboxChange(item._id, 'business', item)}
                                                            />
                                                            <div
                                                                className="slider"
                                                                style={{
                                                                    backgroundColor: item.isActive ? '#FF3B30' : '#4CAF50'
                                                                }}
                                                            ></div>
                                                            <div className="slider-card">
                                                                <div className="slider-card-face slider-card-front"></div>
                                                                <div className="slider-card-face slider-card-back"></div>
                                                            </div>
                                                        </label>
                                                    </td>
                                                    <td className="actions d-flex justify-content-around">
                                                        <button className="edit-btn" onClick={() => handleEdit(item._id, item)}>
                                                            EDIT
                                                        </button>
                                                        <button className="deletes-btn" onClick={() => handleDelete(item._id)}>
                                                            DELETE
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button className='btn' onClick={() => handleInfoClick(item._id)}>
                                                            <HiOutlineInformationCircle className='fs-3' />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>


                                        {showModal && (
                                            <>
                                                <div
                                                    className={`modal-slide-backdrop ${showModal ? 'show' : ''}`}
                                                    onClick={() => setShowModal(false)}
                                                    style={{
                                                        position: 'fixed',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                        zIndex: 1000,
                                                        opacity: showModal ? 1 : 0,
                                                        transition: 'opacity 0.3s ease-in-out'
                                                    }}
                                                />
                                                <div
                                                    className={`modal-slide ${showModal ? 'show' : ''}`}
                                                    style={{
                                                        position: 'fixed',
                                                        top: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        width: '600px',
                                                        maxWidth: '90%',
                                                        backgroundColor: '#fff',
                                                        boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.2)',
                                                        zIndex: 1001,
                                                        transform: showModal ? 'translateX(0)' : 'translateX(100%)',
                                                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        borderRadius: '12px 0 0 12px',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <div
                                                        className="modal-slide-header"
                                                        style={{
                                                            padding: '16px 20px',
                                                            borderBottom: '1px solid #e0e0e0',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            backgroundColor: '#f8f9fa'
                                                        }}
                                                    >
                                                        <h5
                                                            className="m-0 bg-transparent"
                                                            style={{
                                                                fontSize: '1.25rem',
                                                                fontWeight: 600,
                                                                color: '#11325a'
                                                            }}
                                                        >
                                                            {selectedUserData?.businessUser ? 'Business Information' : 'Personal Information'}
                                                        </h5>
                                                        <button
                                                            className="modal-slide-close"
                                                            onClick={() => setShowModal(false)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                fontSize: '1.75rem',
                                                                color: '#dc3545',
                                                                cursor: 'pointer',
                                                                transition: 'transform 0.2s',
                                                                padding: '0 8px',
                                                                outline: 'none'
                                                            }}
                                                            onMouseOver={(e) => e.target.style.transform = 'rotate(90deg)'}
                                                            onMouseOut={(e) => e.target.style.transform = 'rotate(0deg)'}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <div
                                                        className="modal-slide-body"
                                                        style={{
                                                            padding: '20px',
                                                            overflowY: 'auto',
                                                            flex: 1
                                                        }}
                                                    >
                                                        {loadingDetails ? (
                                                            <div
                                                                className="text-center p-4"
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    height: '100%'
                                                                }}
                                                            >
                                                                <div
                                                                    className="spinner"
                                                                    style={{
                                                                        width: '50px',
                                                                        height: '50px',
                                                                        border: '5px solid rgba(0, 123, 255, 0.1)',
                                                                        borderRadius: '50%',
                                                                        borderTop: '5px solid #007bff',
                                                                        animation: 'spin 1s linear infinite'
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : selectedUserData ? (
                                                            <div
                                                                className="row g-4"
                                                                style={{
                                                                    opacity: 0,
                                                                    animation: 'fadeIn 0.5s forwards',
                                                                    animationDelay: '0.2s'
                                                                }}
                                                            >
                                                                {selectedUserData.businessUser ? (
                                                                    <>
                                                                        {/* Images Section */}
                                                                        <div className="col-12">
                                                                            <div
                                                                                className="info-card"
                                                                                style={{
                                                                                    backgroundColor: '#fff',
                                                                                    borderRadius: '12px',
                                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                                                                    overflow: 'hidden'
                                                                                }}
                                                                                onMouseOver={(e) => {
                                                                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                                                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                                                                }}
                                                                                onMouseOut={(e) => {
                                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                                                                }}
                                                                            >
                                                                                <div className="card-body" style={{ padding: '20px' }}>
                                                                                    <h3
                                                                                        className="card-title text-center"
                                                                                        style={{
                                                                                            fontSize: '1.5rem',
                                                                                            fontWeight: '600',
                                                                                            marginBottom: '15px',
                                                                                            color: '#333',
                                                                                            borderBottom: '2px solid #f0f0f0',
                                                                                            paddingBottom: '10px'
                                                                                        }}
                                                                                    >
                                                                                        Business Images
                                                                                    </h3>
                                                                                    <div
                                                                                        className="d-flex flex-wrap gap-3 mt-3 justify-content-center"
                                                                                        style={{
                                                                                            maxHeight: '300px',
                                                                                            overflowY: 'auto',
                                                                                            padding: '5px',
                                                                                            scrollbarWidth: 'thin',
                                                                                            scrollbarColor: '#888 #f1f1f1'
                                                                                        }}
                                                                                    >
                                                                                        {selectedUserData.businessUser.images?.map((image, index) => (
                                                                                            <div
                                                                                                key={index}
                                                                                                style={{
                                                                                                    width: '200px',
                                                                                                    height: '150px',
                                                                                                    opacity: 0,
                                                                                                    animation: 'fadeInUp 0.5s forwards',
                                                                                                    animationDelay: `${0.1 * index}s`
                                                                                                }}
                                                                                            >
                                                                                                <img
                                                                                                    src={`${baseUrl}/${image}`}
                                                                                                    alt={`Business ${index + 1}`}
                                                                                                    className="rounded"
                                                                                                    style={{
                                                                                                        width: '100%',
                                                                                                        height: '100%',
                                                                                                        objectFit: 'cover',
                                                                                                        transition: 'all 0.3s ease',
                                                                                                        cursor: 'pointer',
                                                                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                                                                    }}
                                                                                                    onMouseOver={(e) => {
                                                                                                        e.target.style.transform = 'scale(1.05)';
                                                                                                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                                                                    }}
                                                                                                    onMouseOut={(e) => {
                                                                                                        e.target.style.transform = 'scale(1)';
                                                                                                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Business Information */}
                                                                        <div className="col-md-6">
                                                                            <div
                                                                                className="info-card"
                                                                                style={{
                                                                                    backgroundColor: '#fff',
                                                                                    borderRadius: '12px',
                                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                                                    height: '100%',
                                                                                    transition: 'transform 0.3s, box-shadow 0.3s'
                                                                                }}
                                                                                onMouseOver={(e) => {
                                                                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                                                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                                                                }}
                                                                                onMouseOut={(e) => {
                                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                                                                }}
                                                                            >
                                                                                <div className="card-body fs-6" style={{ padding: '20px' }}>
                                                                                    <h6
                                                                                        className="card-title text-center"
                                                                                        style={{
                                                                                            fontSize: '1.1rem',
                                                                                            fontWeight: '600',
                                                                                            marginBottom: '15px',
                                                                                            color: '#333',
                                                                                            borderBottom: '2px solid #f0f0f0',
                                                                                            paddingBottom: '10px'
                                                                                        }}
                                                                                    >
                                                                                        Basic Information
                                                                                    </h6>
                                                                                    <div
                                                                                        className="info-field mb-3"
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                            padding: '8px 0',
                                                                                            borderBottom: '1px dashed #eee'
                                                                                        }}
                                                                                    >
                                                                                        <strong style={{ color: '#555' }}>Business Name:</strong>
                                                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedUserData.businessUser.businessName}</span>
                                                                                    </div>
                                                                                    <div
                                                                                        className="info-field mb-3"
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                            padding: '8px 0',
                                                                                            borderBottom: '1px dashed #eee'
                                                                                        }}
                                                                                    >
                                                                                        <strong style={{ color: '#555' }}>Owner Name:</strong>
                                                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedUserData.businessUser.ownerName}</span>
                                                                                    </div>
                                                                                    <div
                                                                                        className="info-field mb-3"
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                            padding: '8px 0',
                                                                                            borderBottom: '1px dashed #eee'
                                                                                        }}
                                                                                    >
                                                                                        <strong style={{ color: '#555' }}>Occupant:</strong>
                                                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedUserData.businessUser.ocupant}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Contact Information */}
                                                                        <div className="col-md-6">
                                                                            <div
                                                                                className="info-card"
                                                                                style={{
                                                                                    backgroundColor: '#fff',
                                                                                    borderRadius: '12px',
                                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                                                    height: '100%',
                                                                                    transition: 'transform 0.3s, box-shadow 0.3s'
                                                                                }}
                                                                                onMouseOver={(e) => {
                                                                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                                                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                                                                }}
                                                                                onMouseOut={(e) => {
                                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                                                                }}
                                                                            >
                                                                                <div className="card-body" style={{ padding: '20px' }}>
                                                                                    <h6
                                                                                        className="card-title text-center"
                                                                                        style={{
                                                                                            fontSize: '1.1rem',
                                                                                            fontWeight: '600',
                                                                                            // marginBottom: '15px',
                                                                                            color: '#333',
                                                                                            borderBottom: '2px solid #f0f0f0',
                                                                                            // paddingBottom: '10px'
                                                                                        }}
                                                                                    >
                                                                                        Contact Information
                                                                                    </h6>
                                                                                    <div
                                                                                        className="info-field mb-3"
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                            padding: '8px 0',
                                                                                            borderBottom: '1px dashed #eee'
                                                                                        }}
                                                                                    >
                                                                                        <strong style={{ color: '#555' }}>Contact:</strong>
                                                                                        <span style={{ color: '#333', fontWeight: '400' }}>{selectedUserData.businessUser.contact}</span>
                                                                                    </div>
                                                                                    <div
                                                                                        className="info-field mb-3"
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                            padding: '8px 0',
                                                                                            borderBottom: '1px dashed #eee'
                                                                                        }}
                                                                                    >
                                                                                        <strong style={{ color: '#555' }}>Address:</strong>
                                                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedUserData.businessUser.address}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {selectedUserData.normalUser.profileImage && (
                                                                            <div className="col-12">
                                                                                <div
                                                                                    className="info-card"
                                                                                    style={{
                                                                                        backgroundColor: '#fff',
                                                                                        borderRadius: '12px',
                                                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                                                                        overflow: 'hidden'
                                                                                    }}
                                                                                    onMouseOver={(e) => {
                                                                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                                                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                                                                    }}
                                                                                    onMouseOut={(e) => {
                                                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                                                                    }}
                                                                                >
                                                                                    <div className="card-body" style={{ padding: '20px' }}>
                                                                                        <h3
                                                                                            className="card-title text-center"
                                                                                            style={{
                                                                                                fontSize: '1.5rem',
                                                                                                fontWeight: '600',
                                                                                                marginBottom: '15px',
                                                                                                color: '#333',
                                                                                                borderBottom: '2px solid #f0f0f0',
                                                                                                paddingBottom: '10px'
                                                                                            }}
                                                                                        >
                                                                                            Profile Image
                                                                                        </h3>
                                                                                        <div
                                                                                            className="d-flex justify-content-center mt-3"
                                                                                            style={{
                                                                                                opacity: 0,
                                                                                                animation: 'fadeInUp 0.5s forwards',
                                                                                                animationDelay: '0.1s'
                                                                                            }}
                                                                                        >
                                                                                            <div style={{ width: '200px', height: '200px' }}>
                                                                                                <img
                                                                                                    src={`${selectedUserData.normalUser.profileImage}`}
                                                                                                    alt="Profile"
                                                                                                    className="rounded-circle"
                                                                                                    style={{
                                                                                                        width: '100%',
                                                                                                        height: '100%',
                                                                                                        objectFit: 'cover',
                                                                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                                                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                                                                                    }}
                                                                                                    onMouseOver={(e) => {
                                                                                                        e.target.style.transform = 'scale(1.05)';
                                                                                                        e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                                                                                                    }}
                                                                                                    onMouseOut={(e) => {
                                                                                                        e.target.style.transform = 'scale(1)';
                                                                                                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Personal Information */}
                                                                        <div className="col-md-6">
                                                                            <div
                                                                                className="info-card"
                                                                                style={{
                                                                                    backgroundColor: '#fff',
                                                                                    borderRadius: '12px',
                                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                                                    height: '100%',
                                                                                    transition: 'transform 0.3s, box-shadow 0.3s'
                                                                                }}
                                                                                onMouseOver={(e) => {
                                                                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                                                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                                                                }}
                                                                                onMouseOut={(e) => {
                                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                                                                }}
                                                                            >
                                                                                <div className="card-body" style={{ padding: '20px' }}>
                                                                                    <h6
                                                                                        className="card-title text-center"
                                                                                        style={{
                                                                                            fontSize: '1.1rem',
                                                                                            fontWeight: '600',
                                                                                            marginBottom: '15px',
                                                                                            color: '#333',
                                                                                            borderBottom: '2px solid #f0f0f0',
                                                                                            paddingBottom: '10px'
                                                                                        }}
                                                                                    >
                                                                                        Personal Information
                                                                                    </h6>
                                                                                    <div
                                                                                        className="info-field mb-3"
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                            padding: '8px 0',
                                                                                            borderBottom: '1px dashed #eee'
                                                                                        }}
                                                                                    >
                                                                                        <strong style={{ color: '#555' }}>First Name:</strong>
                                                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedUserData.normalUser.firstName}</span>
                                                                                    </div>
                                                                                    <div
                                                                                        className="info-field mb-3"
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                            padding: '8px 0',
                                                                                            borderBottom: '1px dashed #eee'
                                                                                        }}
                                                                                    >
                                                                                        <strong style={{ color: '#555' }}>Last Name:</strong>
                                                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedUserData.normalUser.lastName}</span>
                                                                                    </div>
                                                                                    <div
                                                                                        className="info-field mb-3"
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                            padding: '8px 0',
                                                                                            borderBottom: '1px dashed #eee'
                                                                                        }}
                                                                                    >
                                                                                        <strong style={{ color: '#555' }}>Contact:</strong>
                                                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedUserData.normalUser.contact}</span>
                                                                                    </div>
                                                                                    <div
                                                                                        className="info-field mb-3"
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                            padding: '8px 0',
                                                                                            borderBottom: '1px dashed #eee'
                                                                                        }}
                                                                                    >
                                                                                        <strong style={{ color: '#555' }}>Address:</strong>
                                                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedUserData.normalUser.address}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}

                                                                {/* Account Status - Common for both types */}
                                                                <div className="col-md-6">
                                                                    <div
                                                                        className="info-card"
                                                                        style={{
                                                                            backgroundColor: '#fff',
                                                                            borderRadius: '12px',
                                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                                            height: '100%',
                                                                            transition: 'transform 0.3s, box-shadow 0.3s'
                                                                        }}
                                                                        onMouseOver={(e) => {
                                                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                                                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                                                        }}
                                                                        onMouseOut={(e) => {
                                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                                                        }}
                                                                    >
                                                                        <div className="card-body" style={{ padding: '20px' }}>
                                                                            <h6
                                                                                className="card-title text-center"
                                                                                style={{
                                                                                    fontSize: '1.1rem',
                                                                                    fontWeight: '600',
                                                                                    marginBottom: '15px',
                                                                                    color: '#333',
                                                                                    borderBottom: '2px solid #f0f0f0',
                                                                                    paddingBottom: '10px'
                                                                                }}
                                                                            >
                                                                                Account Status
                                                                            </h6>
                                                                            <div
                                                                                className="info-field mb-3"
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center',
                                                                                    padding: '8px 0',
                                                                                    borderBottom: '1px dashed #eee'
                                                                                }}
                                                                            >
                                                                                <strong style={{ color: '#555' }}>Status:</strong>
                                                                                <span
                                                                                    style={{
                                                                                        padding: '4px 10px',
                                                                                        borderRadius: '50px',
                                                                                        fontSize: '0.85rem',
                                                                                        fontWeight: '500',
                                                                                        color: '#fff',
                                                                                        backgroundColor: selectedUserData.businessUser?.isActive || selectedUserData.normalUser?.isActive ? '#34C759' : '#FF3B30',
                                                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                                                                    }}
                                                                                >
                                                                                    {selectedUserData.businessUser?.isActive || selectedUserData.normalUser?.isActive ? 'Active' : 'Inactive'}
                                                                                </span>
                                                                            </div>
                                                                            <div
                                                                                className="info-field mb-3"
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center',
                                                                                    padding: '8px 0',
                                                                                    borderBottom: '1px dashed #eee'
                                                                                }}
                                                                            >
                                                                                <strong style={{ color: '#555' }}>Created At:</strong>
                                                                                <span style={{ color: '#333', fontWeight: '500' }}>
                                                                                    {formatDate(selectedUserData.businessUser?.createdAt || selectedUserData.normalUser?.createdAt)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="text-center p-4"
                                                                style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    height: '100%',
                                                                    color: '#6c757d'
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="64"
                                                                    height="64"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 16 16"
                                                                    style={{ marginBottom: '15px', opacity: 0.5 }}
                                                                >
                                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                                                                </svg>
                                                                <p style={{ fontSize: '1.1rem' }}>No data available</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeInUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Custom scrollbar styles */
      .modal-slide-body::-webkit-scrollbar {
        width: 8px;
      }
      
      .modal-slide-body::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      
      .modal-slide-body::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
      }
      
      .modal-slide-body::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `}</style>
                                            </>
                                        )}
                                    </table>
                                    <Pagination />
                                </>
                            )
            }
            <ToastContainer />
        </div >
    )
}

export default Users