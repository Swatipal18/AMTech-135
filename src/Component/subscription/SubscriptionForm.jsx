import React, { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { GrUploadOption, GrClose } from "react-icons/gr";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { applyCropZoomRotation } from "../../../utils/getCroppedImg";
import Cropper from "react-easy-crop";
import { FaArrowRotateRight } from "react-icons/fa6";
import { GoPlusCircle } from "react-icons/go";
import { FiMinusCircle } from "react-icons/fi";
import imageCompression from "browser-image-compression";

function SubscriptionForm() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [imagePreviews, setImagePreviews] = useState("");
    const [imageError, setImageError] = useState("");
    const [ratings, setRating] = useState(0);
    const [sizes, setSizes] = useState([]);
    const [imageSelected, setImageSelected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const { register, handleSubmit, setValue, reset, watch } = useForm();
    const [isOpenTime, setisOpenTime] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedPeriods, setSelectedPeriods] = useState([]);
    const [selectedtimePeriods, setSelectedtimePeriods] = useState([]);
    const [itemname, setitemname] = useState("");
    const [sizeId, setsizeId] = useState("");
    const volume = useRef();
    const sizePrice = useRef();
    const navigate = useNavigate()

    const onSubmit = async (data) => {
        const updatedData = {
            ...data,
            timings: selectedtimePeriods,
            itemName: itemname,
            size: {
                sizeId: sizeId,
                volume: volume.current.value,
                sizePrice: sizePrice.current.value,
            },
            period: selectedPeriods,
            price: sizePrice.current.value
        };
        console.log('updatedData: ', updatedData);
        try {
            const response = await axios.post(`${baseUrl}/subscription/create`,
                updatedData,
            );

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
                    navigate('/AllSubscriptions');
                }, 1000);
            }
        } catch (error) {
            console.error("Error details:", error.response ? error.response.data : error);
            toast.error(error.response?.data?.message || "Failed to submit the form. Please try again.");
        }
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        const maxFileSizeInKB = 10240; // 10 MB in KB (10 * 1024)
        if (file) {
            if (!allowedTypes.includes(file.type)) {
                setImageError("Only image files (JPG, PNG) are allowed!");
                setImagePreviews(null);
                setImageSelected(false);
                return;
            }

            const fileSizeInKB = file.size / 1024;
            console.log("Original file size:", fileSizeInKB.toFixed(2), "KB");
            if (fileSizeInKB <= maxFileSizeInKB) {
                setImagePreviews(URL.createObjectURL(file));
                setValue("images", file);
                setImageSelected(true);
                setImageError("");
            } else {
                try {
                    const options = {
                        maxSizeMB: 10,
                        maxWidthOrHeight: 1024,
                        useWebWorker: true,
                    };

                    const compressedFile = await imageCompression(file, options);
                    const compressedFileSizeInKB = compressedFile.size / 1024;
                    console.log(
                        "Compressed file size:",
                        compressedFileSizeInKB.toFixed(2),
                        "KB"
                    );

                    if (compressedFileSizeInKB > maxFileSizeInKB) {
                        setImageError("Compressed file size should not exceed 10 MB.");
                        setImagePreviews(null);
                        setImageSelected(false);
                        return;
                    }
                    const compressedImageURL = URL.createObjectURL(compressedFile);
                    setImagePreviews(compressedImageURL);
                    setValue("images", compressedFile);
                    setImageSelected(true);
                    setImageError("");
                } catch (error) {
                    console.error("Error during image compression:", error);
                    setImageError("Error while compressing image.");
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
            const croppedImage = await applyCropZoomRotation(
                imagePreviews,
                crop,
                zoom,
                rotation
            );
            setImagePreviews(croppedImage);
            const base64Response = await fetch(croppedImage);
            const blob = await base64Response.blob();
            const croppedFile = new File([blob], "cropped_image.jpg", {
                type: "image/jpeg",
            });
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
        setValue("ratings", index + 1);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".period-dropdown")) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);
    const handlePeriodSelect = (period) => {
        const updatedPeriods = selectedPeriods.includes(period)
            ? selectedPeriods.filter((p) => p !== period)
            : [...selectedPeriods, period];
        setSelectedPeriods(updatedPeriods);
    };
    const handletimePeriodSelect = (period) => {
        const updatedPeriods = selectedtimePeriods.includes(period)
            ? selectedtimePeriods.filter((p) => p !== period)
            : [...selectedtimePeriods, period];
        setSelectedtimePeriods(updatedPeriods);
    };

    useEffect(() => {

        const fetchData = async () => {
            try {
                const sizes = await axios.get(`${baseUrl}/size/list`);
                setSizes(sizes.data.data.sizes);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load categories and sizes.");
            }
        };

        fetchData();
    }, []);

    return (
        <div className="dashboard-container">
            <div className="col-md-12 main-content">
                <div className="form-container">
                    <h1 className="form-title">Add New Subscription</h1>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                            <div className="col-md-8">
                                {/* Name Field */}
                                <div className="mb-4">
                                    <label className="form-label">Name :</label>
                                    <input
                                        type="text"
                                        onChange={(e) => setitemname(e.target.value)}
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
                                        placeholder="Write a short description about this item..."
                                    />
                                </div>

                                {/* Ingredients Field */}
                                <div className="mb-4">
                                    <label className="form-label">Ingredients :</label>
                                    <input
                                        type="text"
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
                                                className={`rating-stars ${index < ratings ? "selected" : ""
                                                    }`}
                                                onClick={() => handleRatingClick(index)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <input type="hidden" {...register("ratings")} value={ratings} />
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
                                                    style={{
                                                        width: "200px",
                                                        height: "200px",
                                                        objectFit: "cover",
                                                    }}
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
                                                            type="button"
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
                                                            <div
                                                                className="control-group d-flex align-items-center pt-1 rounded-pill ps-2 zoom-icon    "
                                                                style={{ width: "180px", fontSize: "15px" }}
                                                            >
                                                                <label className="form-labels me-2">Zoom</label>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm border-0 "
                                                                    onClick={() =>
                                                                        setZoom((prev) => Math.max(1, prev - 0.1))
                                                                    }
                                                                >
                                                                    <FiMinusCircle
                                                                        style={{
                                                                            color: "#000080",
                                                                            fontSize: "18px",
                                                                        }}
                                                                    />
                                                                </button>
                                                                <span className="mx-2">{zoom.toFixed(1)}x</span>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm border-0"
                                                                    onClick={() =>
                                                                        setZoom((prev) => Math.min(3, prev + 0.1))
                                                                    }
                                                                >
                                                                    <GoPlusCircle
                                                                        style={{
                                                                            color: "#000080",
                                                                            fontSize: "18px",
                                                                        }}
                                                                    />
                                                                </button>
                                                            </div>
                                                            <div
                                                                className="control-group d-flex align-items-center pt-1 rounded-pill ps-3 zoom-icon  "
                                                                style={{ width: "130px", fontSize: "15px" }}
                                                            >
                                                                <label className="form-labels">Rotation</label>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm  mx-2 border-0"
                                                                    onClick={() =>
                                                                        setRotation((prev) => (prev + 90) % 360)
                                                                    }
                                                                >
                                                                    <FaArrowRotateRight
                                                                        style={{
                                                                            color: "#000080",
                                                                            fontSize: "17px",
                                                                        }}
                                                                    />
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
                                {imageError && (
                                    <div className="text-danger mt-2">{imageError}</div>
                                )}
                            </div>
                        </div>

                        {/* Variants Section */}

                        <div className="row" >
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Category :</label>
                                <select
                                    {...register("category")}
                                    className="form-control shadow"
                                    name="category"
                                >
                                    <option>Select Any One</option>
                                    <option>Regular</option>
                                    <option>jain</option>
                                </select>
                            </div>
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Size :</label>
                                <select
                                    className="form-control shadow"
                                    value={sizeId} // सही सेलेक्टेड वैल्यू दिखाने के लिए
                                    onChange={(e) => setsizeId(e.target.value)} // सेलेक्ट होने पर स्टेट अपडेट होगा
                                >
                                    <option value="">Select Any One</option>
                                    {sizes.map((size) => (
                                        <option key={size._id} value={size._id}>
                                            {size.size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Volume :</label>
                                <input
                                    type="text"
                                    // onChange={(e)=>setvolume(e.target.value)}
                                    className="form-control shadow"
                                    placeholder="e.g. 60ml"
                                    ref={volume}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Price :</label>
                                <input
                                    type="text"
                                    ref={sizePrice}
                                    className="form-control shadow"
                                    placeholder="₹ e.g. 100"
                                />
                            </div>

                            {/* ----------------------------   timing  ----------------------------    */}
                           
                            <div className="col-md-3 mb-3 position-relative ">
                                <h5>Timing : </h5>
                                <div
                                    className="position-absolute bg-white w-auto  form-control  mt-1"
                                    style={{ zIndex: 1000 }}
                                >
                                    select
                                    <div
                                        className="p-2 cursor-pointer justify-content-between hover-bg-light d-flex align-items-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handletimePeriodSelect("9:00 AM TO 10:00 AM");
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="me-2"
                                            checked={selectedtimePeriods.includes("9:00 AM TO 10:00 AM")}
                                            onChange={() => { }}
                                        />
                                        <span>9:00 AM TO 10:00 AM</span>
                                    </div>
                                    <div
                                        className="p-2 cursor-pointer justify-content-between hover-bg-light d-flex align-items-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handletimePeriodSelect("10:00 AM TO 11:00 AM");
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="me-2"
                                            checked={selectedtimePeriods.includes(
                                                "10:00 AM TO 11:00 AM"
                                            )}
                                            onChange={() => { }}
                                        />
                                        <span>10:00 AM TO 11:00 AM</span>
                                    </div>
                                    <div
                                        className="p-2 cursor-pointer justify-content-between hover-bg-light d-flex align-items-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handletimePeriodSelect("1:30 AM TO 2:30 AM");
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="me-2"
                                            checked={selectedtimePeriods.includes("1:30 AM TO 2:30 AM")}
                                            onChange={() => { }}
                                        />
                                        <span>1:30 AM TO 2:30 AM</span>
                                    </div>
                                    <div
                                        className="p-2 cursor-pointer justify-content-between hover-bg-light d-flex align-items-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handletimePeriodSelect("3:00 AM TO 4:00 AM");
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="me-2"
                                            checked={selectedtimePeriods.includes("3:00 AM TO 4:00 AM")}
                                            onChange={() => { }}
                                        />
                                        <span>3:00 AM TO 4:00 AM</span>
                                    </div>
                                    <div
                                        className="p-2 cursor-pointer justify-content-between hover-bg-light d-flex align-items-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handletimePeriodSelect("4:00 AM TO 5:00 AM");
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="me-2"
                                            checked={selectedtimePeriods.includes("4:00 AM TO 5:00 AM")}
                                            {...register("itemName")}
                                            onChange={() => { }}
                                        />
                                        <span>4:00 AM TO 5:00 AM</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 mb-3 ">
                                <label className="form-label">Period :</label>
                                <div className=" position-relative form-control ">
                                        <div
                                            className="  bg-white  w-100 mt-1"
                                            style={{ zIndex: 1000 }}
                                            >
                                            <div>select </div>
                                            <div
                                                className="p-2 cursor-pointer hover-bg-light d-flex align-items-center justify-content-between"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePeriodSelect("Weekly");
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="me-2"
                                                    checked={selectedPeriods.includes("Weekly")}
                                                    onChange={() => { }}

                                                />
                                                <span>Weekly</span>
                                            </div>
                                            <div
                                                className="p-2 cursor-pointer hover-bg-light d-flex align-items-center justify-content-between"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePeriodSelect("Monthly");
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="me-2"
                                                    checked={selectedPeriods.includes("Monthly")}
                                                    onChange={() => { }}
                                                />
                                                <span>Monthly</span>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button type="submit" className="submit-btn">
                                ADD Subscription
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default SubscriptionForm;

