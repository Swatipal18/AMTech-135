import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { GrUploadOption, GrClose } from "react-icons/gr";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { FaArrowRotateRight } from "react-icons/fa6";
import { GoPlusCircle } from "react-icons/go";
import { FiMinusCircle } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import imageCompression from 'browser-image-compression';
function NewNotification() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [imageList, setImageList] = useState([]);
    const [imageError, setImageError] = useState('');
    const { register, handleSubmit, setValue, watch } = useForm();
    const [sends, setSends] = useState('');
    const [imageSelected, setImageSelected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const navigate = useNavigate();
    const send = ['All Users', 'Personal', 'Business', 'Delivery Boy'];
    const watchImages = watch("images");

    const handleImageChange = async (event) => {
        const files = Array.from(event.target.files);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxFileSizeInKB = 10240; // 10 MB
        const newImages = [];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setImageError('Only image files (JPG, PNG) are allowed!');
                continue;
            }

            const fileSizeInKB = file.size / 1024;
            if (fileSizeInKB <= maxFileSizeInKB) {
                newImages.push({
                    file: file,
                    preview: URL.createObjectURL(file)
                });
            } else {
                try {
                    const options = {
                        maxSizeMB: 10,
                        maxWidthOrHeight: 1024,
                        useWebWorker: true,
                    };

                    const compressedFile = await imageCompression(file, options);
                    const compressedFileSizeInKB = compressedFile.size / 1024;

                    if (compressedFileSizeInKB > maxFileSizeInKB) {
                        setImageError('Compressed file size should not exceed 10 MB.');
                        continue;
                    }

                    newImages.push({
                        file: compressedFile,
                        preview: URL.createObjectURL(compressedFile)
                    });
                } catch (error) {
                    console.error('Error during image compression:', error);
                    setImageError('Error while compressing image.');
                }
            }
        }

        // Update imageList state with all new images
        setImageList(prev => [...prev, ...newImages]);
        setImageSelected(true);
        setImageError('');

        // Update form value with all files (existing + new)
        const allFiles = [...(watchImages || []), ...newImages.map(img => img.file)];
        setValue("images", allFiles);
    };

    const removeImage = (index) => {
        setImageList(prev => {
            const newList = prev.filter((_, i) => i !== index);
            // Update form value with remaining files
            setValue("images", newList.map(img => img.file));
            return newList;
        });

        if (imageList.length === 1) {
            setImageSelected(false);
        }
    };


    const openImageEditor = (index) => {
        setCurrentImageIndex(index);
        setIsModalOpen(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    // Function to handle crop completion
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Function to update the image preview after editing
    const updateImagePreview = async () => {
        try {
            if (!croppedAreaPixels) return;

            const croppedImage = await applyCropZoomRotation(
                imageList[currentImageIndex].preview,
                croppedAreaPixels,
                rotation
            );

            // Create a new file from the cropped image
            const response = await fetch(croppedImage);
            const blob = await response.blob();
            const fileName = imageList[currentImageIndex].file.name;
            const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });

            // Update the image list with the new cropped image
            setImageList(prev => {
                const newList = [...prev];
                newList[currentImageIndex] = {
                    file: croppedFile,
                    preview: croppedImage
                };
                return newList;
            });

            // Update the form value with the new files
            const allFiles = imageList.map((img, i) =>
                i === currentImageIndex ? croppedFile : img.file
            );
            setValue("images", allFiles);

        } catch (error) {
            console.error('Error updating image preview:', error);
        }
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentImageIndex(null);
    };
    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.src = url;
        });

    // In your utils/getCroppedImg.js file:
    const applyCropZoomRotation = async (imageSrc, pixelCrop, rotation = 0) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        // set dimensions to double largest dimension to allow for rotation
        canvas.width = safeArea;
        canvas.height = safeArea;

        // translate canvas center to image center
        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        // draw image in center of canvas
        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        // extract cropped image
        const data = ctx.getImageData(
            safeArea / 2 - (pixelCrop.width / 2),
            safeArea / 2 - (pixelCrop.height / 2),
            pixelCrop.width,
            pixelCrop.height
        );

        // set canvas width to final desired crop size
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // place image data in the new canvas
        ctx.putImageData(data, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(URL.createObjectURL(blob));
            }, 'image/jpeg');
        });
    };
    const onSubmit = async (data) => {
        const formData = new FormData();
        if (data.images) {
            data.images.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });
        }
        console.log(data, "data");
        console.log(formData, "formData");
        // const response = await axios.post(`${baseUrl}/menu/create`, data, {
        //     headers: {
        //         "Content-Type": "multipart/form-data"
        //     }
        // });

        // if (response.data.success) {
        //     toast.success(response.data.message || "Item added successfully!", {
        //         position: "top-right",
        //         autoClose: 1000,
        //         theme: "colored",
        //         style: {
        //             backgroundColor: 'green',
        //             color: '#000',
        //         },
        //     });
        //     reset();

        //     // Handle form submission
        // };
    }


    return (
        <div className="container-fluid">
            <div className="row">
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
                                            className="form-control shadow text-capitalize"
                                            placeholder="Add A Title Here"
                                        />

                                    </div>

                                    {/* Description Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Message :</label>
                                        <textarea
                                            {...register("description")}
                                            className="form-control shadow text-capitalize"
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

                                    {/* Target Field */}
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
                                    <div className="mb-4">
                                        <label className="form-label">Send To :</label>
                                        <select
                                            {...register("Sends")}
                                            className="form-select form-control shadow text-capitalize"
                                            style={{
                                                width: '400px',
                                                color: sends === "" ? '#8DA9C4' : 'inherit'
                                            }}
                                            value={sends}
                                            onChange={(e) => setSends(e.target.value)}
                                        >
                                            <option value="" className="default-option">Select User To Send</option>
                                            {send.map((option) => (
                                                <option key={option} className='text-dark' value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Image Upload Section */}
                                <div className="col-md-4">
                                    <label className="form-label mb-3 ms-4">Images:</label>
                                    <div className="image-upload shadow ms-4">
                                        <div className="upload-icon">
                                            <GrUploadOption className="arrow-up" />
                                        </div>

                                        {/* Image previews */}
                                        <div className="image-preview-container  mt-3">
                                            {imageList.length > 0 && (
                                                <>
                                                    <div className="featured-image">
                                                        <div className="image-preview-item position-relative">
                                                            <img
                                                                src={imageList[0].preview}
                                                                alt={`Preview 1`}
                                                                className="img-thumbnail cursor-pointer img-fluid"
                                                                onClick={() => openImageEditor(0)}
                                                            />
                                                            <h5 className='mt-2'>Main Image</h5>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm position-absolute  remove-button"
                                                                onClick={() => removeImage(0)}
                                                            >
                                                                <MdDelete />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {imageList.length > 1 && (
                                                        <div className="remaining-images">
                                                            {imageList.slice(1).map((image, index) => (
                                                                <div key={index + 1} className="image-preview-item position-relative">
                                                                    <img
                                                                        src={image.preview}
                                                                        alt={`Preview ${index + 2}`}
                                                                        className="img-thumbnail cursor-pointer img-fluid"
                                                                        onClick={() => openImageEditor(index + 1)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-danger btn-sm position-absolute remove-button"
                                                                        onClick={() => removeImage(index + 1)}
                                                                    >
                                                                        <MdDelete />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="edit-btn mt-3 w-50"
                                                        onClick={() => document.getElementById("fileInput").click()}
                                                    >
                                                        Add More Images
                                                    </button>

                                                    <div className="mt-2 text-muted text-center">
                                                        {imageList.length} image{imageList.length > 1 ? 's' : ''} selected
                                                    </div>
                                                </>
                                            )}

                                            {imageList.length === 0 && (
                                                <>
                                                    <div className="upload-text fs-5">Upload Multiple Images Here</div>
                                                    <div className="upload-subtext fs-6">
                                                        (Jpg, png files supported only)
                                                        <br />
                                                        (Max File Size 10 MB per image)
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="edit-btn mt-4 w-50 fs-6"
                                                        onClick={() => document.getElementById("fileInput").click()}
                                                    >
                                                        Select Images
                                                    </button>
                                                </>
                                            )}


                                            <input
                                                type="file"
                                                className="form-control d-none"
                                                id="fileInput"
                                                multiple
                                                accept="image/jpeg,image/png,image/jpg"
                                                {...register("images")}
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                        {imageError && <div className="text-danger mt-2">{imageError}</div>}
                                    </div>

                                    {/* Image Editing Modal */}
                                    {isModalOpen && currentImageIndex !== null && (
                                        <div
                                            className="modal-overlay"
                                            onClick={(e) => {
                                                if (e.target === e.currentTarget) {
                                                    closeModal();
                                                }
                                            }}
                                        >
                                            <div className="modal-div" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={closeModal}
                                                    className="close-button"
                                                >
                                                    <GrClose />
                                                </button>
                                                <Cropper
                                                    image={imageList[currentImageIndex].preview}
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
                                                    <div className="control-group d-flex align-items-center pt-1 rounded-pill ps-2 zoom-icon" style={{ width: "180px", fontSize: "15px" }}>
                                                        <label className="form-labels me-2">Zoom</label>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm border-0"
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
                                                    <div className="control-group d-flex align-items-center pt-1 rounded-pill ps-3 zoom-icon" style={{ width: "130px", fontSize: "15px" }}>
                                                        <label className="form-labels">Rotation</label>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm mx-2 border-0"
                                                            onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                                        >
                                                            <FaArrowRotateRight style={{ color: "#000080", fontSize: "17px" }} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        style={{ fontSize: "15px" }}
                                                        className="edit-btn "
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


                                </div>
                                {/* Submit buttons */}
                                <div className="mt-4">
                                    <button type="submit" className="submit-btn ms-3 rounded-pill"
                                        style={{
                                            textTransform: "uppercase"
                                        }}
                                    >Send Notification</button>
                                    <button type="submit" className="submit-btn  rounded-pill "
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