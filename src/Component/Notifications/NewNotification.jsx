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

function NewNotification() {
    const [imagePreviews, setImagePreviews] = useState("");
    const [imageError, setImageError] = useState('');
    const { register, handleSubmit, reset } = useForm();
    const [sends, setSends] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const send = ['All Users', 'Personal', 'Business', 'Delivery Boy'];
    const [imageSelected, setImageSelected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const navigate = useNavigate();
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

        } catch (error) {
            console.error("Error while cropping the image: ", error);
        }
    };
    const closeModal = () => {
        setIsModalOpen(false);
    }; const onSubmit = async (data) => {
        console.log(data);
    }
    return (
        <div className="container-fluid">
            <div className="row">
                {/* Main Content */}
                <div className="col-md-12 main-content">
                    <div className="form-container">
                        <h1 className="form-title">Send A New Notification</h1>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="row">
                                <div className="col-md-8">
                                    {/* Name Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Title:</label>
                                        <input
                                            type="text"
                                            {...register("username")}
                                            className="form-control shadow"
                                            placeholder="Add A Title Here"
                                        />
                                    </div>

                                    {/* Description Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Message :</label>
                                        <textarea
                                            {...register("description")}
                                            className="form-control shadow"
                                            rows="8"
                                            style={{
                                                resize: 'none',
                                                overflowY: 'auto',
                                                scrollbarWidth: 'none',
                                                msOverflowStyle: 'none'
                                            }}
                                            placeholder="Write A Message Here..."
                                        />
                                    </div>
                                    {/* Email Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Target Link :</label>
                                        <input
                                            type="url"
                                            {...register("url")}
                                            className="form-control shadow"
                                            placeholder="Add a Target Link Here..."
                                        />
                                    </div>
                                    {/* Sends */}
                                    <label className="form-label">Send To :</label>
                                    <select
                                        {...register("Sends")}
                                        className="form-select form-control shadow"
                                        style={{
                                            width: '400px',
                                            color: sends === "" ? '#8DA9C4 ' : 'inherit'  // Red when empty
                                        }}
                                        value={sends}
                                        onChange={(e) => setSends(e.target.value)}
                                    >
                                        <option value="" className="default-option">Select User To Send</option>
                                        {send.map((sends) => (
                                            <option key={sends} className='text-dark' value={sends}>
                                                {sends}
                                            </option>
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
                                    <button type="submit" className="submit-btn ms-3 rounded-pill"
                                        style={{
                                            textTransform: "uppercase"
                                        }}
                                    >Send Notification</button>
                                    <button type="button" className="submit-btn  rounded-pill "
                                        style={{
                                            backgroundColor: "#8DA9C4",
                                            color: "#0B2545",
                                            textTransform: "uppercase"
                                        }}
                                    >SCHEDULE</button>

                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewNotification