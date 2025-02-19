import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch, FaChevronRight, FaAngleLeft } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Sizes() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editSize, setEditSize] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const { register, handleSubmit, setValue, reset } = useForm();

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        fetchItems(currentPage, searchTerm);
    }, [currentPage, searchTerm, limit]);
    const fetchItems = async (page, search) => {
        try {
            setLoading(true);
            setError(null);
            const pageNumber = Math.max(Number(page), 1);
            const limitNumber = Number(limit);
            const response = await axios.get(`${baseUrl}/size/list`, {
                params: { page: pageNumber, limit: limitNumber, search: search || '' }
            });
            if (response.data?.data?.sizes) {
                setItems(response.data.data.sizes || []);
                setTotalItems(response.data.data.sizes.length || 0);
            } else {
                setError('No data received from server');
                toast.error('No data received from server');
            }
        } catch (error) {
            console.error('Error fetching sizes:', error);
            setError('Failed to fetch items. Please try again later.');
            toast.error('Failed to fetch items. Please try again later.');

        } finally {
            setLoading(false);
        }
    };
    // Handle adding Size
    const handleAddSize = async (data) => {
        if (!data.size.trim()) {
            alert("Please enter a size name.");
            return;
        }

        try {
            await axios.post(`${baseUrl}/size/create`, { size: data.size });
            setShowModal(false);
            fetchItems(currentPage, searchTerm);
        } catch (error) {
            setError('Failed to add Category. Please try again.');
            toast.error('Failed to add Category.');
        }
    };
    // Handle deleting Size
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
                await axios.delete(`${baseUrl}/size/delete/${_id}`);
                fetchItems(currentPage, searchTerm);
                toast.success('Item deleted successfully!', {
                    position: "top-right",
                    autoClose: 1000,
                    theme: "colored",
                });
            } catch (error) {
                setError('Failed to delete item. Please try again.');
                toast.error('Failed to delete item. Please try again.', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        }
    };

    // Handle editing category
    const handleEdit = (item) => {
        setEditSize(item);
        setShowModal(true);
        setValue('size', item.size);
    };

    const onSubmit = (data) => {
        if (editSize) {
            try {
                const response = axios.put(`${baseUrl}/size/update/${editSize._id}`, { size: data.size })
                if (response.data.success) {
                    toast.success(response.data.message || "Item updated successfully!", {
                        position: "top-right",
                        autoClose: 1000,
                        theme: "colored",
                        style: {
                            backgroundColor: '#FFEB3B',
                            color: '#000',
                        },
                    });
                    reset();
                    setEditCategory(null);
                    fetchItems();
                    setShowModal(false);
                }
            } catch (error) {
                console.error("Error details:", error.response ? error.response.data : error);
                toast.error(error.response?.data?.message || "Failed to submit the form. Please try again.");
            }
        } else {
            handleAddSize(data);
        }
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
                        Showing {startIndex}-{endIndex} Of
                        <select
                            className="me-1 text-center customselect "
                            value={limit}
                            style={{ width: '-80px' }}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setCurrentPage(1);
                            }}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>Size
                    </span>
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
                        disabled={isNextButtonDisabled}
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
                <div className="add-item" onClick={() => {
                    setShowModal(true);
                    setEditSize(null);
                    reset();
                }}>
                    <FaPlus className="plus-icon" />
                    <span className="text-white">Add New Size</span>
                </div>

                <div className="search">
                    <FaSearch className="search-icons" />
                    <input
                        type="search"
                        placeholder="Search By Size Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>{editSize ? 'Edit Size' : 'Add New Size'}</h3>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <input
                                type="text"
                                placeholder="Enter Size name"
                                {...register('size', { required: true })}
                                className="form-control"
                            />
                            <div className="modal-actions mt-3">
                                <button type="submit" className="edit-btn">{editSize ? 'Update' : 'Submit'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="delete-btn">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loader-container d-flex justify-content-center">
                    <div className="loader"></div>
                </div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : items.length === 0 ? (
                <div className="no-data mt-4 text-center text-danger fw-bold fs-4 ">No Size found</div>
            ) : (
                <>
                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items
                                .filter((item) => item.size && item.size.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((item) => (
                                    <tr key={item._id} >
                                        <td>{item.size}</td>
                                        <td className="actions d-flex justify-content-end">
                                            <button className="edit-btn" onClick={() => handleEdit(item)}>EDIT</button>
                                            <button className="delete-btn ms-5" onClick={() => handleDelete(item._id)}>DELETE</button>
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

export default Sizes;
