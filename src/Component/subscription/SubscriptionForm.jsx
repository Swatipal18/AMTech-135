import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { GrUploadOption, GrClose } from "react-icons/gr";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { applyCropZoomRotation } from '../../../utils/getCroppedImg';
import Cropper from 'react-easy-crop';
import { FaArrowRotateRight } from "react-icons/fa6";
import { GoPlusCircle } from "react-icons/go";
import { FiMinusCircle } from "react-icons/fi";

function SubscriptionForm() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [imagePreviews, setImagePreviews] = useState("");
    const [imageError, setImageError] = useState('');
    const [rating, setRating] = useState(0);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [imageSelected, setImageSelected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [businessVariants, setBusinessVariants] = useState([{}]);
    const { register, handleSubmit, setValue, reset, watch } = useForm()

    const onSubmit = async (data) => {
        console.log(data, "Subscription Form Data");
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (file) {
            if (!allowedTypes.includes(file.type)) {
                setImageError('Only image files (JPG, PNG) are allowed!');
                setImagePreviews(null);
                setImageSelected(false);
                return;
            }

            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 10) {
                setImageError('File size should not exceed 10 MB.');
                setImagePreviews(null);
                setImageSelected(false);
                return;
            }
            setImagePreviews(URL.createObjectURL(file));
            setValue("images", file);
            setImageSelected(true);
            setImageError('');
        }
    };
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);
    const updateImagePreview = async () => {
        try {
            const croppedImage = await applyCropZoomRotation(imagePreviews, crop, zoom, rotation);
            setImagePreviews(croppedImage);
            const base64Response = await fetch(croppedImage);
            const blob = await base64Response.blob();
            const croppedFile = new File([blob], 'cropped_image.jpg', { type: 'image/jpeg' });
            setValue("images", croppedFile);

        } catch (error) {
            console.error("Error while cropping the image: ", error);
        }
    };
    const closeModal = () => {
        setIsModalOpen(false);
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
                                                onChange={() => { }}
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
                                                onChange={() => { }}
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
                                <label className="form-label mb-3 ms-4">Image:</label>
                                <div className="image-upload shadow ms-4">
                                    <div className="upload-icon">
                                        <GrUploadOption className="arrow-up" />
                                    </div>
                                    {imagePreviews ? (
                                        <>
                                            <div className="image-preview-container mt-3">
                                                <img
                                                    src={imagePreviews}
                                                    alt="Uploaded Preview"
                                                    className="img-thumbnail cursor-pointer"
                                                    style={{ width: "200px", height: "200px", objectFit: "cover" }}
                                                    onClick={() => setIsModalOpen(true)}
                                                />
                                            </div>

                                            {isModalOpen && (
                                                <div
                                                    className="modal-overlay"
                                                    onClick={(e) => {
                                                        if (e.target === e.currentTarget) {
                                                            closeModal();
                                                        }
                                                    }}
                                                >
                                                    <div
                                                        className="modal-div"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            type='button'
                                                            onClick={closeModal}
                                                            className="close-button"
                                                        >
                                                            <GrClose />
                                                        </button>
                                                        <Cropper
                                                            image={imagePreviews}
                                                            crop={crop}
                                                            zoom={zoom}
                                                            rotation={rotation}
                                                            aspect={5 / 3}
                                                            onCropChange={setCrop}
                                                            onZoomChange={setZoom}
                                                            onRotationChange={setRotation}
                                                            onCropComplete={onCropComplete}
                                                        />
                                                        <div className="crop-controls">
                                                            <div className="control-group d-flex align-items-center pt-1 rounded-pill ps-2 zoom-icon    " style={{ width: "180px", fontSize: "15px" }}>
                                                                <label className="form-labels me-2">Zoom</label>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm border-0 "
                                                                    onClick={() => setZoom(prev => Math.max(1, prev - 0.1))}
                                                                >
                                                                    <FiMinusCircle style={{ color: "#000080", fontSize: "18px" }} />
                                                                </button>
                                                                <span className="mx-2">{zoom.toFixed(1)}x</span>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm border-0"
                                                                    onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                                                                >
                                                                    <GoPlusCircle style={{ color: "#000080", fontSize: "18px" }} />
                                                                </button>
                                                            </div>
                                                            <div className="control-group d-flex align-items-center pt-1 rounded-pill ps-3 zoom-icon  " style={{ width: "130px", fontSize: "15px" }} >
                                                                <label className="form-labels">Rotation</label>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm  mx-2 border-0"
                                                                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                                                >
                                                                    <FaArrowRotateRight style={{ color: "#000080", fontSize: "17px" }} />
                                                                </button>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                style={{ fontSize: "15px" }}
                                                                className="edit-btn"
                                                                onClick={async () => {
                                                                    console.log("Done button clicked");
                                                                    await updateImagePreview();
                                                                    closeModal();
                                                                }}
                                                            >
                                                                Done
                                                            </button>
                                                            <button
                                                                type="button"
                                                                style={{ fontSize: "15px" }}
                                                                className="edit-btn full-size-btn"
                                                                onClick={() => {
                                                                    setZoom(1);
                                                                    setRotation(0);
                                                                }}
                                                            >
                                                                Real Size
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
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

                        {/* Variants Section */}
                        <VariantSection indexKey="businessVariants" />

                        <div className="mt-4">
                            <button type="submit" className="submit-btn">ADD Subscription</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SubscriptionForm;