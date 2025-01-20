import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { GrUploadOption } from "react-icons/gr";
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

function EditStaff() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const roles = ['Delivery Boy', 'Staff Member', 'Store Manager', 'Kitchen Member'];

    const fetchStaffDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/store/details/${id}`);
            const staffData = response.data.data;
            reset(staffData);
        } catch (err) {
            console.error("Error fetching staff details:", err);
            setError("Failed to load staff details. Please try again.");
            toast.error("Failed to load staff details. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffDetails();
    }, [id]);

    const submitData = async (data) => {
        try {
            setLoading(true);
            await axios.put(`${baseUrl}/store/update/${id}`, data);
            toast.success("Staff updated successfully!", {
                position: "top-right",
                autoClose: 1000,
                theme: "colored",
                style: {
                    backgroundColor: '#FFEB3B',
                    color: '#000',
                },
            });
            setTimeout(() => {
                navigate('/AllStaff');
            }, 1000);
        } catch (err) {
            console.error("Error updating staff:", err);
            setError("Failed to update staff details. Please try again.");
            toast.error("Failed to update staff details. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12 main-content">
                    <div className="form-container">
                        <h1 className="form-title">Edit Staff</h1>
                        <form onSubmit={handleSubmit(submitData)}>
                            <div className="row">
                                <div className="col-md-8">
                                    {/* Name Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Name:</label>
                                        <input
                                            type="text"
                                            {...register("username")}
                                            className="form-control shadow"
                                            placeholder="e.g. Full Name"
                                        />
                                    </div>

                                    {/* Mobile Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Mobile Number:</label>
                                        <input
                                            type="number"
                                            {...register("contact")}
                                            className="form-control shadow no-spinner"
                                            placeholder="e.g. +91 1234567890"
                                        />
                                    </div>

                                    {/* Email Field */}
                                    <div className="mb-4">
                                        <label className="form-label">E-Mail Address:</label>
                                        <input
                                            type="email"
                                            {...register("email")}
                                            className="form-control shadow"
                                            placeholder="e.g. ABCD@example.com"
                                        />
                                    </div>

                                    {/* Full Address */}
                                    <div className="mb-4">
                                        <label className="form-label">Full Address:</label>
                                        <input
                                            type="text"
                                            {...register("address")}
                                            className="form-control shadow"
                                            placeholder="Full Address"
                                        />
                                    </div>

                                    {/* Role */}
                                    <label className="form-label">Role:</label>
                                    <select
                                        {...register("role")}
                                        className="form-select form-control shadow"
                                        style={{ width: '150px' }}
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map(role => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Image Upload Section */}
                                <div className="col-md-4">
                                    <label className="rating-label form-label mb-3 ms-4">Profile Picture:</label>
                                    <div className="image-upload shadow ms-4">
                                        <div className="upload-icon">
                                            <GrUploadOption className="arrow-up" />
                                        </div>
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Uploaded Preview"
                                                className="img-thumbnail"
                                                style={{ maxWidth: "100%", height: "auto" }}
                                            />
                                        ) : (
                                            <div>
                                                <div className="upload-text fs-5">Upload Image Here</div>
                                                <div className="upload-subtext fs-6">
                                                    (Jpg, png files supported only)
                                                    <br />
                                                    (Max File Size 2 MB)
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            {...register("image")}
                                            className="form-control d-none"
                                            id="fileInput"
                                        />
                                        <button
                                            type="button"
                                            className="btn edit-btn mt-4"
                                            onClick={() => document.getElementById("fileInput").click()}
                                        >
                                            Select File
                                        </button>
                                    </div>
                                </div>

                                {/* Button Section */}
                                <div className="mt-4">
                                    <button type="submit" className="submit-btn">
                                        {loading ? "Updating..." : "Update Staff"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Toast Container */}
            <ToastContainer />
        </div>
    );
}

export default EditStaff;
