import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function ActiveSubscription() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkedItems, setCheckedItems] = useState({});
    const [limit, setLimit] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const selectRole = (event) => {
        setRole(event.target.value);
    };


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
    // Fetch items from API
    const fetchItems = async (page, search) => {
        try {
            setLoading(true);
            setError(null);
            const pageNumber = Math.max(Number(page), 1);
            const limitNumber = Number(limit);
            const response = await axios.get(`${baseUrl}/subscriptions/list`, {
                params: { page: pageNumber, limit: limitNumber, search: search || '' }
            });

            if (response.data?.data?.subsItems) {
                setItems(response.data.data.subsItems || []);
                setTotalItems(response.data.data.total || 0);
            } else {
                setError('No items found.');
            }
        } catch (error) {
            setError('Failed to fetch items. Please try again later.');
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id) => {
        navigate(`/EditItem/${id}`);
    };

    const handleCheckboxChange = (itemId, type, item) => {
        // Prevent toggling if status is already active (green)
        if ((type === 'business' && item.isActiveForBusiness) ||
            (type === 'personal' && item.isActiveForPersonal)) {
            Swal.fire({
                title: 'Not Allowed',
                text: `Cannot deactivate ${type} status once it is active.`,
                icon: 'info',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Check if trying to toggle business status
        if (type === 'business' && !item.isActiveForBusiness) {
            if (!item.size || item.size.length === 0) {
                Swal.fire({
                    title: 'Action Required',
                    text: 'Please edit the item and add size information before activating business status.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (!item.businessFields || Object.keys(item.businessFields).length === 0) {
                Swal.fire({
                    title: 'Action Required',
                    text: 'Business fields are empty. Please edit the item and fill in required business information.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }
        }

        // Check if trying to toggle personal status
        if (type === 'personal' && !item.isActiveForPersonal) {
            if (!item.size || item.size.length === 0) {
                Swal.fire({
                    title: 'Action Required',
                    text: 'Please edit the item and add size information before activating personal status.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (!item.personalFields || Object.keys(item.personalFields).length === 0) {
                Swal.fire({
                    title: 'Action Required',
                    text: 'Personal fields are empty. Please edit the item and fill in required personal information.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }
        }
        setCheckedItems(prevState => ({
            ...prevState,
            [itemId]: {
                ...prevState[itemId],
                [type]: true,
            }
        }));
    };

    const Pagination = () => {
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (currentPage - 1) * limit + 1;
        const endIndex = Math.min(currentPage * limit, totalItems);

        return (
            <div className="pagination-container ">
                <div className="d-flex align-items-center">

                    <span className="showing-text">
                        Showing {startIndex}-{endIndex} Of
                        <select
                            className="me-1 text-center customselect "
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
                    // disabled={currentPage === totalPages}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        );
    };


    return (
        <div className="page-container">
            <div className="header">
                <select className="form-select custom-select text-center" onChange={selectRole}>
                    <option value="all">All</option>
                    <option value="business">Business</option>
                    <option value="personal">Personal</option>
                </select>

                <div className="search w-50">
                    <FaSearch className="search-icons" />
                    <input
                        type="search"
                        placeholder="Search By User"
                        value={searchTerm}
                        onChange={(e) => {
                            Allitemsearch(e)
                        }}
                    />
                </div>

                <select className="form-select custom-select text-center" onChange={selectRole}>
                    <option value="all">All</option>
                    <option value="business">Business</option>
                    <option value="personal">Personal</option>
                </select>
            </div >

            {
                loading ? (
                    <div className="loader-container d-flex justify-content-center">
                        <div className="loader"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="no-data mt-4 text-center text-danger fw-bold fs-4 ">No Items Found</div>
                ) :
                    error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <>
                            <table className="table mt-3 table-hover">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Subscription</th>
                                        <th>Period</th>
                                        <th>Subscribed On</th>
                                        <th className='text-center'>Total</th>
                                        <th className='text-center'>Remaining</th>
                                        <th className='text-center'>Delivered</th>
                                        <th className='text-center'>Postponed</th>

                                    </tr>
                                </thead>
                                <tbody>

                                    {items.map((item, index) => (
                                        <tr key={`${item._id}-${index}`} className="table-row ">
                                            <td className='text-capitalize'>AMTech Design </td>
                                            <td className='text-capitalize'>Masala Tea Jar</td>
                                            <td className='text-capitalize'>Monthly</td>
                                            <td className='text-capitalize'>12 feb 2025 </td>
                                            <td className='text-center'>78</td>
                                            <td className='text-center'>78</td>
                                            <td style={{ color: '#40C057', fontSize: '17px' }} className='text-center'>12</td>
                                            <td style={{ color: '#FF3B30 ', fontSize: '17px' }} className='text-center'>5</td>

                                            <td className="actions d-flex justify-content-around">
                                                <button className="edit-btn" onClick={() => handleEdit(item._id, item)}>
                                                    EDIT
                                                </button>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination />
                        </>
                    )}
            <ToastContainer />
        </div >
    );
}

export default ActiveSubscription