import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddOns() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editAddOn, setEditAddOn] = useState(null);
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
    const selectRole = (event) => {
        setRole(event.target.value);
    };
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
            const response = await axios.get(`${baseUrl}/addOn/list`, {
                params: { page: pageNumber, limit: limitNumber, search: search || '' }
            });

            if (response.data.success) {
                setItems(response.data.data.addOns || []);
                setTotalItems(response.data.data.addOns.length || 0);
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

    const handleAddOns = async (data) => {
        try {
            await axios.post(`${baseUrl}/addOn/create`, { name: data.name, price: data.price });
            toast.success('AddOns added successfully!', { autoClose: 1000 });
            reset();
            fetchItems(currentPage, searchTerm);
        } catch (error) {
            setError('Failed to add AddOns. Please try again.');
            toast.error('Failed to add AddOns.');
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
                await axios.delete(`${baseUrl}/addOn/delete/${_id}`);
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
        setEditAddOn(item);
        setValue('name', item.name);
        setValue('price', item.price);
    };

    // Form submission
    const onSubmit = async (data) => {
        if (editAddOn) {
            try {
                const response = await axios.put(`${baseUrl}/addOn/update/${editAddOn._id}`, {
                    name: data.name,
                    price: data.price
                });

                if (response.data.success) {
                    toast.success("Item updated successfully!", { autoClose: 1000 });
                    reset();
                    setEditAddOn(null);
                    fetchItems(currentPage, searchTerm);
                }
            } catch (error) {
                toast.error("Failed to update the item. Please try again.");
            }
        } else {
            handleAddOns(data);
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
                        </select>AddOns
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
                        onClick={() => setCurrentPage(prev => prev + 1)}
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
            <h2 className="ingredients-title">AddOns Management</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="d-flex align-items-center gap-2  mb-4 border-bottom border-secondary pb-3">
                <div className="row g-0 w-100">
                    <div className="col-4 me-5">
                        <label className="form-label fs-5"></label>
                        <input
                            type="text"
                            placeholder="AddOns Name"
                            {...register('name', { required: true })}
                            className="form-control"
                        />
                    </div>
                    <div className=" col-4 me-5">
                        <label className="form-label fs-5"></label>
                        <input
                            type="text"
                            placeholder="Price"
                            {...register('price', { required: true })}
                            className="form-control"
                        />
                    </div>
                    <div className="col-3 d-flex flex-column gap-3">
                        <label className="form-label fs-5"></label>
                        <button
                            type="submit"
                            className="submit-btn w-100 text-uppercase"
                        >
                            {editAddOn ? 'Update' : 'Add'}
                        </button>
                        {editAddOn && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setEditAddOn(null);
                                    reset();
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                </div>
            </form>
            <div className="header">
                <div className="search " >
                    <FaSearch className="search-icons" />
                    <input
                        type="search"
                        placeholder="Search By AddOns Name"
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
            ) : items.length === 0 ? (
                <div className="no-data mt-4 text-center text-danger fw-bold fs-4">No AddOns found</div>
            ) : (
                <>
                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th>AddOns</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item._id}>
                                    <td className='text-capitalize'>{item.name}</td>
                                    <td>{item.price}</td>
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

export default AddOns;