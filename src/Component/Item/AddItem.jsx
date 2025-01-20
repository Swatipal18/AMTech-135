import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GrUploadOption } from "react-icons/gr";

function AddItem() {
    const { register, handleSubmit, setValue, reset, watch } = useForm({
        defaultValues: {
            ratings: 0 // Default rating value
        }
    });
    const [imagePreviews, setImagePreview] = useState(null);
    const [rating, setRating] = useState(0);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
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

        fetchData();
    }, []);

    const handleRatingClick = (index) => {
        setRating(index + 1);
        setValue("ratings", index + 1);
        console.log("Rating selected: ", index + 1); // Debugging: Check the updated rating
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && ["image/jpeg", "image/png"].includes(file.type) && file.size <= 2 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
                setValue("image", file);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Invalid file type or size.");
        }
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            // If the key is "image", append the actual file instead of a base64 string
            if (key === "image" && data[key]) {
                formData.append("image", data[key]);
            } else {
                formData.append(key, data[key]);
            }
        });
        // console.log(data, "Item Form Data"); // Log entire form data
        try {
            const response = await axios.post("http://192.168.1.12:9000/menu/create", data, { headers: { "Content-Type": "multipart/form-data" } });
            console.log(response.data, "response");
            toast.success("Item added successfully!");
            reset();
        } catch (error) {
            console.error("Error details:", error.response ? error.response.data : error);
            toast.error(error.response?.data?.message || "Failed to submit the form. Please try again.");
        }
    };

    return (
        <div className='dashboard-container'>
            <div className="col-md-12 main-content">
                <div className="form-container">
                    <h1 className="form-title">Item Name Here</h1>
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
                                    {...register("ratings", { required: true })} // Ensure ratings field is registered correctly
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
                                        <option value="">Select Category</option>
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
                            <button type="submit" className="submit-btn">ADD ITEM</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddItem;
