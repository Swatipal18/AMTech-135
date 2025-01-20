import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { GrUploadOption } from "react-icons/gr";
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditItem() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const { register, handleSubmit, reset } = useForm();
    const { id } = useParams();
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreviews, setImagePreview] = useState(null);
    const handleRatingClick = (index) => {
        setRating(index + 1);
        setValue("rating", index + 1);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && ["image/jpeg", "image/png"].includes(file.type) && file.size <= 2 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            alert("Invalid file type or size.");
        }
    };
    const onSubmit = async (data) => {
        console.log(data, "Item Form Data");
        try {
            setLoading(true);
            const response = await axios.put(`${baseUrl}/menu/update/${id}`, data);
            console.log(response.data, "response");
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
                navigate('/all-items');
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
    const fetchStaffDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/menu/details/${id}`);
            const staffData = response.data.data;
            console.log(staffData, "staffData");
            setRating(staffData.ratings || 0);
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
    const fetchData = async () => {
        try {
            // Fetch categories
            const category = await axios.get(`${baseUrl}/admin/categories`);
            setCategories(category.data.data.categories); // Save categories to state

            // Fetch sizes
            const sizes = await axios.get(`${baseUrl}/size/list`);
            setSizes(sizes.data.data.sizes); // Save sizes to state
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load categories and sizes.");
        }
    };
    useEffect(() => {
        fetchStaffDetails();
        fetchData();
    }, [id]);
    return (
        <div className='dashboard-container'>
            <div className="col-md-12 main-content">
                <div className="form-container">
                    <h1 className="form-title"> Edit Item Details </h1>
                    {/* Single Parent Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                            <div className="col-md-8">
                                {/* Name Field */}
                                <div className="mb-4">
                                    <label className="form-label">Name :</label>
                                    <input
                                        type='text'
                                        {...register("itemName")}
                                        className="form-control shadow"
                                        placeholder="e.g. Masala Tea"
                                    />
                                </div>

                                {/* Description Field */}
                                <div className="mb-4">
                                    <label className="form-label">Description :</label>
                                    <textarea
                                        {...register("description")}
                                        className="form-control shadow"
                                        rows="4" style={{ resize: 'none' }}
                                        placeholder="Write a short description about this item..."
                                    />
                                </div>

                                {/* Ingredients Field */}
                                <div className="mb-4">
                                    <label className="form-label">Ingredients :</label>
                                    <input
                                        type='text'
                                        {...register("ingredients")}
                                        className="form-control shadow"
                                        placeholder="e.g. Masala Tea"
                                    />
                                </div>

                                {/* Rating */}
                                <div className="mb-4 rating d-flex align-items-center">
                                    <label className="rating-label form-label">Ratings:</label>
                                    <div className="rating-stars-container">
                                        {[...Array(5)].map((_, index) => (
                                            <span
                                                key={index}
                                                className={`rating-stars ${index < rating ? "selected" : ""}`}
                                                onClick={() => handleRatingClick(index)} // Handle star click
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* Hidden Input for React Hook Form */}
                                <input
                                    type="hidden"
                                    {...register("ratings", { required: true })}
                                    value={rating}
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div className="col-md-4">
                                <label className="form-label mb-3 ms-4">Profile Picture :</label>
                                <div className="image-upload shadow ms-4">
                                    <div className="upload-icon">
                                        <GrUploadOption className='arrow-up' />
                                    </div>
                                    {imagePreviews ? (
                                        <img
                                            src={imagePreviews}
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
                                        accept="image/jpeg, image/png"
                                        className="form-control d-none"
                                        id="fileInput"
                                        onChange={handleImageUpload}
                                        {...register("images")}
                                    />
                                    <button
                                        className="btn edit-btn mt-4"
                                        onClick={() => document.getElementById("fileInput").click()}
                                    >
                                        Select File
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* BUSINESS MENU VARIANTS */}
                        <div className="variants-section">
                            <h3 className="variants-title">BUSINESS MENU VARIANTS</h3>
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Category :</label>
                                    <select {...register("categoryId")} className="form-control shadow">
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Size :</label>
                                    <select {...register("size[0].sizeId")} className="form-control shadow">
                                        <option value="">Select Any One</option>
                                        {sizes.map((size) => (
                                            <option key={size._id} value={size._id}>{size.size}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Volume :</label>
                                    <input
                                        type="text"
                                        {...register("size[0].volume")}
                                        className="form-control shadow"
                                        placeholder="e.g. 60ml"
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Price :</label>
                                    <input
                                        type="text"
                                        {...register("size[0].sizePrice")}
                                        className="form-control shadow"
                                        placeholder="₹ e.g. 100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PERSONAL MENU VARIANTS */}
                        <div className="variants-section">
                            <h3 className="variants-title">PERSONAL MENU VARIANTS</h3>
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Category :</label>
                                    <select
                                        {...register("personalSize[0].categoryId")}
                                        className="form-control shadow"
                                        disabled
                                    >
                                        <option value="" className=''>Select Category</option>
                                    </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Size :</label>
                                    <select {...register("personalSize[0].sizeId")} className="form-control shadow">
                                        <option value="">Select Any One</option>
                                        {sizes.map((size) => (
                                            <option key={size._id} value={size._id}>{size.size}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Volume :</label>
                                    <input
                                        type="text"
                                        {...register("personalSize[0].volume")}
                                        className="form-control shadow"
                                        placeholder="e.g. 60ml"
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Price :</label>
                                    <input
                                        type="text"
                                        {...register("personalSize[0].sizePrice")}
                                        className="form-control shadow"
                                        placeholder="₹ e.g. 100"
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="mt-4">
                            <button type="submit" className="submit-btn">
                                {loading ? "Updating..." : "Update Item"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditItem