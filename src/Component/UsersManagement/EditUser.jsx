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

function EditUser() {
    const { id } = useParams();
    const baseUrl = import.meta.env.VITE_API_URL;
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('');
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [imagePreviews, setImagePreviews] = useState("");
    const [imageError, setImageError] = useState('');
    const [imageSelected, setImageSelected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchItemDetails = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin-business/details/${id}`);
            const data = response.data.data;

            if (data.businessUser) {
                setUserType('business');
                reset({
                    ...data.businessUser,
                    images: data.businessUser.images || null,
                });
                if (data.businessUser.images) {
                    setImagePreviews(data.businessUser.images);
                }
            } else if (data.normalUser) {
                setUserType('personal');
                const fullName = `${data.normalUser.firstName} ${data.normalUser.lastName}`.trim();
                reset({
                    ...data.normalUser,
                    username: fullName,  
                    images: data.normalUser.images || null,
                });
                if (data.normalUser.images) {
                    setImagePreviews(data.normalUser.images);
                }
            }
        } catch (err) {
            console.error("Error fetching User details:", err);
            setError("Failed to load User details. Please try again.");
            toast.error("Failed to load User details. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const onSubmit = async (data) => {
        try {
            if (userType === 'personal') {
                const nameParts = data.username.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || '';
                formData.append('firstName', firstName);
                formData.append('lastName', lastName);
                formData.append('contact', data.contact);
                formData.append('address', data.address);
                if (data.images) {
                    formData.append('images', data.images);
                }
            } else {
                Object.keys(data).forEach(key => {
                    formData.append(key, data[key]);
                });
            }

            formData.append('type', userType);

            const response = await axios.put(
                `${baseUrl}/admin-business/update/${id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            if (response.data.success) {
                toast.success("User updated successfully!");
                setTimeout(() => {
                    navigate('/Users');
                }, 1000);
            }
        } catch (error) {
            console.error("Error details:", error);
            toast.error(error.response?.data?.message || "Failed to update user.");
        }
    };

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

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

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12 main-content">
                    <div className="form-container">
                        <button className='edit-btn mb-4 fs-6' onClick={() => navigate('/Users')}>
                            Back
                        </button>

                        <h1 className="form-title">Edit User</h1>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="row">
                                <div className="col-md-8">
                                    {/* Type Display (read-only) */}
                                    <div className="mb-4">
                                        <label className="form-label">Type:</label>
                                        <input
                                            type="text"
                                            className="form-control shadow w-25"
                                            value={userType === 'business' ? 'Business' : 'Personal'}
                                            readOnly
                                        />
                                    </div>

                                    {/* Business Fields */}
                                    {userType === 'business' && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label">Business Name:</label>
                                                <input
                                                    type="text"
                                                    className="form-control text-capitalize"
                                                    {...register('businessName')}
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Owner Name:</label>
                                                <input
                                                    type="text"
                                                    className="form-control text-capitalize" 
                                                    {...register('ownerName')}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Personal Fields */}
                                    {userType === 'personal' && (
                                        <div className="mb-3">
                                            <label className="form-label">Full Name:</label>
                                            <input
                                                type="text"
                                                className="form-control text-capitalize"
                                                {...register('username')}
                                            />
                                        </div>
                                    )}

                                    {/* Common Fields */}
                                    <div className='d-flex d-inline'>
                                        <div className="mb-4 w-50">
                                            <label className="form-label">Mobile Number:</label>
                                            <input
                                                type='number'
                                                {...register("contact")}
                                                className="form-control shadow no-spinner"
                                            />
                                        </div>

                                        <div className="mb-4 w-50 ms-3">
                                            <label className="form-label">E-Mail Address:</label>
                                            <input
                                                type="email"
                                                {...register("email")}
                                                className="form-control shadow"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Full Address:</label>
                                        <input
                                            type="text"
                                            {...register("address")}
                                            className="form-control shadow text-capitalize"
                                        />
                                    </div>

                                    {/* Business-only Fields */}
                                    {userType === 'business' && (
                                        <div className='d-flex d-inline'>
                                            <div className="mb-4 w-25">
                                                <label className="form-label">Business Type:</label>
                                                <select
                                                    className="form-select form-control shadow"
                                                    {...register('buninessType')}
                                                >
                                                    <option value="">Select Any One</option>
                                                    <option value="pvt-limited">Pvt limited</option>
                                                    <option value="partnership">Partnership</option>
                                                    <option value="llp">LLP</option>
                                                </select>
                                            </div>
                                            <div className="mb-4 w-25 ms-3">
                                                <label className="form-label">Occupant Type:</label>
                                                <select
                                                    className="form-select form-control shadow"
                                                    {...register('ocupant')}
                                                >
                                                    <option value="">Select Any One</option>
                                                    <option value="owner">Owner</option>
                                                    <option value="residential">Residential</option>
                                                </select>
                                            </div>
                                            <div className="mb-4 w-25 ms-3">
                                                <label className="form-label">GST Number:</label>
                                                <input
                                                    type="text"
                                                    {...register("gst")}
                                                    className="form-control shadow"
                                                />
                                            </div>
                                        </div>
                                    )}
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

                                <div className="mt-4">
                                    <button type="submit" className="submit-btn">UPDATE USER</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default EditUser;