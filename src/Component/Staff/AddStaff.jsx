import axios from 'axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { GrUploadOption } from "react-icons/gr";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function AddStaff() {
    const { register, handleSubmit, reset } = useForm();
    const [selectedRole, setSelectedRole] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const roles = ['Delivery Boy', 'Staff Member', 'Store Manager', 'Kitchen Member'];
    const navigate = useNavigate();
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validFileTypes = ["image/jpeg", "image/png"];
            const maxFileSize = 2 * 1024 * 1024; // 2 MB

            if (!validFileTypes.includes(file.type)) {
                return toast.error("Only JPG and PNG files are supported.");
                ;
            }

            if (file.size > maxFileSize) {
                return toast.error("File size should not exceed 2 MB.");
            }

            // Preview the selected image
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        try {
            const url = "http://192.168.1.12:9000/store/create";
            const response = await axios.post(url, data);
            toast.success("Form submitted successfully!"); // Success toast
            reset();
            setSelectedRole('');
            setImagePreview(null);


            navigate('/AllStaff'); // Change '/staff-list' to the desired route

        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to submit the form. Please try again."); // Error toast
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Main Content */}
                <div className="col-md-12 main-content">
                    <div className="form-container">
                        <h1 className="form-title">Add New Staff</h1>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="row">
                                <div className="col-md-8">
                                    {/* Name Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Name :</label>
                                        <input
                                            type="text"
                                            {...register("username")}
                                            className="form-control shadow"
                                            placeholder="e.g. Full Name"
                                        />
                                    </div>

                                    {/* Mobile Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Mobile Number :</label>
                                        <input
                                            type='number'
                                            {...register("contact")}
                                            className="form-control shadow no-spinner"
                                            placeholder="e.g. +91 1234567890"
                                        />
                                    </div>
                                    {/* Email Field */}
                                    <div className="mb-4">
                                        <label className="form-label">E-Mail Address :</label>
                                        <input
                                            type="email"
                                            {...register("email")}
                                            className="form-control shadow"
                                            placeholder="e.g. ABCD@example.com"
                                        />
                                    </div>
                                    {/* Full Address */}
                                    <div className="mb-4">
                                        <label className="form-label">Full Address :</label>
                                        <input
                                            type="text"
                                            {...register("address")}
                                            className="form-control shadow"
                                            placeholder="Full Address"
                                        />
                                    </div>
                                    {/* Role */}
                                    <select
                                        {...register("role")}
                                        className="form-select form-control shadow"
                                        style={{
                                            width: '400px',
                                            color: selectedRole === "" ? '#8DA9C4 ' : 'inherit'
                                        }}
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="">All Roles</option>
                                        {roles.map(role => (
                                            <option key={role} value={role} className='text-dark'>{role}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Image Upload Section */}
                                <div className="col-md-4">
                                    <label className="rating-label form-label mb-3 ms-4">Profile Picture :</label>
                                    <div className="image-upload shadow ms-4">
                                        <div className="upload-icon">
                                            <GrUploadOption className='arrow-up' />
                                        </div>
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Uploaded Preview"
                                                className="img-thumbnail"
                                                style={{ maxWidth: "100%", height: "auto" }}
                                            />
                                        ) : (
                                            <>
                                                <div className="upload-text fs-5">Upload Image Here</div>
                                                <div className="upload-subtext fs-6">
                                                    (Jpg, png files supported only)
                                                    <br />
                                                    (Max File Size 2 MB)
                                                </div>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            {...register("image")}
                                            className="form-control d-none"
                                            id="fileInput"
                                            onChange={handleImageUpload}
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
                                    <button type="submit" className="submit-btn">ADD ITEM</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddStaff;
