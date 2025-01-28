import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
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

    const { register, handleSubmit, setValue, reset } = useForm();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${baseUrl}/size/list`);
            setItems(response.data.data.sizes || []);
        } catch (error) {
            console.error('Error fetching sizes:', error);
            setError('Failed to fetch items. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSize = async (data) => {
        if (!data.size.trim()) {
            alert("Please enter a size name.");
            return;
        }

        try {
            const response = await axios.post(`${baseUrl}/size/create`, { size: data.size });
            setShowModal(false);
            fetchItems();
        } catch (error) {
            console.error('Error adding size:', error);
            setError('Failed to add size. Please try again.');
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
                await axios.delete(`${baseUrl}/size/delete/${_id}`);
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
                        type="text"
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
                <div className="loading">Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : items.length === 0 ? (
                <div className="no-data">No Size found</div>
            ) : (
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
            )}
            <ToastContainer />
        </div>
    );
}

export default Sizes;
