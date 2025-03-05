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
    }, [currentPage, limit]);

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
                params: { page: pageNumber, limit: limitNumber, search: search || '' }
            });
            console.log('response: ', response.data.data.businessList);
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
            <div className="pagination-container d-flex align-items-center justify-content-between">
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
                                                    <td>{item.ownerName}</td>
                                                    <td>{getRoleText(item.role)}</td>
                                                    <td>{formatDate(item.createdAt)}</td>
                                                    <td>{item.deviceType}</td>
                                                    <td>&#8377;  {item.availablePerks}</td>
                                                    <td>{item.totalOrder}</td>
                                                    <td>&#8377;  {item.totalSpend}</td>
                                                    <td>
                                                        <label className={`switch`}>
                                                            <input
                                                                type="checkbox"
                                                            />
                                                            <div
                                                                className="slider"
                                                                style={{
                                                                    backgroundColor: item.isActiveForPersonal ? '#FF3B30' : '#4CAF50'
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
                                                        <button className="delete-btn" onClick={() => handleDelete(item._id)}>
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
                                                />
                                                <div className={`modal-slide ${showModal ? 'show' : ''}`}>
                                                    <div className="modal-slide-header ">
                                                        <h5 className="m-0 bg-transparent">
                                                            {selectedUserData?.businessUser ? 'Business Information' : 'Personal Information'}
                                                        </h5>
                                                        <button
                                                            className="modal-slide-close text-danger fs-2 bg-transparent"
                                                            onClick={() => setShowModal(false)}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <div className="modal-slide-body ">
                                                        {loadingDetails ? (
                                                            <div className="text-center p-4 bg-transparent">
                                                                <div className="spinner-border text-primary" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                            </div>
                                                        ) : selectedUserData ? (
                                                            <div className="row g-3 bg-transparent">
                                                                {selectedUserData.businessUser ? (
                                                                    <>
                                                                        {/* Images Section */}
                                                                        <div className="col-12">
                                                                            <div className="info-card">
                                                                                <div className="card-body">
                                                                                    <h3 className="card-title text-center">Business Images</h3>
                                                                                    <div className="d-flex flex-wrap gap-3 mt-3">
                                                                                        {selectedUserData.businessUser.images?.map((image, index) => (
                                                                                            <div key={index} style={{ width: '200px', height: '150px' }}>
                                                                                                <img
                                                                                                    src={`${baseUrl}/${image}`}
                                                                                                    alt={`Business ${index + 1}`}
                                                                                                    className="img-fluid rounded"
                                                                                                    style={{
                                                                                                        width: '100%',
                                                                                                        height: '100%',
                                                                                                        objectFit: 'cover',
                                                                                                        transition: 'transform 0.3s ease',
                                                                                                        cursor: 'pointer'
                                                                                                    }}
                                                                                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                                                                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                                                                                />
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Business Information */}
                                                                        <div className="col-md-6">
                                                                            <div className="info-card">
                                                                                <div className="card-body fs-6">
                                                                                    <h6 className="card-title text-center">Basic Information</h6>
                                                                                    <div className="info-field mb-2">
                                                                                        <strong>Business Name:</strong>
                                                                                        <span>{selectedUserData.businessUser.businessName}</span>
                                                                                    </div>
                                                                                    <div className="info-field mb-2">
                                                                                        <strong>Owner Name:</strong>
                                                                                        <span>{selectedUserData.businessUser.ownerName}</span>
                                                                                    </div>
                                                                                    <div className="info-field mb-2">
                                                                                        <strong>Ocupant:</strong>
                                                                                        <span>{selectedUserData.businessUser.ocupant}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Contact Information */}
                                                                        <div className="col-md-6">
                                                                            <div className="info-card">
                                                                                <div className="card-body">
                                                                                    <h3 className="card-title text-center">Contact Information</h3>
                                                                                    <div className="info-field mb-2">
                                                                                        <strong>Contact:</strong>
                                                                                        <span>{selectedUserData.businessUser.contact}</span>
                                                                                    </div>
                                                                                    <div className="info-field mb-2">
                                                                                        <strong>Address:</strong>
                                                                                        <span>{selectedUserData.businessUser.address}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {selectedUserData.normalUser.profileImage && (
                                                                            <div className="col-12">
                                                                                <div className="info-card">
                                                                                    <div className="card-body">
                                                                                        <h3 className="card-title text-center">Profile Image</h3>
                                                                                        <div className="d-flex justify-content-center mt-3">
                                                                                            <div style={{ width: '200px', height: '200px' }}>
                                                                                                <img
                                                                                                    src={`${selectedUserData.normalUser.profileImage}`}
                                                                                                    alt="Profile"
                                                                                                    className="img-fluid rounded-circle"
                                                                                                    style={{
                                                                                                        width: '100%',
                                                                                                        height: '100%',
                                                                                                        objectFit: 'cover'
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
                                                                            <div className="info-card">
                                                                                <div className="card-body">
                                                                                    <h6 className="card-title text-center">Personal Information</h6>
                                                                                    <div className="info-field mb-2">
                                                                                        <strong>First Name:</strong>
                                                                                        <span>{selectedUserData.normalUser.firstName}</span>
                                                                                    </div>
                                                                                    <div className="info-field mb-2">
                                                                                        <strong>Last Name:</strong>
                                                                                        <span>{selectedUserData.normalUser.lastName}</span>
                                                                                    </div>
                                                                                    <div className="info-field mb-2">
                                                                                        <strong>Contact:</strong>
                                                                                        <span>{selectedUserData.normalUser.contact}</span>
                                                                                    </div>
                                                                                    <div className="info-field mb-2">
                                                                                        <strong>Address:</strong>
                                                                                        <span>{selectedUserData.normalUser.address}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}

                                                                {/* Account Status - Common for both types */}
                                                                <div className="col-md-6">
                                                                    <div className="info-card">
                                                                        <div className="card-body">
                                                                            <h6 className="card-title text-center">Account Status</h6>
                                                                            <div className="info-field mb-2">
                                                                                <strong>Status:</strong>
                                                                                <span className={`badge ${selectedUserData.businessUser?.isActive || selectedUserData.normalUser?.isActive ? 'bg-success' : 'bg-danger'} ms-2 fs-6 text-white`}>
                                                                                    {selectedUserData.businessUser?.isActive || selectedUserData.normalUser?.isActive ? 'Active' : 'Inactive'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="info-field mb-2">
                                                                                <strong>Created At:</strong>
                                                                                <span>
                                                                                    {formatDate(selectedUserData.businessUser?.createdAt || selectedUserData.normalUser?.createdAt)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center p-4">
                                                                <p>No data available</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
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