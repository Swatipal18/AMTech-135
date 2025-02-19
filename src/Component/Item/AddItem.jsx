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
import imageCompression from 'browser-image-compression';

function AddItem() {
    const { register, handleSubmit, setValue, reset, watch } = useForm({
        defaultValues: {
            ratings: 0,
            images: null,
            categoryId: "",
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
    const navigate = useNavigate();
    useEffect(() => {

        const fetchData = async () => {
            try {
                const category = await axios.get(`${baseUrl}/admin/categories-list`);
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
        const sizeArray = watch("size") || [];
        sizeArray.push({ sizeId: "", volume: "", sizePrice: "" });
        setValue("size", sizeArray);
    };
    const businessVariants = watch("size") || [];
    const removeBusinessVariant = (index) => {
        const sizeArray = watch("size");
        if (sizeArray.length > 1) {
            const newArray = sizeArray.filter((_, i) => i !== index);
            setValue("size", newArray);
        }
    };

    const removePersonalVariant = (index) => {
        const personalSizeArray = watch("personalSize");
        if (personalSizeArray.length > 1) {
            const newArray = personalSizeArray.filter((_, i) => i !== index);
            setValue("personalSize", newArray);
        }
    };
    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxFileSizeInKB = 10240; // 10 MB in KB (10 * 1024)
        if (file) {
            if (!allowedTypes.includes(file.type)) {
                setImageError('Only image files (JPG, PNG) are allowed!');
                setImagePreviews(null);
                setImageSelected(false);
                return;
            }

            const fileSizeInKB = file.size / 1024;
            if (fileSizeInKB <= maxFileSizeInKB) {
                setImagePreviews(URL.createObjectURL(file));
                setValue("images", file);
                setImageSelected(true);
                setImageError('');
            } else {
                try {
                    const options = {
                        maxSizeMB: 10,
                        maxWidthOrHeight: 1024,
                        useWebWorker: true,
                    };

                    const compressedFile = await imageCompression(file, options);
                    const compressedFileSizeInKB = compressedFile.size / 1024;
                    console.log('Compressed file size:', compressedFileSizeInKB.toFixed(2), 'KB');

                    if (compressedFileSizeInKB > maxFileSizeInKB) {
                        setImageError('Compressed file size should not exceed 10 MB.');
                        setImagePreviews(null);
                        setImageSelected(false);
                        return;
                    }
                    const compressedImageURL = URL.createObjectURL(compressedFile);
                    setImagePreviews(compressedImageURL);
                    setValue("images", compressedFile);
                    setImageSelected(true);
                    setImageError('');
                } catch (error) {
                    console.error('Error during image compression:', error);
                    setImageError('Error while compressing image.');
                    setImagePreviews(null);
                    setImageSelected(false);
                }
            }
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
            convertToBinary(croppedFile);

        } catch (error) {
            console.error("Error while cropping the image: ", error);
        }
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
    const handleActiveStatus = (sizeData) => {
        if (sizeData && sizeData.length === 0) {
            return { isActive: false, sizeData: [] };
        } else if (sizeData && sizeData.length > 0) {
            const validSizes = sizeData.filter(item => item.sizeId);
            return validSizes.length === 0
                ? { isActive: false, sizeData: [] }
                : { isActive: true, sizeData: validSizes };
        }
        return { isActive: false, sizeData: [] };
    };
    const onSubmit = async (data) => {
        console.log(data)
        try {
            const businessStatus = handleActiveStatus(data.size);
            const personalStatus = handleActiveStatus(data.personalSize);

            data.isActiveForBusiness = businessStatus.isActive;
            data.size = businessStatus.sizeData;

            data.isActiveForPersonal = personalStatus.isActive;
            data.personalSize = personalStatus.sizeData;

            const requestData = {
                isActiveForBusiness: data.isActiveForBusiness,
                isActiveForPersonal: data.isActiveForPersonal,
            };


            const formData = new FormData();
            formData.append('images', data.images);
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
                        backgroundColor: 'green',
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
            <div className="main-content">
                <div className="form-container">
                    <h1 className="form-title">Add New Item</h1>
                    <form method='POST' onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" >
                        <div className="row g-0 ">
                            {/* Name Field */}
                            <div className="col-lg-9 col-md-8 col-sm-6 form-size" >
                                <div className="mb-4">
                                    <label className="form-label">Name :</label>
                                    <input
                                        type='text'
                                        name="itemName"
                                        {...register("itemName")}
                                        // value="hello"
                                        className="form-control shadow"
                                        placeholder="e.g. Masala Tea"
                                    />
                                </div>

                                {/* Description Field */}
                                <div className="mb-4">
                                    <label className="form-label">Description :</label>
                                    <textarea
                                        name='description'
                                        {...register("description")}
                                        // value="hello"
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
                                        name="ingredients"
                                        // value="hello"
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
                                    name="ratings"

                                    {...register("ratings", { required: true })}
                                    value={rating}
                                />

                            </div>
                            {/* <div className="col-1"></div> */}
                            {/* Image Upload Section */}
                            <div className="col-lg-3 col-md-3 col-sm-6    ">
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
                                        name='images'
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
                        <div className="row">
                            {/* Business Menu Variants */}
                            <div className="variants-section col-12">
                                <h3 className="variants-title">Business Menu Variants</h3>
                                <div className="row">
                                    {watch("size").map((_, index) => (
                                        <div key={index} className="row w-100 mx-0 mb-3">
                                            <div className="col-md-3 mb-2">
                                                <label className="form-label">Category :</label>
                                                <select
                                                    {...register('categoryId')}
                                                    className="form-control shadow"
                                                    name='categoryId'
                                                    disabled={businessVariants.length > 1}
                                                >
                                                    <option value="">Select Any One</option>
                                                    {categories.map((category) => (
                                                        <option key={category._id} value={category._id}>
                                                            {category.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label">Size :</label>
                                                <select
                                                    {...register(`size[${index}].sizeId`)}
                                                    className="form-control shadow"
                                                    name={`size[${index}].sizeId`}
                                                >
                                                    <option value="">Select Any One</option>
                                                    {sizes.map((size) => (
                                                        <option key={size._id} value={size._id}>{size.size}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label">Volume :</label>
                                                <input
                                                    type="text"
                                                    {...register(`size[${index}].volume`)}
                                                    name={`size[${index}].volume`}
                                                    className="form-control shadow"
                                                    placeholder="e.g. 60ml"
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label">Price :</label>
                                                <input
                                                    type="number"
                                                    name={`size[${index}].sizePrice`}
                                                    {...register(`size[${index}].sizePrice`)}
                                                    className="form-control shadow"
                                                    placeholder="₹ e.g. 100"
                                                />
                                            </div>

                                            {watch("size").length > 1 && (
                                                <div className="col-2 d-flex align-items-end">
                                                    <button
                                                        type="button"
                                                        className="btn mb-2"
                                                        onClick={() => removeBusinessVariant(index)}
                                                    >
                                                        <FiMinusCircle className='text-danger  fs-5' /><b className='ms-2'>Remove Variant</b>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button type="button" className="add-variant-btn" onClick={addBusinessVariant}>
                                    + ADD VARIANT
                                </button>
                            </div>

                            {/* Personal Menu Variants */}
                            <div className="variants-section col-12">
                                <h3 className="variants-title">Personal Menu Variants</h3>
                                {watch("personalSize").map((_, index) => (
                                    <div key={index} className="row">
                                        <div className="col-md-3 mb-2">
                                            <label className="form-label">Category :</label>
                                            <select
                                                // {...register(`personalSize[${index}].categoryId`)}
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

                                        {/* Personal Size */}
                                        <div className="col-md-3 mb-2">
                                            <label className="form-label">Size :</label>
                                            <select
                                                name={`personalSize[${index}].sizeId`}
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
                                        <div className="col-md-3 mb-2">
                                            <label className="form-label">Volume :</label>
                                            <input
                                                type="text"
                                                name={`personalSize[${index}].volume`}
                                                {...register(`personalSize[${index}].volume`)}
                                                // value="120ml"
                                                className="form-control shadow"
                                                placeholder="e.g. 60ml"
                                            />
                                        </div>

                                        {/* Personal Size - Price */}
                                        <div className="col-md-3 mb-2">
                                            <label className="form-label">Price :</label>
                                            <input
                                                type="number"
                                                name={`personalSize[${index}].sizePrice`}
                                                {...register(`personalSize[${index}].sizePrice`,)}
                                                // value="100"
                                                className="form-control shadow"
                                                placeholder="₹ e.g. 100"
                                            />
                                        </div>
                                        {watch("personalSize").length > 1 && (
                                            <div className="col-2 d-flex align-items-end">
                                                <button
                                                    type="button"
                                                    className="btn mb-2"
                                                    onClick={() => removePersonalVariant(index)}
                                                >
                                                    <FiMinusCircle className='text-danger  fs-5' /><b className='ms-2'>Remove Variant</b>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="add-variant-btn mt-3" onClick={addPersonalVariant}>
                                    + ADD VARIANT
                                </button>

                            </div>

                        </div>

                        <div className="mt-4">
                            <button type="submit" className="submit-btn">ADD ITEM</button>
                        </div>
                    </form>
                </div >
            </div >
            <ToastContainer />
        </div >
    );
}

export default AddItem;