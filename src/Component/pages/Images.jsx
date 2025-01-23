import React, { useState } from 'react';
import { GrUploadOption } from 'react-icons/gr';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Images() {
    // console.log("Images");
    const { register, setValue } = useForm();
    const [imagePreviews, setImagePreviews] = useState("");
    const [imageError, setImageError] = useState('');

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


            const reader = new FileReader();
            reader.onloadend = () => {
                const binaryString = reader.result;
                // setImagePreviews(binaryString);
                // setValue("images", binaryString);
                setImageError('');
            };
            reader.onerror = () => {
                setImageError('Error reading file');
            };
            reader.readAsDataURL(file);
        }
    };
    return (
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
    );
}

export default Images;
