import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash.debounce';
import { FaAngleLeft, FaChevronRight } from "react-icons/fa";

const AllItem = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedItems, setCheckedItems] = useState({});
  const limit = 10;
  const navigate = useNavigate();
  const searchName = (event) => {
    setSearch(event.target.value);
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const selectRole = (event) => {
    setRole(event.target.value);
  };


  useEffect(() => {
    fetchItems(currentPage, searchTerm);
    fetchCategories();
  }, [currentPage, searchTerm]);

  // Debounced search
  const handleSearch = debounce((search) => {
    fetchItems(currentPage, search);
  }, 500);
  const fetchItems = async (page, search) => {
    try {
      setLoading(true);
      setError(null);
      const pageNumber = Math.max(Number(page), 1);
      const limitNumber = Number(limit);
      const response = await axios.get(`${baseUrl}/menu/list`, {
        params: { page: pageNumber, limit: limitNumber, search: search || '' }
      });
   
      if (response.data?.data?.menuItems) {
        setItems(response.data.data.menuItems || []);
        setTotalItems(response.data.data.total || 0);
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
      const response = await axios.get(`${baseUrl}/admin/categories-list`);
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
  const handleCheckboxChange = (itemId, type) => {
    setCheckedItems(prevState => ({
      ...prevState,
      [itemId]: {
        ...prevState[itemId],
        [type]: !prevState[itemId]?.[type], // Toggle the checked value
      }
    }));
  };

  const getCategoryTitle = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.title : 'Unknown';
  };
  const Pagination = () => {
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (currentPage - 1) * limit + 1;
    const endIndex = Math.min(currentPage * limit, totalItems);

    return (
      <div className="pagination-container">
        <div className="showing-text">
          Showing {startIndex}-{endIndex} Of {totalItems} Categories
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


  return (
    <div className="page-container">
      <div className="header">
        <div className="add-item ">
          <FaPlus className="plus-icon" />
          <Link className="text-decoration-none text-white" to="/AddNewItem"> Add Item</Link>
        </div>

        <div className="search w-50">
          <FaSearch className="search-icons" />
          <input
            type="search"
            placeholder="Search By Item Name"
            value={search}
            onChange={searchName}
          />
        </div>

        <select className="form-select custom-select text-center" onChange={selectRole}>
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
          <>
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
                          checked={checkedItems[item._id]?.business || false}
                          onChange={() => handleCheckboxChange(item._id, 'business')}
                          style={{
                            backgroundColor: item.size.length === 0 ? 'red' : '',
                          }}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={checkedItems[item._id]?.personalSize || false}
                          onChange={() => handleCheckboxChange(item._id, 'personalSize')}
                          style={{
                            backgroundColor: item.personalSize.length === 0 ? 'red' : '',
                          }}
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
            <Pagination />
          </>
        )}
      <ToastContainer />
    </div >
  );
};

export default AllItem;
