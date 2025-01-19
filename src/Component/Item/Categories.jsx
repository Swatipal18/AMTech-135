import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";

function Categories() {

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${baseUrl}/admin/categories`);
            setItems(response.data || []);
        } catch (error) {
            setError('Failed to fetch items. Please try again later.');
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        try {
            await axios.post('https://jsonplaceholder.typicode.com/users', { name: newCategory });
            setShowModal(false);
            fetchItems();
            setNewCategory('');
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    return (
        <div className="page-container">
            <div className="header ">
                <div className='add-item' onClick={() => setShowModal(true)}>
                    <FaPlus className="plus-icon" />
                    <span className="text-white">Add New Category</span>
                </div>

                <div className="search">
                    <FaSearch className="search-icons" />
                    <input
                        type="text"
                        placeholder="Search By Item Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Modal for adding new category */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Add New Category</h3>
                        <input
                            type="text"
                            placeholder="Enter category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className=''
                        />
                        <span>
                            <button onClick={handleAddCategory} className='edit-btn'>Submit</button>
                            <button onClick={() => setShowModal(false)} className='delete-btn '>Close</button>
                        </span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : items.length === 0 ? (
                <div className="no-data">No items found</div>
            ) : (
                <table className='table mt-3'>
                    <thead className=" ">
                        <tr>
                            <th>Name</th>
                            <th>Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="table-row">
                                <td>{item.name}</td>
                                <td>{item.category}</td>
                                <td className="actions d-flex justify-content-end">
                                    <button className="edit-btn">
                                        EDIT
                                    </button>
                                    <button className="delete-btn ms-5">
                                        DELETE
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Categories;
