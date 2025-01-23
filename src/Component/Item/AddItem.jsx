import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { GrUploadOption } from "react-icons/gr";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function AddItem() {
    const { register, handleSubmit, setValue, reset, watch } = useForm({
        defaultValues: {
            ratings: 0,
            images: null,
            size: [{
                sizeId: "",
                volume: "",
                sizePrice: ""
            }],
            personalSize: [{
                sizeId: "",
                volume: "",
                sizePrice: ""
            }]
        }
    });

    const [imagePreviews, setImagePreviews] = useState("");
    const [imageError, setImageError] = useState('');
    const [rating, setRating] = useState(0);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const baseUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const category = await axios.get(`${baseUrl}/admin/categories`);
                setCategories(category.data.data.categories);
                const sizes = await axios.get(`${baseUrl}/size/list`);
                setSizes(sizes.data.data.sizes);
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
    };

    const addPersonalVariant = () => {
        const personalSizeArray = watch("personalSize");
        personalSizeArray.push({ sizeId: "", volume: "", sizePrice: "" });
        setValue("personalSize", personalSizeArray);
    };

    const addBusinessVariant = () => {
        const sizeArray = watch("size");
        sizeArray.push({ sizeId: "", volume: "", sizePrice: "" });
        setValue("size", sizeArray);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (file) {
            if (!allowedTypes.includes(file.type)) {
                setImageError('Only image files (JPG, PNG) are allowed!');
                setImagePreviews(null);
                return;
            }

            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 10) {
                setImageError('File size should not exceed 10 MB.');
                setImagePreviews(null);
                return;
            }
            setImagePreviews(URL.createObjectURL(file));
            setValue("images", file);
            console.log(file, "file");
            setImageError('');
        }
    };


    const onSubmit = async (data) => {
        // console.log(data.images)
        try {
            const formData = new FormData();
            formData.append('images', data.images)
            const response = await axios.post(`${baseUrl}/menu/create`, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.data.success) {
                toast.success(response.data.message || "Item added successfully!", {
                    position: "top-right",
                    autoClose: 1000,
                    theme: "colored",
                    style: {
                        backgroundColor: ' green',
                        color: '#000',
                    },
                });
                reset();
                setRating(0);
                setImagePreviews("");

                setTimeout(() => {
                    navigate('/all-items');
                }, 1000);

            }
        } catch (error) {
            console.error("Error details:", error.response ? error.response.data : error);
            toast.error(error.response?.data?.message || "Failed to submit the form. Please try again.");
        }
    };

    return (
        <div className='dashboard-container'>
            <div className="col-md-12 main-content">
                <div className="form-container">
                    <h1 className="form-title">Add New Item</h1>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Name Field */}
                        <div className="row">
                            <div className="col-md-8">
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
                                        rows="4"
                                        style={{
                                            resize: 'none',
                                            overflowY: 'auto',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none'
                                        }}
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
                                        placeholder="e.g. Tea, Sugar, Milk"
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
                                                onClick={() => handleRatingClick(index)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <input
                                    type="hidden"
                                    {...register("ratings", { required: true })}
                                    value={rating}
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div className="col-md-4">
                                <label className="form-label mb-3 ms-4">Image:</label>
                                <div className="image-upload shadow ms-4">
                                    <div className="upload-icon">
                                        <GrUploadOption className="arrow-up" />
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
                                                (Max File Size 10 MB)
                                            </div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        className="form-control d-none"
                                        id="fileInput"
                                        {...register("images")}
                                        onChange={handleImageChange}
                                    />
                                    <button
                                        type="button"
                                        className="edit-btn mt-4"
                                        onClick={() => document.getElementById("fileInput").click()}
                                    >
                                        Select File
                                    </button>
                                </div>
                                {imageError && <div className="text-danger mt-2">{imageError}</div>}
                            </div>
                        </div>

                        {/* Business Menu Variants */}
                        <div className="variants-section">
                            <h3 className="variants-title">Business Menu Variants</h3>
                            {watch("size").map((_, index) => (
                                <div key={index} className="row" >
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Category :</label>
                                        <select
                                            {...register('categoryId')}
                                            className="form-control shadow"

                                        >
                                            <option value="">Select Any One</option>
                                            {categories.map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Size :</label>
                                        <select
                                            {...register(`size[${index}].sizeId`)}
                                            className="form-control shadow"
                                        >
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
                                            {...register(`size[${index}].volume`)}
                                            className="form-control shadow"
                                            placeholder="e.g. 60ml"
                                        />
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Price :</label>
                                        <input
                                            type="number"
                                            {...register(`size[${index}].sizePrice`)}
                                            className="form-control shadow"
                                            placeholder="₹ e.g. 100"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="add-variant-btn" onClick={addBusinessVariant}>
                                + ADD VARIANT
                            </button>
                        </div>
                        {/* Personal Menu Variants */}
                        <div className="variants-section">
                            <h3 className="variants-title">Personal Menu Variants</h3>
                            {watch("personalSize").map((_, index) => (
                                <div key={index} className="row">
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Category :</label>
                                        <select
                                            {...register(`personalSize[${index}].categoryId`)}
                                            className="form-control shadow"
                                            disabled
                                        >
                                            <option value="">Select Any One</option>
                                            {categories.map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Personal Size - Size */}
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Size :</label>
                                        <select
                                            {...register(`personalSize[${index}].sizeId`)}
                                            className="form-control shadow"
                                        >
                                            <option value="">Select Any One</option>
                                            {sizes.map((size) => (
                                                <option key={size._id} value={size._id}>{size.size}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Personal Size - Volume */}
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Volume :</label>
                                        <input
                                            type="text"
                                            {...register(`personalSize[${index}].volume`)}
                                            className="form-control shadow"
                                            placeholder="e.g. 60ml"
                                        />
                                    </div>

                                    {/* Personal Size - Price */}
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Price :</label>
                                        <input
                                            type="number"
                                            {...register(`personalSize[${index}].sizePrice`)}
                                            className="form-control shadow"
                                            placeholder="₹ e.g. 100"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="add-variant-btn" onClick={addPersonalVariant}>
                                + ADD VARIANT
                            </button>

                        </div>

                        <div className="mt-4">
                            <button type="submit" className="submit-btn">ADD ITEM</button>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default AddItem;