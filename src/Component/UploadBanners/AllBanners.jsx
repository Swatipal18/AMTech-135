import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaArrowsAlt, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash.debounce';

function AllBanners() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalRecord, setTotalRecord] = useState(0);
    // New state for modal
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

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

    const selectRole = (event) => {
        setRole(event.target.value);
    };

    const searchName = (event) => {
        setSearch(event.target.value);
    };

    // Open image modal
    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowModal(true);
    };

    // Close image modal
    const closeImageModal = () => {
        setShowModal(false);
        setSelectedImage('');
    };

    // Get status color based on activity
    const getStatusColor = (activity) => {
        switch (activity.toLowerCase()) {
            case 'active':
                return '#40C057';
            case 'inactive':
                return '#FF3B30';
            case 'scheduled':
                return '#0B2545';
            default:
                return '#000000';
        }
    };

    const Pagination = () => {
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (currentPage - 1) * limit + 1;
        const endIndex = Math.min(currentPage * limit, totalItems);
        const isNextButtonDisabled = totalItems < limit;

        return (
            <div className="pagination-container" >
                <div className="d-flex align-items-center">
                    <span className="showing-text">
                        Showing {totalRecord} Of
                        <select
                            className="me-1 text-center customselect "
                            value={limit}
                            style={{ width: '-80px', border: 'none', backgroundColor: '#EEF4ED', color: '#0B2545' }}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setCurrentPage(1);
                            }}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>Banner
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
            </div>
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
                await axios.delete(`${baseUrl}/delete/banner/${_id}`);
                fetchItems();
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
                    autoClose: 1000,
                    theme: "colored",
                });
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/EditBanner/${id}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const fetchItems = async (page, search) => {
        try {
            setLoading(true);
            setError(null);
            const pageNumber = Math.max(Number(page), 1);
            const limitNumber = Number(limit);
            const response = await axios.get(`${baseUrl}/admin/get/banner`, {
                params: { page: pageNumber, limit: limitNumber, search: search || '' }
            });
            console.log('response: ', response.data);

            if (response.data?.data?.banners) {
                setItems(response.data.data.banners || []);
                setTotalItems(response.data.data.banners.length || 0);
                setTotalRecord(response.data.data.banners.length || 0)
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

    return (
        <div className="page-container">
            {/* Image Modal */}
            {showModal && (
                <div className="" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="" style={{
                        position: 'relative',
                        padding: '10px',
                        borderRadius: '5px',
                        maxWidth: '100%'
                    }}>
                        <button
                            onClick={closeImageModal}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                                zIndex: 1001
                            }}
                        >
                            <FaTimes color='red' />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Banner Preview"
                            style={{
                                width: '680px',
                                height: '200px',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="header">
                <div className="add-item ">
                    <Link className="text-decoration-none text-white" to="/NewBanner">
                        <FaPlus className="plus-icon me-2" />
                        Add New Banner
                    </Link>
                </div>

                <div className="search w-50">
                    <FaSearch className="search-icons" />
                    <input
                        type="search"
                        placeholder="Search By Target"
                        value={search}
                        onChange={searchName}
                    />
                </div>

                <select className="form-select custom-select text-center" onChange={selectRole}>
                    <option value="all">All</option>
                    <option value="business">Business</option>
                    <option value="personal">Personal</option>
                </select>
            </div>

            {loading ? (
                <div className="loader-container d-flex justify-content-center">
                    <div className="loader"></div>
                </div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <>
                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Banner</th>
                                <th>Status</th>
                                <th>Published</th>
                                <th>Clicks</th>
                                <th>Target</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={`${item._id}-${index}`} className="table-row">
                                    <td><FaArrowsAlt /></td>
                                    <td>
                                        <img
                                            src={item.imageUrl}
                                            alt="Banner"
                                            height="40"
                                            width="200"
                                            style={{ objectFit: 'cover', cursor: "pointer" }}
                                            onClick={() => openImageModal(item.imageUrl)}
                                        />
                                    </td>
                                    <td>
                                        <span style={{
                                            backgroundColor: getStatusColor(item.activity),
                                            color: 'white',
                                            padding: '6px 8px',
                                            borderRadius: '30px',
                                            fontWeight: 'bold',
                                            textTransform: "uppercase"
                                        }} >
                                            {item.activity}
                                        </span>
                                    </td>
                                    <td>{formatDate(item.createdAt)}</td>
                                    <td>{item.click}</td>
                                    <td>
                                        <a href={item.targetLink} className="text-decoration-none text-dark" target="_blank" rel="noopener noreferrer">
                                            {item.targetLink}
                                        </a>
                                    </td>
                                    <td className="actions d-flex justify-content-around">
                                        <button className="edit-btn" onClick={() => handleEdit(item._id, item)}>
                                            EDIT
                                        </button>
                                        <button className="deletes-btn" onClick={() => handleDelete(item._id)}>
                                            DELETE
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
        </div>
    );
}

export default AllBanners;