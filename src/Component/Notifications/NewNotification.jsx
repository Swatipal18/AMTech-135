import axios from 'axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { GrUploadOption } from "react-icons/gr";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function NewNotification() {
    const [imagePreviews, setImagePreviews] = useState("");
    const [imageError, setImageError] = useState('');
    const { register, handleSubmit, reset } = useForm();
    const [sends, setSends] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const send = ['All Users', 'Personal', 'Business', 'Delivery Boy'];
    const navigate = useNavigate();
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (file) {
            if (!allowedTypes.includes(file.type)) {
                setImageError('Only image files (JPG, PNG) are allowed!');
                setImagePreviews(null);
                return;
            }

            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 10) {
                setImageError('File size should not exceed 10 MB.');
                setImagePreviews(null);
                return;
            }
            setImagePreviews(URL.createObjectURL(file));
            setValue("images", file);
            console.log(file, "file");
            setImageError('');
        }
    };
    const onSubmit = async (data) => {
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
                                            <img
                                                src={imagePreviews}
                                                alt="Uploaded Preview"
                                                className="img-thumbnail"
                                                style={{ maxWidth: "100%", height: "auto" }}
                                            />
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