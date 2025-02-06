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

function EditStaff() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const { register, handleSubmit, reset, setValue } = useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('');
    const [imagePreviews, setImagePreviews] = useState("");
    const [imageError, setImageError] = useState('');
    const [imageSelected, setImageSelected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [loading, setLoading] = useState(true);


    const roleMapping = {
        "Staff Member": 1,
        "Kitchen Member": 2,
        "Store Manager": 3,
        "Delivery Boy": 4,
    };
    const roles = ['Delivery Boy', 'Staff Member', 'Store Manager', 'Kitchen Member'];

    const fetchStaffDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/store/details/${id}`);
            const staffData = response.data.data;
            if (staffData.role) {
                staffData.role = roles[staffData.role - 1]; 
            }

            reset(staffData); // Reset the form with the fetched data

            // If image URL exists, set the preview image
            if (staffData.image) {
                setImagePreviews(staffData.image); // Assuming 'image' is the URL in your response
            }

        } catch (err) {
            console.error("Error fetching staff details:", err);
            toast.error("Failed to load staff details. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffDetails();
    }, []);

    const submitData = async (data) => {
        try {
            const formData = new FormData();

            formData.append('username', data.username);
            formData.append('contact', data.contact);
            formData.append('email', data.email);
            formData.append('address', data.address);
            formData.append('role', roleMapping[data.role]);

            if (data.images) {
                formData.append('images', data.images);
            }

            setLoading(true);
            await axios.put(`${baseUrl}/store/update/${id}`, formData);
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
                navigate('/AllStaff');
            }, 1000);
        } catch (err) {
            console.error("Error updating staff:", err);
            toast.error("Failed to update staff details. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12 main-content">
                    <div className="form-container">
                        <button className='edit-btn mb-4' onClick={() => {
                            console.log("Back Button Clicked"),
                                navigate('/AllStaff')
                        }}>back</button>

                        <h1 className="form-title">Edit Staff</h1>
                        <form onSubmit={handleSubmit(submitData)}>
                            <div className="row">
                                <div className="col-md-8">
                                    {/* Name Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Name:</label>
                                        <input
                                            type="text"
                                            {...register("username")}
                                            className="form-control shadow"
                                            placeholder="e.g. Full Name"
                                        />
                                    </div>

                                    {/* Mobile Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Mobile Number:</label>
                                        <input
                                            type="number"
                                            {...register("contact")}
                                            className="form-control shadow no-spinner"
                                            placeholder="e.g. +91 1234567890"
                                        />
                                    </div>

                                    {/* Email Field */}
                                    <div className="mb-4">
                                        <label className="form-label">E-Mail Address:</label>
                                        <input
                                            type="email"
                                            {...register("email")}
                                            className="form-control shadow"
                                            placeholder="e.g. ABCD@example.com"
                                        />
                                    </div>

                                    {/* Full Address */}
                                    <div className="mb-4">
                                        <label className="form-label">Full Address:</label>
                                        <input
                                            type="text"
                                            {...register("address")}
                                            className="form-control shadow"
                                            placeholder="Full Address"
                                        />
                                    </div>

                                    {/* Role */}
                                    <label className="form-label">Role :</label>
                                    <select
                                        {...register("role")}
                                        className="form-select form-control shadow"
                                        style={{
                                            marginLeft: '10px',
                                            width: '400px',
                                            color: selectedRole === "" ? '#8DA9C4 ' : 'inherit'
                                        }}
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map(role => (
                                            <option key={role} value={role} className='text-dark'>{role}</option>
                                        ))}
                                    </select>
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

                                {/* Button Section */}
                                <div className="mt-4">
                                    <button type="submit" className="submit-btn">UPDATE STAFF</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditStaff;
