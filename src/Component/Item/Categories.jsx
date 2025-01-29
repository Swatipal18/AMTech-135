import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaChevronRight, FaAngleLeft } from "react-icons/fa6";


function Categories() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    const { register, handleSubmit, setValue, reset } = useForm();

    useEffect(() => {
        fetchItems(currentPage);
    }, [currentPage]);

    const fetchItems = async (page) => {
        try {
            setLoading(true);
            setError(null);
            console.log(`Calling API: ${baseUrl}/admin/categories-list?page=${page}&limit=10`);

            const response = await axios.get(`${baseUrl}/admin/categories-list?page=${page}&limit=10`);
            console.log('API Response:', response.data);

            if (response.data.success) {
                setItems(response.data.data.categories || []);
                setTotalItems(response.data.data.total || 0);
            } else {
                setError('No data received from server');
            }

        } catch (error) {
            console.error('Detailed error:', error.response || error);
            setError('Failed to fetch items. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddcategory = async (data) => {
        if (!data.title.trim()) {
            alert("Please enter a Category name.");
            return;
        }

        try {
            const response = await axios.post(`${baseUrl}/admin/categories`, { title: data.title });
            // console.log('Category added:', response.data);
            setShowModal(false);
            fetchItems();
        } catch (error) {
            console.error('Error adding Category:', error);
            setError('Failed to add Category. Please try again.');
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
                await axios.delete(`${baseUrl}/admin/categories-delete/${_id}`);
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
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        }
    };

    const handleEdit = (item) => {
        setEditCategory(item);
        setShowModal(true);
        setValue('title', item.title);  // Updated field name
    };

    const onSubmit = async (data) => {
        if (editCategory) {
            try {
                const response = await axios.put(`${baseUrl}/admin/categories-update/${editCategory._id}`, { title: data.title });
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
            handleAddcategory(data);
        }
    };

    const Pagination = () => {
        const totalPages = Math.ceil(totalItems / 10);
        const startIndex = (currentPage - 1) * 10 + 1;
        const endIndex = Math.min(currentPage * 10, totalItems);

        return (
            <div className="pagination-container">
                <div className="showing-text" >
                    Showing {startIndex}-{endIndex} Of {totalItems} Staff
                </div>
                <div className="pagination-controls">
                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <FaAngleLeft />

                    </button>
                    <span className="page-number" style={{ fontWeight: 'bold', backgroundColor: '#8DA9C4', color: '#0B2545', borderRadius: '50px' }}>{currentPage}</span>
                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                <div className="add-item" onClick={() => {
                    setShowModal(true);
                    setEditCategory(null);
                    reset();
                }}>
                    <FaPlus className="plus-icon" />
                    <span className="text-white">Add New Category</span>
                </div>

                <div className="search">
                    <FaSearch className="search-icons" />
                    <input
                        type="text"
                        placeholder="Search By Category Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>{editCategory ? 'Edit Category' : 'Add New Category'}</h3>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <input
                                type="text"
                                placeholder="Enter Category name"
                                {...register('title', { required: true })}
                                className="form-control"
                            />
                            <div className="modal-actions mt-3">
                                <button type="submit" className="edit-btn">{editCategory ? 'Update' : 'Submit'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="delete-btn">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : items.length === 0 ? (
                <div className="no-data">No Categories found</div>
            ) : (
                <>
                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items
                                .filter((item) => item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) // Fixed filter condition
                                .map((item) => (
                                    <tr key={item._id}>
                                        <td>{item.title}</td>
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

export default Categories;
