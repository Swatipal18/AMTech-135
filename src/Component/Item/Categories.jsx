import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash.debounce';

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
    const [limit, setLimit] = useState(10);
    const [totalRecord, setTotalRecord] = useState(0);
    const { register, handleSubmit, setValue, reset } = useForm();
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        fetchItems(currentPage);
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
            // console.log(pageNumber, "page");
            const limitNumber = Number(limit);
            // console.log(limitNumber, "limit");

            const response = await axios.get(`${baseUrl}/admin/categories-list`, {
                params: { page: pageNumber, limit: limitNumber, search: search || '' }
            });

            if (response.data.success) {
                setItems(response.data.data.categories || []);
                setTotalItems(response.data.data.categories.length || 0);
                setTotalRecord(response.data.data.totalRecords || 0);
            } else {
                setError('No data received from server');
                toast.error('No data received from server');
            }
        } catch (error) {
            console.error('Error:', error.response || error);
            setError('Failed to fetch items. Please try again later.');
            toast.error('Failed to fetch items. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Handle adding category
    const handleAddcategory = async (data) => {
        if (!data.title.trim()) {
            alert("Please enter a Category name.");
            return;
        }
        try {
            await axios.post(`${baseUrl}/admin/categories`, { title: data.title });
            setShowModal(false);
            fetchItems(currentPage, searchTerm);
        } catch (error) {
            setError('Failed to add Category. Please try again.');
            toast.error('Failed to add Category.');
        }
    };

    // Handle deleting category
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
                fetchItems(currentPage, searchTerm);
                toast.success('Item deleted successfully!', { autoClose: 1000 });
            } catch (error) {
                setError('Failed to delete item. Please try again.');
                toast.error('Failed to delete item.', { autoClose: 3000 });
            }
        }
    };

    // Handle editing category
    const handleEdit = (item) => {
        setEditCategory(item);
        setShowModal(true);
        setValue('title', item.title);
    };

    // Form submission
    const onSubmit = async (data) => {
        if (editCategory) {
            try {
                const response = await axios.put(`${baseUrl}/admin/categories-update/${editCategory._id}`, { title: data.title });
                if (response.data.success) {
                    toast.success("Item updated successfully!", { autoClose: 1000 });
                    reset();
                    setEditCategory(null);
                    fetchItems(currentPage, searchTerm);
                    setShowModal(false);
                }
            } catch (error) {
                toast.error("Failed to submit the form. Please try again.");
            }
        } else {
            handleAddcategory(data);
        }
    };

    // Pagination component
    const Pagination = () => {
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (currentPage - 1) * limit + 1;
        const endIndex = Math.min(currentPage * limit, totalItems);
        const isNextButtonDisabled = totalItems < limit;

        return (
            <div className="pagination-container ">
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
                        </select>Category
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

    return (
        <div className="page-container">
            <div className="header">
                <div className="add-item" onClick={() => { setShowModal(true); setEditCategory(null); reset(); }}>
                    <FaPlus className="plus-icon" />
                    <span className="text-white">Add New Category</span>
                </div>

                <div className="search">
                    <FaSearch className="search-icons" />
                    <input
                        type="search"
                        placeholder="Search By Category Name"
                        value={searchTerm}
                        onChange={(e) => {
                            Allitemsearch(e)
                        }}
                    />
                </div>
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>{editCategory ? 'Edit Category' : 'Add New Category'}</h3>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <input type="text" placeholder="Enter Category name" {...register('title', { required: true })} className="form-control text-capitalize" />
                            <div className="modal-actions mt-3">
                                <button type="submit" className="edit-btn">{editCategory ? 'Update' : 'Submit'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="deletes-btn">Close</button>
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
                <div className="no-data mt-4 text-center text-danger fw-bold fs-4 ">No Categories found</div>
            ) : (
                <>
                    <table className="table mt-3">
                        <thead>
                            <tr><th>Category</th></tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item._id}>
                                    <td className='text-capitalize'>{item.title}</td>
                                    <td className="actions d-flex justify-content-end align-items-center">
                                        <button className="edit-btn" onClick={() => handleEdit(item)}>EDIT</button>
                                        <button className="deletes-btn ms-5" onClick={() => handleDelete(item._id)}>DELETE</button>
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
