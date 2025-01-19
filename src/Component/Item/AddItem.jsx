import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GrUploadOption } from "react-icons/gr";

function AddItem() {
    const { register, handleSubmit, reset, setValue } = useForm();
    const [imagePreview, setImagePreview] = useState(null);
    const [rating, setRating] = useState(0);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [businessVariants, setBusinessVariants] = useState([{}]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories

                const sizeResponse = await axios.get("http://192.168.105.67:9000/size/list");

                // Check if the response has the expected structure
                if (sizeResponse.data && sizeResponse.data.data && sizeResponse.data.data.sizes) {
                    // setSizes(sizeResponse.data.data.sizes);
                    clg(sizeResponse.data.data.sizes);
                }
                // const category = await axios.get("https://ee64-2409-40c1-43-9e0c-fb56-3b03-1901-a49b.ngrok-free.app/size/list");

                // if (category.status === 200) {
                //     console.log(category, "Sizes Data");
                // } else {
                //     console.log("Error: Non-200 status code", category.status);
                // }

                // Fetch sizes
                // const sizeResponse = await axios.get("https://ee64-2409-40c1-43-9e0c-fb56-3b03-1901-a49b.ngrok-free.app/size/list");

                // if (sizeResponse.data && sizeResponse.data.sizes) {
                //     setSizes(sizeResponse.data.sizes); // Set sizes to state
                // } else {
                //     console.error("Sizes data is not in the expected format:", sizeResponse.data);
                // }

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load categories and sizes.");
            }
        };

        fetchData();
    }, []);

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
        try {
            await axios.post("https://your-api-endpoint-here.com/menu/create", data, {
                headers: {
                    'Authorization': 'Bearer YOUR_TOKEN_HERE' // If authentication is required
                }
            });
            toast.success("Item added successfully!");
        } catch (error) {
            toast.error("Failed to submit the form. Please try again.");
        }
    };

    const addBusinessVariant = () => setBusinessVariants([...businessVariants, { id: Date.now() }]);

    const VariantSection = ({ title, indexKey }) => (
        <div className="variants-section">
            <h3 className="variants-title">{title}</h3>
            {businessVariants.map((variant, index) => (
                <div className="row" key={`${indexKey}-${variant.id}-${index}`}>
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
                        <select {...register(`${indexKey}[${index}].sizeId`)} className="form-control shadow">
                            <option value="">Select Any One</option>
                            {sizes.map((size) => (
                                <option key={size._id} value={size._id}>{size.size}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3 mb-3">
                        <label className="form-label">Volume :</label>
                        <input type='text' {...register(`${indexKey}[${index}].volume`)} className="form-control shadow" placeholder="e.g. 60ml" />
                    </div>
                    <div className="col-md-3 mb-3">
                        <label className="form-label">Price :</label>
                        <input type='text' {...register(`${indexKey}[${index}].price`)} className="form-control shadow" placeholder="₹ e.g. 100" />
                    </div>
                </div>
            ))}
            <button type="button" className="add-variant-btn" onClick={addBusinessVariant}>+ ADD VARIANT</button>
        </div>
    );

    return (
        <div className='dashboard-container'>
            <div className="col-md-12 main-content">
                <div className="form-container">
                    <h1 className="form-title">Item Name Here</h1>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                            <div className="col-md-8">
                                {/* Name Field */}
                                <div className="mb-4">
                                    <label className="form-label">Name :</label>
                                    <input type="text" {...register("itemName")} className="form-control shadow" placeholder="e.g. Masala Tea" />
                                </div>

                                {/* Description Field */}
                                <div className="mb-4">
                                    <label className="form-label">Description :</label>
                                    <textarea {...register("description")} className="form-control shadow" rows="4" placeholder="Write a short description about this item..." />
                                </div>

                                {/* Ingredients Field */}
                                <div className="mb-4">
                                    <label className="form-label">Ingredients :</label>
                                    <input type="text" {...register("ingredients")} className="form-control shadow" placeholder="e.g. Masala Tea" />
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
                                            >★</span>
                                        ))}
                                    </div>
                                </div>
                                <input type="hidden" {...register("ratings")} value={rating} />
                            </div>

                            {/* Image Upload Section */}
                            <div className="col-md-4">
                                <label className="rating-label form-label mb-3 ms-4">Profile Picture :</label>
                                <div className="image-upload shadow ms-4">
                                    <div className="upload-icon"><GrUploadOption className='arrow-up' /></div>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Uploaded Preview" className="img-thumbnail" style={{ maxWidth: "100%", height: "auto" }} />
                                    ) : (
                                        <>
                                            <div className="upload-text fs-5">Upload Image Here</div>
                                            <div className="upload-subtext fs-6">(Jpg, png files supported only) (Max File Size 2 MB)</div>
                                        </>
                                    )}
                                    <input type="file" {...register("image")} className="form-control d-none" id="fileInput" onChange={handleImageUpload} />
                                    <button type="button" className="btn edit-btn mt-4" onClick={() => document.getElementById("fileInput").click()}>Select File</button>
                                </div>
                            </div>
                        </div>

                        {/* Variants Section */}
                        <VariantSection title="BUSINESS MENU VARIANTS" indexKey="businessVariants" />
                        <VariantSection title="PERSONAL MENU VARIANTS" indexKey="personalVariants" />

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
