import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaAngleLeft, FaChevronRight } from "react-icons/fa";

function ActiveSubscription() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkedItems, setCheckedItems] = useState({});
    const limit = 10;
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const selectRole = (event) => {
        setRole(event.target.value);
    };


    useEffect(() => {
        fetchItems(currentPage, searchTerm);
    }, [currentPage, searchTerm]);
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
                await axios.delete(`${baseUrl}/menu/delete/${_id}`);
                fetchItems(currentPage, searchTerm);
                toast.success('Item deleted successfully!', {
                    position: "top-right",
                    autoClose: 1000,
                    theme: "colored",
                });
            } catch (error) {
                setError('Failed to delete item. Please try again.');
                console.error('Error deleting item:', error);
                toast.error('Failed to delete item. Please try again.', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            }
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

        // Only allow toggling from false to true
        setCheckedItems(prevState => ({
            ...prevState,
            [itemId]: {
                ...prevState[itemId],
                [type]: true, // Only allow setting to true
            }
        }));
    };

    const Pagination = () => {
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (currentPage - 1) * limit + 1;
        const endIndex = Math.min(currentPage * limit, totalItems);

        return (
            <div className="pagination-container">
                <div className="showing-text">
                    Showing {startIndex}-{endIndex} Of {totalItems} Items
                </div>
                <div className="pagination-controls">
                    <button
                        className='pagination-button'
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <FaAngleLeft />
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
                        disabled={currentPage === totalPages}
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
                            setSearchTerm(e.target.value);
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
                            <table className="table mt-3">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Subscription</th>
                                        <th>Period</th>
                                        <th>Subscription On</th>
                                        <th>Total</th>
                                        <th>Remaining</th>
                                        <th>Delivered</th>
                                        <th>Postponed</th>

                                    </tr>
                                </thead>
                                <tbody>

                                    {items.map((item, index) => (
                                        <tr key={`${item._id}-${index}`} className="table-row">
                                            <td>{item.itemName}</td>
                                            <td>{item.category}</td>
                                            <td>{item.period}</td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            
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