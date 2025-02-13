import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash.debounce';
import { FaAngleLeft, FaChevronRight } from "react-icons/fa";
import { FaArrowsAlt } from "react-icons/fa";

function AllBanners() {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;
    const selectRole = (event) => {
        setRole(event.target.value);
    };
    const searchName = (event) => {
        setSearch(event.target.value);
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

    const handleEdit = (id) => {
        navigate(`/EditItem/${id}`);
    };

    return (
        <div className="page-container">
            <div className="header">
                <div className="add-item ">
                    <FaPlus className="plus-icon me-2" />
                    <Link className="text-decoration-none text-white" to="/NewBanner"> Add New Banner</Link>
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

                <select className="form-select  custom-select text-center" onChange={selectRole}>
                    <option value="all">All</option>
                    <option value="business">Business</option>
                    <option value="personal">Personal</option>
                </select>
            </div >
            {
                // loading ? (
                //     <div className="loader-container d-flex justify-content-center">
                //         <div className="loader"></div>
                //     </div>
                // ) :
                error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <>
                        <table className="table mt-3">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Banner</th>
                                    <th>Status</th>
                                    <th>Published </th>
                                    <th>Clicks</th>
                                    <th>Target</th>

                                </tr>
                            </thead>
                            <tbody>

                                {/* {items.map((item, index) => (
                                        <tr key={`${item._id}-${index}`} className="table-row">
                                        <td><FaArrowsAlt/></td>
                                            <td>{item.itemName}</td>
                                            <td>{getCategoryTitle(item.categoryId)}</td>
                                            <td className="rating">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`star ${star <= (item.ratings || 0) ? 'filled' : 'empty'}`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </td>
                                            <td>
                                                <label className={`switch ${item.isActiveForBusiness ? 'disabled' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedItems[item._id]?.business || false}
                                                        onChange={() => handleCheckboxChange(item._id, 'business', item)}
                                                        disabled={item.isActiveForBusiness}
                                                    />
                                                    <span
                                                        className="slider"
                                                        style={{
                                                            backgroundColor: item.isActiveForBusiness ? '#4CAF50' : '#FF3B30',
                                                            cursor: item.isActiveForBusiness ? 'not-allowed' : 'pointer'
                                                        }}
                                                    ></span>
                                                </label>
                                            </td>
                                            <td>
                                                <label className={`switch ${item.isActiveForPersonal ? 'disabled' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedItems[item._id]?.personal || false}
                                                        onChange={() => handleCheckboxChange(item._id, 'personal', item)}
                                                        disabled={item.isActiveForPersonal}
                                                    />
                                                    <span
                                                        className="slider"
                                                        style={{
                                                            backgroundColor: item.isActiveForPersonal ? '#4CAF50' : '#FF3B30',
                                                            cursor: item.isActiveForPersonal ? 'not-allowed' : 'pointer'
                                                        }}
                                                    ></span>
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
                                        </tr>
                                    ))} */}
                            </tbody>
                        </table>
                        <Pagination />
                    </>
                )}
            <ToastContainer />
        </div>
    )
}

export default AllBanners