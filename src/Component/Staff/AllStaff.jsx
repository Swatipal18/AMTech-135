import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch, FaAngleLeft, FaChevronRight } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllStaff = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  const roleMapping = {
    1: "Staff Member",
    2: "Kitchen Member",
    3: "Store Manager",
    4: "Delivery Boy",
  };
  useEffect(() => {
    fetchStaff(currentPage, searchTerm);
  }, [currentPage, searchTerm, limit]);

  const fetchStaff = async (page, search) => {
    try {
      setLoading(true);
      setError(null);
      const pageNumber = Math.max(Number(page), 1);
      const limitNumber = Number(limit);
      const response = await axios.get(`${baseUrl}/store/list`, {
        params: { page: pageNumber, limit: limitNumber, search: search || '' }
      });
      if (response.data?.data?.users) {
        setStaff(response.data.data.users || []);
        setTotalItems(response.data.data.users.length || 0);
      } else {
        setError('No staff found.');
      }
    } catch (error) {
      setError('Failed to fetch staff details. Please try again.');
      console.error('Error fetching staff details:', error);
      toast.error('Failed to fetch staff details. Please try again.', {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
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
        await axios.delete(`${baseUrl}/store/delete/${_id}`);
        fetchStaff();
        toast.success('Staff deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } catch (error) {
        setError('Failed to delete staff. Please try again.');
        console.error('Error deleting staff:', error);
        toast.error('Failed to delete staff. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/editstaff/${id}`);
  };
  const Pagination = () => {
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (currentPage - 1) * limit + 1;
    const endIndex = Math.min(currentPage * limit, totalItems);
    const isNextButtonDisabled = totalItems < limit;


    return (
      <div className="pagination-container d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">

          <span className="showing-text">
            Showing {startIndex}-{endIndex} Of
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
            </select>Staff
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
        <div className="add-item">
          <FaPlus className="plus-icon" />
          <Link className="add-item text-decoration-none text-white" to="/AddStaff">
            Add New Staff
          </Link>
        </div>

        <div className="search w-50">
          <FaSearch className="search-icons" />
          <input
            type="search"
            placeholder="Search By Staff Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="form-select custom-select text-center">
          <option value="all">Role</option>
          <option value="">Staff Member</option>
          <option value="">Kitchen Member</option>
          <option value="">Store Manager</option>
          <option value=""> Delivery Boy</option>

        </select>
      </div>

      {loading ? (
        <div className="loader-container d-flex justify-content-center">
          <div className="loader"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : staff.length === 0 ? (
        <div className="no-data no-data mt-4 text-center text-danger fw-bold fs-4">No Staff Found</div>
      ) : (
        <>

          <table className="table mt-3">
            <thead>
              <tr >
                <th className='text-center'>Staff Name</th>
                <th className='text-center'>Mobile Number</th>
                <th className='text-center'>Role</th>

              </tr>
            </thead>
            <tbody>
              {staff.map((staffMember, index) => (
                <tr key={`${staffMember.id}-${index}`} className="table-row">
                  <td className='text-center'>{staffMember.username}</td>
                  <td className='text-center'>{staffMember.contact}</td>
                  <td className='text-center'>{roleMapping[staffMember.role] || 'Unknown Role'}</td>
                  <td className="actions d-flex justify-content-end gap-5">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(staffMember._id)}
                    >
                      EDIT
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(staffMember._id)}
                    >
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
    </div>
  );
};

export default AllStaff;
