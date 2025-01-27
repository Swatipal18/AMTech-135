import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const AllStaff = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
  }, [currentPage, searchTerm]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${baseUrl}/store/list`);
      const staffData = response.data.data.users;
      setStaff(staffData || []);
    } catch (error) {
      setError('Failed to fetch staff details. Please try again.');
      console.error('Error fetching staff details:', error);

      // Display error notification with toast
      toast.error('Failed to fetch staff details. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Confirmation dialog using SweetAlert2
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
        await axios.delete(`${baseUrl}/store/delete/${id}`);
        fetchStaff();

        // Show success notification with toast after deletion
        toast.success('Staff deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } catch (error) {
        setError('Failed to delete staff. Please try again.');
        console.error('Error deleting staff:', error);

        // Show error notification with toast
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

  return (
    <div className="page-container">
      <div className="header">
        <div className="add-item">
          <FaPlus className="plus-icon" />
          <Link className="add-item text-decoration-none text-white" to="/AddStaff">
            Add New Staff
          </Link>
        </div>

        <div className="search">
          <FaSearch className="search-icons" />
          <input
            type="text"
            placeholder="Search By Staff Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="form-select custom-select text-center">
          <option value="all">All</option>
          <option value="business">Business</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : staff.length === 0 ? (
        <div className="no-data">No items found</div>
      ) : (
        <table className="table mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile Number</th>
              <th>Role</th>

            </tr>
          </thead>
          <tbody>
            {staff.map((staffMember, index) => (
              <tr key={`${staffMember.id}-${index}`} className="table-row">
                <td>{staffMember.username}</td>
                <td>{staffMember.contact}</td>
                <td>{staffMember.role}</td>
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
      )}

      <ToastContainer /> {/* ToastContainer for notifications */}
    </div>
  );
};

export default AllStaff;
