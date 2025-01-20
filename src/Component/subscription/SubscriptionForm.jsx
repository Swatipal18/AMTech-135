import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GrUploadOption } from "react-icons/gr";

function SubscriptionForm() {
    const { register, handleSubmit, reset, setValue } = useForm();
    const [imagePreview, setImagePreview] = useState(null);
    const [rating, setRating] = useState(0);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [businessVariants, setBusinessVariants] = useState([{}]);

    const onSubmit = async (data) => {
        console.log(data, "Subscription Form Data");
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

    const handleRatingClick = (index) => {
        setRating(index + 1);
        setValue("rating", index + 1);
    };

    // Component for variant section with Period dropdown
    const VariantSection = ({ title, indexKey }) => {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [selectedPeriods, setSelectedPeriods] = useState([]);

        // Close dropdown when clicking outside
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (!event.target.closest('.period-dropdown')) {
                    setIsDropdownOpen(false);
                }
            };

            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }, []);

        const handlePeriodSelect = (period) => {
            const updatedPeriods = selectedPeriods.includes(period)
                ? selectedPeriods.filter(p => p !== period)
                : [...selectedPeriods, period];
            setSelectedPeriods(updatedPeriods);
            setValue(`${indexKey}.period`, updatedPeriods);
        };

        return (
            <div className="variants-section">
                <h3 className="variants-titles">{title}</h3>
                {businessVariants.map((variant, index) => (
                    <div className="row" key={`${indexKey}-${variant.id}-${index}`}>
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Period :</label>
                            <div className="period-dropdown position-relative">
                                <div
                                    className="form-control shadow d-flex justify-content-between align-items-center"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(!isDropdownOpen);
                                    }}
                                    style={{
                                        cursor: 'pointer',
                                        paddingRight: '30px',
                                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 10px center',
                                        backgroundSize: '16px'
                                    }}
                                >
                                    {selectedPeriods.length > 0 ? selectedPeriods.join(', ') : 'Select'}
                                </div>
                                {isDropdownOpen && (
                                    <div className="position-absolute bg-white border rounded shadow-sm w-100 mt-1" style={{ zIndex: 1000 }}>
                                        <div
                                            className="p-2 cursor-pointer border-bottom hover-bg-light d-flex align-items-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePeriodSelect('Weekly');
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="me-2"
                                                checked={selectedPeriods.includes('Weekly')}
                                                onChange={() => {}}
                                            />
                                            <span>Weekly</span>
                                        </div>
                                        <div
                                            className="p-2 cursor-pointer hover-bg-light d-flex align-items-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePeriodSelect('Monthly');
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="me-2"
                                                checked={selectedPeriods.includes('Monthly')}
                                                onChange={() => {}}
                                            />
                                            <span>Monthly</span>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Timings :</label>
                            <input type='text' {...register(`${indexKey}[${index}].timings`)} className="form-control shadow" placeholder="e.g. 9:00 AM to 10:00 AM" />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className='dashboard-container'>
            <div className="col-md-12 main-content">
                <div className="form-container">
                    <h1 className="form-title">Add New Subscription</h1>
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

                        <div className="mt-4">
                            <button type="submit" className="submit-btn">ADD ITEM</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SubscriptionForm;