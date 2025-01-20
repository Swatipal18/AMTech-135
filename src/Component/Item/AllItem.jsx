import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllItem = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const navigate = useNavigate();
  const searchName = (event) => {
    setSearch(event.target.value);
  };

  const selectRole = (event) => {
    setRole(event.target.value);
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${baseUrl}/menu/list`);
      if (response.data?.data?.menuItems) {
        setItems(response.data.data.menuItems || []);
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseUrl}/admin/categories`);
      if (response.data?.data?.categories) {
        setCategories(response.data.data.categories);
      } else {
        setError('Failed to fetch categories.');
      }
    } catch (error) {
      setError('Error fetching categories.');
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (_id) => {
    console.log(_id);
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
        // Deleting the item by _id
        await axios.delete(`${baseUrl}/menu/delete/${_id}`);
        fetchItems();  // Refresh the items list

        // Show success notification with toast after deletion
        toast.success('Item deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } catch (error) {
        setError('Failed to delete item. Please try again.');
        console.error('Error deleting item:', error);

        // Show error notification with toast
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


  const getCategoryTitle = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.title : 'Unknown';
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

        <select className="form-select custom-select text-center " onChange={selectRole}>
          <option value="all">All</option>
          <option value="business">Business</option>
          <option value="personal">Personal</option>
        </select>
      </div >

      {
        loading ? (
          <div className="loading" > Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
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

              {items.map((item, index) => (
                <tr key={`${item._id}-${index}`} className="table-row">
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
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.business}
                        onChange={() => handleEdit(item._id, { ...item, business: !item.business })}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.personal}
                        onChange={() => handleEdit(item._id, { ...item, personal: !item.personal })}
                      />
                      <span className="slider"></span>
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
              ))}
            </tbody>
          </table>
        )}
    </div >
  );
};

export default AllItem;
