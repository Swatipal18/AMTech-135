import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { GrUploadOption, GrClose } from "react-icons/gr";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import { applyCropZoomRotation } from '../../../utils/getCroppedImg';
import Cropper from 'react-easy-crop';
import { FaArrowRotateRight } from "react-icons/fa6";
import { GoPlusCircle } from "react-icons/go";
import { FiMinusCircle } from "react-icons/fi";
import imageCompression from 'browser-image-compression';

function EditBanners() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const { id } = useParams();
    const [imagePreviews, setImagePreviews] = useState("");
    const [imageError, setImageError] = useState('');
    const { register, handleSubmit, setValue, reset, watch } = useForm();
    const [imagePreview, setImagePreview] = useState(null);
    const [imageSelected, setImageSelected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [sends, setSends] = useState('');
    const send = ['active', 'Inactive', 'scheduled'];
    const [sendType, setSendType] = useState('now'); // Default to 'now'
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const fetchStaffDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/getDetails/${id}`);
            console.log('response: ', response);

            // Populate form fields with the fetched data
            if (response.data && response.data.data) {
                const bannerData = response.data.data;

                // Set form values
                setValue("targetLink", bannerData.targetLink);
                setValue("activity", bannerData.activity);
                setSends(bannerData.activity);

                // Set image preview if available
                if (bannerData.imageUrl) {
                    setImagePreviews(bannerData.imageUrl);
                    setImageSelected(true);
                }

                // Check if scheduled and set appropriate fields
                if (bannerData.activity === 'scheduled' && bannerData.scheduleTime) {
                    setSendType('schedule');

                    const scheduleDate = new Date(bannerData.scheduleTime);

                    // Format date for input
                    const formattedDate = scheduleDate.toISOString().split('T')[0];
                    setValue("scheduleDate", formattedDate);

                    // Get time components
                    let hours = scheduleDate.getHours();
                    const minutes = scheduleDate.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';

                    // Convert to 12-hour format
                    hours = hours % 12;
                    hours = hours ? hours : 12; // Handle midnight (0 hours)

                    setValue("scheduleHour", hours);
                    setValue("scheduleMinute", minutes);
                    setValue("scheduleAmPm", ampm);
                    setValue("scheduleTime", bannerData.scheduleTime);
                }

                // Show success toast for data loading
                toast.success("Banner details loaded successfully!", {
                    position: "top-right",
                    autoClose: 1000,
                    theme: "colored",
                    style: {
                        backgroundColor: '#ffeb3b', // Yellow color
                        color: '#000',
                    },
                });
            }
        } catch (err) {
            console.error("Error fetching banner details:", err);
            toast.error("Failed to load banner details. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
                style: {
                    backgroundColor: '#ffeb3b', // Yellow color
                    color: '#000',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffDetails();
    }, []);

    // Format the date and time for the backend
    const formatDateTime = (date, hour, minute, ampm) => {
        if (!date) return null;

        let hours = parseInt(hour || 0);
        const minutes = parseInt(minute || 0);

        // Convert 12-hour format to 24-hour format
        if (ampm === 'PM' && hours < 12) {
            hours += 12;
        } else if (ampm === 'AM' && hours === 12) {
            hours = 0;
        }

        const formattedDate = new Date(date);
        formattedDate.setHours(hours, minutes, 0, 0);

        return formattedDate.toISOString();
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
            console.log('Original file size:', fileSizeInKB.toFixed(2), 'KB');
            if (fileSizeInKB <= maxFileSizeInKB) {
                setImagePreviews(URL.createObjectURL(file));
                setValue("imageUrl", file);
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
                    setValue("imageUrl", compressedFile);
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
            setValue("imageUrl", croppedFile);

        } catch (error) {
            console.error("Error while cropping the image: ", error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSendTypeChange = (type) => {
        setSendType(type);
        if (type === 'now') {
            // Keep the current status when switching to "now"
            // Don't change the "activity" field
        } else {
            // If switching to schedule mode, set activity to "scheduled"
            setValue("activity", "scheduled");
            setSends('scheduled');
        }
    };

    // Handle status change
    const handleStatusChange = (e) => {
        const value = e.target.value;
        setSends(value);

        // If status is changed to "scheduled", also update the sendType
        if (value === 'scheduled') {
            setSendType('schedule');
        } else if (sendType === 'schedule') {
            // If changing from "scheduled" to something else, reset to "now"
            setSendType('now');
        }
    };
    const onSubmit = async (data) => {
        // If scheduled, format the date and time
        if (sendType === 'schedule') {
            const formattedDateTime = formatDateTime(
                data.scheduleDate,
                data.scheduleHour,
                data.scheduleMinute,
                data.scheduleAmPm
            );

            if (formattedDateTime) {
                // Set the formatted date time string to a single field
                setValue("scheduleTime", formattedDateTime);
                data.scheduleTime = formattedDateTime;
            }
            console.log('formattedDateTime: ', formattedDateTime);
        }

        console.log(data, "data");
        try {
            const response = await axios.put(`${baseUrl}/update/banner/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            console.log(response.data, "response");
            if (response.data.success) {
                toast.success(response.data.message || "Banner updated successfully!", {
                    position: "top-right",
                    autoClose: 1000,
                    theme: "colored",
                    style: {
                        backgroundColor: '#ffeb3b', // Yellow color
                        color: '#000',
                    },
                });
                reset();
                setTimeout(() => {
                    navigate('/AllBanners');
                }, 1000);
            }
        } catch (error) {
            console.error("Error details:", error.response ? error.response.data : error);
            toast.error(error.response?.data?.message || "Failed to update the banner. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
                style: {
                    backgroundColor: '#ffeb3b', // Yellow color
                    color: '#000',
                },
            });
        }
    }
    return (
        <div className="container-fluid">
            <div className="row">
                {/* Main Content */}
                <div className="col-md-12 main-content">
                    <div className="form-container">
                        <button
                            className='edit-btn mb-4 fs-6'
                            onClick={() => navigate('/AllBanners')}
                        >
                            Back
                        </button>
                        <h1 className="form-title">Edit Banner</h1>

                        {/* Loading Indicator */}
                        {loading ? (
                            <div className="loader-container d-flex justify-content-center">
                                <div className="loader"></div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="row">
                                    {/* Image Upload Section */}
                                    <div className="col-md-11 ">
                                        <label className="form-label mb-3 ms-4">Image:</label>
                                        <div className="image-upload shadow ms-4 w-100 mb-4">
                                            <div className="upload-icon">
                                                <GrUploadOption className="arrow-up" />
                                            </div>
                                            {imagePreviews ? (
                                                <>
                                                    <div className="image-preview-container mt-3">
                                                        <img
                                                            src={imagePreviews}
                                                            alt="Uploaded Preview"
                                                            className="img-thumbnail cursor-pointer "
                                                            style={{ width: "925px", height: "264px" }}
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
                                                {...register("imageUrl")}
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

                                        {/* Target Field */}
                                        <div className="mb-4 ms-4">
                                            <label className="form-label">Target Link:</label>
                                            <input
                                                type="url"
                                                {...register("targetLink")}
                                                className="form-control shadow"
                                                placeholder="Add a Target Link Here..."
                                            />
                                        </div>
                                    </div>

                                    {/* Status Dropdown - Kept as requested */}
                                    <div className="col-md-11 ms-4 mb-4  d-flex  gap-5">
                                        <div className=''>
                                            <label className="form-label">Status:</label>
                                            <select
                                                {...register("activity")}
                                                className="form-select form-control shadow"
                                                style={{
                                                    width: '400px',
                                                    color: sends === "" ? '#8DA9C4' : 'inherit'
                                                }}
                                                value={sends}
                                                onChange={handleStatusChange}
                                            >
                                                <option value="" className="default-option">Select Any One</option>
                                                {send.map((status) => (
                                                    <option key={status} className='text-dark' value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Send Time Options */}
                                        <div className="  mb-2">
                                            <label className="form-label">Send Time:</label>
                                            <div className="d-flex gap-3">
                                                <button
                                                    type="button"
                                                    className={`btn ${sendType === 'now' ? 'Send-time' : 'edit-btn'}`}
                                                    onClick={() => handleSendTypeChange('now')}
                                                >
                                                    Now
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn ${sendType === 'schedule' ? 'Send-time' : 'edit-btn'}`}
                                                    onClick={() => handleSendTypeChange('schedule')}
                                                >
                                                    Schedule
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule Fields - Show only when Schedule is selected */}
                                    {sendType === 'schedule' && (
                                        <div className="col-md-11 ms-4  schedule-container ">
                                            <div className=" p-1 bg-transparent border-none">
                                                <h5 className="mb-3">Schedule Details</h5>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Date:</label>
                                                        <input
                                                            type="date"
                                                            {...register("scheduleDate")}
                                                            className="form-control"
                                                            min={new Date().toISOString().split('T')[0]}
                                                            required={sendType === 'schedule'}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 ">
                                                        <label className="form-label"> Time:</label>
                                                        <div className="d-flex gap-2">
                                                            {/* Hour */}
                                                            <select
                                                                {...register("scheduleHour")}
                                                                className="form-select bg-transparent "
                                                                style={{ border: '2px solid #0B2545', borderRadius: '30px' }}
                                                                required={sendType === 'schedule'}
                                                            >
                                                                <option value="">Hour</option>
                                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                                                                    <option key={hour} value={hour}>
                                                                        {hour.toString().padStart(2, '0')}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {/* Minute */}
                                                            <select
                                                                {...register("scheduleMinute")}
                                                                className="form-select bg-transparent"
                                                                style={{ border: '2px solid #0B2545', borderRadius: '30px' }}
                                                                required={sendType === 'schedule'}
                                                            >
                                                                <option value="">Min</option>
                                                                {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                                                                    <option key={minute} value={minute}>
                                                                        {minute.toString().padStart(2, '0')}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {/* AM/PM */}
                                                            <select
                                                                {...register("scheduleAmPm")}
                                                                className="form-select bg-transparent"
                                                                style={{ border: '2px solid #0B2545', borderRadius: '30px' }}
                                                                required={sendType === 'schedule'}
                                                            >
                                                                <option value="AM">AM</option>
                                                                <option value="PM">PM</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Hidden field to store the formatted date+time */}
                                                <input
                                                    type="hidden"
                                                    {...register("scheduleTime")}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Button Section */}
                                    <div className="mt-4 ms-4">
                                        <button
                                            type="submit"
                                            className="submit-btn rounded-pill"
                                            style={{
                                                textTransform: "uppercase"
                                            }}
                                        >
                                            Update Banner
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default EditBanners