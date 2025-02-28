import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaAngleLeft, FaChevronRight } from "react-icons/fa";

const AllItem = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedItems, setCheckedItems] = useState({});
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const selectRole = (event) => {
    setRole(event.target.value);
  };


  useEffect(() => {
    fetchItems(currentPage, searchTerm);
    fetchCategories();
  }, [currentPage, searchTerm, limit]);
  // Fetch items from API
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
        setTotalItems(response.data.data.menuItems.length || 0);
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
      setError('Error fetching Items.');
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
        fetchItems(currentPage, searchTerm);
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

  const handleCheckboxChange = (itemId, type, item) => {
    // Prevent toggling if status is already active (green)
    if ((type === 'business' && item.isActiveForBusiness) ||
      (type === 'personal' && item.isActiveForPersonal)) {
      Swal.fire({
        title: 'Not Allowed',
        text: `Cannot deactivate ${type} status once it is active.`,
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Check if trying to toggle business status
    if (type === 'business' && !item.isActiveForBusiness) {
      if (!item.size || item.size.length === 0) {
        Swal.fire({
          title: 'Action Required',
          text: 'Please edit the item and add size information before activating business status.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      if (!item.businessFields || Object.keys(item.businessFields).length === 0) {
        Swal.fire({
          title: 'Action Required',
          text: 'Business fields are empty. Please edit the item and fill in required business information.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
    }

    // Check if trying to toggle personal status
    if (type === 'personal' && !item.isActiveForPersonal) {
      if (!item.size || item.size.length === 0) {
        Swal.fire({
          title: 'Action Required',
          text: 'Please edit the item and add size information before activating personal status.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      if (!item.personalFields || Object.keys(item.personalFields).length === 0) {
        Swal.fire({
          title: 'Action Required',
          text: 'Personal fields are empty. Please edit the item and fill in required personal information.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
    }

    // Only allow toggling from false to true
    setCheckedItems(prevState => ({
      ...prevState,
      [itemId]: {
        ...prevState[itemId],
        [type]: true, // Only allow setting to true
      }
    }));
  };
  const getCategoryTitle = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.title : 'Not Found';
  };
  const Pagination = () => {
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (currentPage - 1) * limit + 1;
    const endIndex = Math.min(currentPage * limit, totalItems);
    // console.log('endIndex: ', endIndex);
    const isNextButtonDisabled = totalItems < limit;

    return (
      <div className="pagination-container d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">

          <span className="showing-text">
            Showing {startIndex}-{endIndex} Of
            <select
              className="me-1 text-center customselect "
              value={limit}
              style={{ width: '-80px',border: 'none', backgroundColor: '#EEF4ED',color: '#0B2545' }}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>Items
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
        <div className="add-item ">
          <Link className="text-decoration-none text-white" to="/AddNewItem"><FaPlus className="plus-icon me-3" /> Add Item</Link>
        </div>

        <div className="search w-50">
          <FaSearch className="search-icons" />
          <input
            type="search"
            placeholder="Search By Item Name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
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
          <div className="loader-container d-flex justify-content-center">
            <div className="loader"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="no-data mt-4 text-center text-danger fw-bold fs-4 ">No Items Found</div>
        ) :
          error ? (
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
