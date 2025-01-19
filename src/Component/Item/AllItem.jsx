import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link } from 'react-router-dom';

const AllItem = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const searchName = (event) => {
    setSearch(event.target.value);
  };
  const filterdata = items.filter((item) => {
    return item?.name?.toLowerCase().includes(search.toLowerCase());
  });
  const selectRole = (event) => {
    console.log(event.target.value)
    setRole(event.target.value)
  }
  const cities = items.map((item) => {
    return item.address.city
  })
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('https://jsonplaceholder.typicode.com/users');
      setItems(response.data || []);
    } catch (error) {
      setError('Failed to fetch items. Please try again later.');
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`);
      fetchItems();
    } catch (error) {
      setError('Failed to delete item. Please try again.');
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await axios.put(`/api/items/${id}`, data);
      fetchItems();
    } catch (error) {
      setError('Failed to update item. Please try again.');
      console.error('Error updating item:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="header">
        <div className="add-item">
          <FaPlus className="plus-icon" />
          <Link className="add-item text-decoration-none text-white" to="/AddNewItem"> Add Item</Link>
        </div>

        <div className="search">
          <FaSearch className="search-icons" />
          <input
            type="search"
            placeholder="Search By Item Name"
            value={search}
            onChange={searchName}
          />
        </div>
        <select class="form-select custom-select text-center " onChange={selectRole}>
          <option value="all">All</option>
          <option value="business">Business</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filterdata.length === 0 ? (
        <div className="no-data">No items found</div>
      ) : (
        <table className="table mt-3">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Business</th>
              <th>Personal</th>
            </tr>
          </thead>
          <tbody>
            {filterdata.map(item => (
              <tr key={item.id} className="table-row">
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td className="rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`star ${star <= item.rating ? 'filled' : 'empty'}`}>★</span>
                  ))}
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.business}
                      onChange={() => handleEdit(item.id, { ...item, business: !item.business })}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.personal}
                      onChange={() => handleEdit(item.id, { ...item, personal: !item.personal })}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td className="actions d-flex justify-content-between">
                  <button className="edit-btn" onClick={() => handleEdit(item.id, item)}>
                    EDIT
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(item.id)}>
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
};

export default AllItem;
