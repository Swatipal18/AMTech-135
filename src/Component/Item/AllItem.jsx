import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiOutlineInformationCircle } from "react-icons/hi2";

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
  const [totalRecord, setTotalRecord] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const selectRole = (event) => {
    setRole(event.target.value);
  };


  useEffect(() => {
    fetchItems(currentPage);
    fetchCategories();
  }, [currentPage, limit]);
  // Fetch items from API

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

  const fetchItems = async (page, search) => {
    setLoading(true);
    try {
      setError(null);
      const pageNumber = Math.max(Number(page), 1);
      const limitNumber = Number(limit);
      const response = await axios.get(`${baseUrl}/menu/list`, {
        params: { page: pageNumber, limit: limitNumber, search: search || '' }
      });
      // console.log('response: ', response.data.data.menuItems);

      if (response.data?.data?.menuItems) {
        setItems(response.data.data.menuItems || []);
        setTotalItems(response.data.data.menuItems.length || 0);
        setTotalRecord(response.data.data.totalRecords || 0);
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

  const handleCheckboxChange = async (itemId, type, item) => {
    // Get current active state from the item directly
    const isCurrentlyActive = type === 'business' ? item.isActiveForBusiness : item.isActiveForPersonal;

    // If we're trying to activate (red to green) and the item lacks required fields, show error
    if (!isCurrentlyActive) {
      // Check if trying to activate business status
      if (type === 'business') {
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

      // Check if trying to activate personal status
      if (type === 'personal') {
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
    }

    try {
      // Prepare the payload based on Postman screenshot
      const payload = {
        menuId: itemId
      };

      // Add the appropriate field based on type (business or personal)
      if (type === 'business') {
        payload.isActiveForBusiness = !isCurrentlyActive;
      } else {
        payload.isActiveForPersonal = !isCurrentlyActive;
      }

      // Make the API call - using PUT instead of POST based on Postman
      const responsedata = await axios.put(`${baseUrl}/menu/stock`, payload);
      console.log('payload: ', responsedata);

      // Show success message
      toast.success(`Item ${type} status ${!isCurrentlyActive ? 'activated' : 'deactivated'} successfully!`, {
        position: "top-right",
        autoClose: 1000,
        theme: "colored",
      });

      // Refresh the items list to get updated data
      fetchItems(currentPage, searchTerm);

    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
      toast.error(`Failed to update ${type} status. Please try again.`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };
  const getCategoryTitle = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.title : 'Not Found';
  };
  const Pagination = () => {
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (currentPage - 1) * limit + 1;
    const endIndex = Math.min(currentPage * limit, totalItems);
    const isNextButtonDisabled = totalItems < limit;

    return (
      <div className="pagination-container" >
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
            </select>Items
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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  const handleInfoClick = async (itemId) => {
    try {
      setLoadingDetails(true);
      setShowModal(true);
      const response = await axios.get(`${baseUrl}/menu/details/${itemId}`);
      console.log(' details response: ', response.data.data);
      setSelectedItemData(response.data.data);
    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error('Failed to fetch item details');
    } finally {
      setLoadingDetails(false);
    }
  }
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
              Allitemsearch(e)

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
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>

                  {items.map((item, index) => (
                    <tr key={`${item._id}-${index}`} className="table-row">
                      <td className='text-capitalize'>{item.itemName}</td>
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
                            checked={item.isActiveForBusiness}
                            onChange={() => handleCheckboxChange(item._id, 'business', item)}
                          />
                          <div
                            className="slider"
                            style={{
                              backgroundColor: item.isActiveForBusiness ? '#4CAF50' : '#FF3B30'
                            }}
                          ></div>
                          <div className="slider-card">
                            <div className="slider-card-face slider-card-front"></div>
                            <div className="slider-card-face slider-card-back"></div>
                          </div>
                        </label>
                      </td>

                      {/* <td>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={item.isActiveForPersonal}
                            onChange={() => handleCheckboxChange(item._id, 'personal', item)}
                          />
                          <div
                            className="slider"
                            style={{
                              backgroundColor: item.isActiveForPersonal ? '#4CAF50' : '#FF3B30'
                            }}
                          ></div>
                          <div className="slider-card">
                            <div className="slider-card-face slider-card-front"></div>
                            <div className="slider-card-face slider-card-back"></div>
                          </div>
                        </label>
                      </td> */}


                      <td className="actions d-flex justify-content-around">
                        <button className="edit-btn" onClick={() => handleEdit(item._id, item)}>
                          EDIT
                        </button>
                        <button className="deletes-btn" onClick={() => handleDelete(item._id)}>
                          DELETE
                        </button>
                      </td>
                      <td>
                        <button className='btn' onClick={() => handleInfoClick(item._id)}>
                          <HiOutlineInformationCircle className='fs-3' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {showModal && (
                  <>
                    <div
                      className={`modal-slide-backdrop ${showModal ? 'show' : ''}`}
                      onClick={() => setShowModal(false)}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                        opacity: showModal ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out'
                      }}
                    />
                    <div
                      className={`modal-slide ${showModal ? 'show' : ''}`}
                      style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: '600px',
                        maxWidth: '90%',
                        backgroundColor: '#fff',
                        boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.2)',
                        zIndex: 1001,
                        transform: showModal ? 'translateX(0)' : 'translateX(100%)',
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '12px 0 0 12px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        className="modal-slide-header"
                        style={{
                          padding: '16px 20px',
                          borderBottom: '1px solid #e0e0e0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#f8f9fa'
                        }}
                      >
                        <h5
                          className="m-0 bg-transparent"
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: '#11325a'
                          }}
                        >
                          Item Information
                        </h5>
                        <button
                          className="modal-slide-close"
                          onClick={() => setShowModal(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.75rem',
                            color: '#dc3545',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            padding: '0 8px',
                            outline: 'none'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'rotate(90deg)'}
                          onMouseOut={(e) => e.target.style.transform = 'rotate(0deg)'}
                        >
                          ×
                        </button>
                      </div>
                      <div
                        className="modal-slide-body"
                        style={{
                          padding: '20px',
                          overflowY: 'auto',
                          flex: 1
                        }}
                      >
                        {loadingDetails ? (
                          <div
                            className="text-center p-4"
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%'
                            }}
                          >
                            <div
                              className="spinner"
                              style={{
                                width: '50px',
                                height: '50px',
                                border: '5px solid rgba(0, 123, 255, 0.1)',
                                borderRadius: '50%',
                                borderTop: '5px solid #007bff',
                                animation: 'spin 1s linear infinite'
                              }}
                            />
                            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
                          </div>
                        ) : selectedItemData ? (
                          <div
                            className="row g-4"
                            style={{
                              opacity: 0,
                              animation: 'fadeIn 0.5s forwards',
                              animationDelay: '0.2s'
                            }}
                          >
                            {/* Images Section */}
                            <div className="col-12">
                              <div
                                className="info-card"
                                style={{
                                  backgroundColor: '#fff',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                  transition: 'transform 0.3s, box-shadow 0.3s',
                                  overflow: 'hidden'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-5px)';
                                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                }}
                              >
                                <div className="card-body" style={{ padding: '20px' }}>
                                  <h3
                                    className="card-title text-center"
                                    style={{
                                      fontSize: '1.5rem',
                                      fontWeight: '600',
                                      marginBottom: '15px',
                                      color: '#333',
                                      borderBottom: '2px solid #f0f0f0',
                                      paddingBottom: '10px'
                                    }}
                                  >
                                    Item Images
                                  </h3>
                                  <div
                                    className="d-flex flex-wrap gap-3 mt-3 justify-content-center"
                                    style={{
                                      maxHeight: '300px',
                                      overflowY: 'auto',
                                      padding: '5px',
                                      scrollbarWidth: 'thin',
                                      scrollbarColor: '#888 #f1f1f1'
                                    }}
                                  >
                                    {selectedItemData.images?.map((image, index) => (
                                      <div
                                        key={index}
                                        style={{
                                          width: '200px',
                                          height: '150px',
                                          opacity: 0,
                                          animation: 'fadeInUp 0.5s forwards',
                                          animationDelay: `${0.1 * index}s`
                                        }}
                                      >
                                        <img
                                          src={image}
                                          alt={`Item ${index + 1}`}
                                          className="rounded"
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                          }}
                                          onMouseOver={(e) => {
                                            e.target.style.transform = 'scale(1.05)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                          }}
                                          onMouseOut={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Recipe */}
                            <div className="col-12">
                              <div
                                className="info-card"
                                style={{
                                  backgroundColor: '#fff',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                  transition: 'transform 0.3s, box-shadow 0.3s'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-5px)';
                                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                }}
                              >
                                <div className="card-body" style={{ padding: '20px' }}>
                                  <h6
                                    className="card-title text-center"
                                    style={{
                                      fontSize: '1.1rem',
                                      fontWeight: '600',
                                      marginBottom: '15px',
                                      color: '#333',
                                      borderBottom: '2px solid #f0f0f0',
                                      paddingBottom: '10px'
                                    }}
                                  >
                                    Recipe
                                  </h6>
                                  <p
                                    className="card-text"
                                    style={{
                                      color: '#444',
                                      lineHeight: '1.6',
                                      backgroundColor: '#f9f9f9',
                                      padding: '15px',
                                      borderRadius: '8px',
                                      borderLeft: '4px solid #11325a'
                                    }}
                                  >
                                    {selectedItemData.recipe}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {/* Description */}
                            <div className="col-12">
                              <div
                                className="info-card"
                                style={{
                                  backgroundColor: '#fff',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                  transition: 'transform 0.3s, box-shadow 0.3s'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-5px)';
                                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                }}
                              >
                                <div className="card-body" style={{ padding: '20px' }}>
                                  <h6
                                    className="card-title text-center"
                                    style={{
                                      fontSize: '1.1rem',
                                      fontWeight: '600',
                                      marginBottom: '15px',
                                      color: '#333',
                                      borderBottom: '2px solid #f0f0f0',
                                      paddingBottom: '10px'
                                    }}
                                  >
                                    Description
                                  </h6>
                                  <p
                                    className="card-text"
                                    style={{
                                      color: '#444',
                                      lineHeight: '1.6',
                                      backgroundColor: '#f9f9f9',
                                      padding: '15px',
                                      borderRadius: '8px',
                                      borderLeft: '4px solid #11325a'
                                    }}
                                  >
                                    {selectedItemData.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {/* Item Information */}
                            <div className="col-md-6">
                              <div
                                className="info-card"
                                style={{
                                  backgroundColor: '#fff',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                  height: '100%',
                                  transition: 'transform 0.3s, box-shadow 0.3s'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-5px)';
                                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                }}
                              >
                                <div className="card-body fs-6" style={{ padding: '20px' }}>
                                  <h6
                                    className="card-title text-center"
                                    style={{
                                      fontSize: '1.1rem',
                                      fontWeight: '600',
                                      marginBottom: '15px',
                                      color: '#333',
                                      borderBottom: '2px solid #f0f0f0',
                                      paddingBottom: '10px'
                                    }}
                                  >
                                    Basic Information
                                  </h6>
                                  <div
                                    className="info-field mb-3"
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 0',
                                      borderBottom: '1px dashed #eee'
                                    }}
                                  >
                                    <strong style={{ color: '#555' }}>Name:</strong>
                                    <span style={{ color: '#333', fontWeight: '500' }}>{selectedItemData.itemName}</span>
                                  </div>
                                  <div
                                    className="info-field mb-3"
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 0',
                                      borderBottom: '1px dashed #eee'
                                    }}
                                  >
                                    <strong style={{ color: '#555' }}>Category:</strong>
                                    <span style={{ color: '#333', fontWeight: '500' }}>{getCategoryTitle(selectedItemData.categoryId)}</span>
                                  </div>
                                  <div
                                    className="info-field mb-3"
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 0',
                                      borderBottom: '1px dashed #eee'
                                    }}
                                  >
                                    <strong style={{ color: '#555' }}>Created At:</strong>
                                    <span style={{ color: '#333', fontWeight: '500' }}> {formatDate(selectedItemData.createdAt)}</span>
                                  </div>
                                  <div
                                    className="info-field mb-3"
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 0',
                                      borderBottom: '1px dashed #eee'
                                    }}
                                  >
                                    <strong style={{ color: '#555' }}>Rating:</strong>
                                    <span style={{ color: '#333', fontWeight: '500' }}>
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          style={{
                                            color: star <= (selectedItemData.ratings || 0) ? '#FFD700' : '#e0e0e0',
                                            fontSize: '1.1rem',
                                            marginLeft: '2px'
                                          }}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </span>

                                  </div>
                                  <div
                                    className="info-field mb-2"
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 0'
                                    }}
                                  >
                                    <strong style={{ color: '#555' }}>Status:</strong>
                                    <span
                                      style={{
                                        padding: '4px 10px',
                                        borderRadius: '50px',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        color: '#fff',
                                        backgroundColor: selectedItemData.
                                          isActiveForBusiness
                                          ? '#34C759' : '#FF3B30',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                      }}
                                    >
                                      {selectedItemData.isActiveForBusiness ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>

                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              {/* Ingredients */}
                              <div className="col-md-12">
                                <div
                                  className="info-card"
                                  style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.3s, box-shadow 0.3s'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                  }}
                                >
                                  <div className="card-body" style={{ padding: '20px' }}>
                                    <h6
                                      className="card-title text-center"
                                      style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        marginBottom: '15px',
                                        color: '#333',
                                        borderBottom: '2px solid #f0f0f0',
                                        paddingBottom: '10px'
                                      }}
                                    >
                                      Ingredients
                                    </h6>
                                    <div
                                      style={{
                                        padding: '15px',
                                        backgroundColor: 'transparent',
                                        borderRadius: '8px',
                                        lineHeight: '1.8',
                                        opacity: 0,
                                        animation: 'fadeIn 0.5s forwards',
                                        animationDelay: '0.2s',
                                        whiteSpace: 'pre-line' // Ensures the ingredients appear on separate lines.
                                      }}
                                    >
                                      {selectedItemData.ingredients?.map((ingredient, index) => (
                                        <div key={index} style={{ marginBottom: '8px' }}>
                                          <span
                                            style={{
                                              display: 'inline-block',
                                              width: '8px',
                                              height: '8px',
                                              backgroundColor: '#28a745',
                                              borderRadius: '50%',
                                              marginRight: '8px'
                                            }}
                                          />
                                          {/* Access the name property of the ingredient object */}
                                          {ingredient.name}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* Addons - New section */}
                              <div className="col-md-12">
                                <div
                                  className="info-card"
                                  style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.3s, box-shadow 0.3s'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                  }}
                                >
                                  <div className="card-body" style={{ padding: '20px' }}>
                                    <h6
                                      className="card-title text-center"
                                      style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        marginBottom: '15px',
                                        color: '#333',
                                        borderBottom: '2px solid #f0f0f0',
                                        paddingBottom: '10px'
                                      }}
                                    >
                                      Addons
                                    </h6>
                                    <div
                                      style={{
                                        padding: '10px',
                                        backgroundColor: 'transparent',
                                        borderRadius: '8px',
                                        lineHeight: '1.8',
                                        opacity: 0,
                                        animation: 'fadeIn 0.5s forwards',
                                        animationDelay: '0.2s',
                                        whiteSpace: 'pre-line'
                                      }}
                                    >
                                      {/* {console.log(selectedItemData.addOn, "============================================================================")} */}
                                      {/* // Check the addon rendering section */}
                                      {selectedItemData.addOn?.map((addon, index) => (
                                        <div key={index} style={{
                                          marginBottom: '12px',
                                          padding: '12px',
                                          backgroundColor: '#f8f9fa',
                                          borderRadius: '6px'
                                        }}>
                                          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                                            <span
                                              style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                backgroundColor: '#007bff',
                                                borderRadius: '50%',
                                                marginRight: '8px',
                                                marginTop: '6px'
                                              }}
                                            />
                                            <div>
                                              <strong style={{ color: '#555' }}>Name:</strong>
                                              <span style={{
                                                color: '#333',
                                                fontWeight: '500',
                                                marginLeft: '5px',
                                                wordBreak: 'break-word'
                                              }}>
                                                {addon.name}
                                              </span>
                                            </div>
                                          </div>

                                          <div style={{ marginLeft: '0px', display: 'flex', alignItems: 'center' }}>
                                            <span
                                              style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                backgroundColor: '#007bff',
                                                borderRadius: '50%',
                                                marginRight: '8px'
                                              }}
                                            />
                                            <strong style={{ color: '#555' }}>Price:</strong>
                                            <span style={{ color: '#333', fontWeight: '500', marginLeft: '5px' }}>
                                              {addon.price}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="text-center p-4"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%',
                              color: '#6c757d'
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="64"
                              height="64"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                              style={{ marginBottom: '15px', opacity: 0.5 }}
                            >
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                            </svg>
                            <p style={{ fontSize: '1.1rem' }}>No data available</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <style jsx>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeInUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideIn {
        from { 
          opacity: 0;
          transform: translateX(-20px);
        }
        to { 
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      /* Custom scrollbar styles */
      .modal-slide-body::-webkit-scrollbar {
        width: 8px;
      }
      
      .modal-slide-body::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      
      .modal-slide-body::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
      }
      
      .modal-slide-body::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `}</style>
                  </>
                )}
              </table>

              <Pagination />
            </>
          )}
      <ToastContainer />
    </div >
  );
};

export default AllItem;
