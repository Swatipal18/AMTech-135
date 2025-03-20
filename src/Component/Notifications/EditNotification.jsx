import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { GrUploadOption, GrClose } from "react-icons/gr";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import Cropper from "react-easy-crop";
import { FaArrowRotateRight } from "react-icons/fa6";
import { GoPlusCircle } from "react-icons/go";
import { FiMinusCircle } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import imageCompression from "browser-image-compression";
function EditNotification() {
    const baseUrl = import.meta.env.VITE_API_URL;
    const [imageList, setImageList] = useState([]);
    const [imageError, setImageError] = useState("");
    const { register, handleSubmit, setValue, watch } = useForm();
    const [sends, setSends] = useState("");
    const [imageSelected, setImageSelected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [scheduledDate, setScheduledDate] = useState("");
    console.log('scheduledDate: ', scheduledDate);
    const [hour, setHour] = useState("");
    console.log('hour: ', hour);
    const [minutes, setMinutes] = useState("");
    console.log('minutes: ', minutes);
    const [period, setPeriod] = useState("AM");
    console.log('period: ', period);

    const { id } = useParams();
    console.log('id: ', id);
    //   const send = {["all", "Personal", "Business", "Delivery Boy"]};
    const send = [{ name: "all", num: "all" }, { name: "Personal", num: 1 }, { name: "Business", num: 0 }, { name: "Delivery Boy", num: 4 }];
    const watchImages = watch("images");
    const [activeButton, setActiveButton] = useState("not-schedule");



    // useEffect(() => {
    //   if (id) {
    //     // Fetch the existing notification data
    //     const fetchNotification = async () => {
    //       try {
    //         const response = await axios.get(`${baseUrl}/notifications/${id}`);
    //         if (response.data.success) {

    //           const notificationData = response.data.data;
    //           console.log('notificationData: ', notificationData);
    //           setImageList(notificationData.images[0]);
    //           setValue("title", notificationData.title);
    //           setValue("body", notificationData.body);
    //           setValue("userType", notificationData.userType);
    //           console.log('notificationData.userType: ', notificationData.userType);
    //           setValue("link", notificationData.link);
    //           if (notificationData.images && notificationData.images.length > 0) {
    //             const imageUrl = notificationData.images[0]; // Get first image URL

    //             // Convert the image URL into an object expected by your image field
    //             const imageObject = { file: null, preview: imageUrl }; 

    //             setValue("images", imageObject); // Set image field
    //           }

    //           // setValue("images", notificationData.images[0]);
    //           setScheduledDate(notificationData.scheduleDateTime ? new Date(notificationData.scheduleDateTime).toISOString().split("T")[0] : "");
    //           setHour(notificationData.scheduleDateTime ? new Date(notificationData.scheduleDateTime).getHours() : "");
    //           setMinutes(notificationData.scheduleDateTime ? new Date(notificationData.scheduleDateTime).getMinutes() : "");            
    //           setActiveButton(notificationData.isScheduled || "not-schedule");
    //         }
    //       } catch (error) {
    //         console.error("Error fetching notification data:", error);
    //       }
    //     };

    //     fetchNotification();
    //   }
    // }, [id, setValue]); 

    useEffect(() => {
        if (id) {
            const fetchNotification = async () => {
                try {
                    const response = await axios.get(`${baseUrl}/notifications/${id}`);
                    if (response.data.success) {
                        const notificationData = response.data.data;
                        // Set form fields
                        setValue("title", notificationData.title);
                        setValue("body", notificationData.body);
                        setValue("userType", notificationData.userType);
                        console.log('notificationData.userType: ', notificationData.userType);
                        setValue("link", notificationData.link);
                        // Set image list properly (store as an array)
                        setScheduledDate(notificationData.scheduleDateTime ? new Date(notificationData.scheduleDateTime).toISOString().split("T")[0] : "");
                        setHour(notificationData.scheduleDateTime ? new Date(notificationData.scheduleDateTime).getHours() : "");
                        setMinutes(notificationData.scheduleDateTime ? new Date(notificationData.scheduleDateTime).getMinutes() : "");
                        if (notificationData.images && notificationData.images.length > 0) {
                            setImageList(notificationData.images); // Set all images
                        }
                        // Set scheduled date and time

                        setActiveButton(notificationData.isScheduled || "not-schedule");
                    }
                } catch (error) {
                    console.error("Error fetching notification data:", error);
                }
            };

            fetchNotification();
        }
    }, [id, setValue]);


    console.log('activeButton: ', activeButton);
    const handleImageChange = async (event) => {
        const files = Array.from(event.target.files);
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        const maxFileSizeInKB = 10240; // 10 MB
        const newImages = [];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setImageError("Only image files (JPG, PNG) are allowed!");
                continue;
            }

            const fileSizeInKB = file.size / 1024;
            if (fileSizeInKB <= maxFileSizeInKB) {
                newImages.push({
                    file: file,
                    preview: URL.createObjectURL(file),
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
                        setImageError("Compressed file size should not exceed 10 MB.");
                        continue;
                    }

                    newImages.push({
                        file: compressedFile,
                        preview: URL.createObjectURL(compressedFile),
                    });
                } catch (error) {
                    console.error("Error during image compression:", error);
                    setImageError("Error while compressing image.");
                }
            }
        }

        // Update imageList state with all new images
        setImageList((prev) => [...prev, ...newImages]);
        setImageSelected(true);
        setImageError("");

        // Update form value with all files (existing + new)
        const allFiles = [
            ...(watchImages || []),
            ...newImages.map((img) => img.file),
        ];
        setValue("images", allFiles);
    };

    const removeImage = (index) => {
        setImageList((prev) => {
            const newList = prev.filter((_, i) => i !== index);
            // Update form value with remaining files
            setValue(
                "images",
                newList.map((img) => img.file)
            );
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
            const croppedFile = new File([blob], fileName, { type: "image/jpeg" });

            // Update the image list with the new cropped image
            setImageList((prev) => {
                const newList = [...prev];
                newList[currentImageIndex] = {
                    file: croppedFile,
                    preview: croppedImage,
                };
                return newList;
            });

            // Update the form value with the new files
            const allFiles = imageList.map((img, i) =>
                i === currentImageIndex ? croppedFile : img.file
            );
            setValue("images", allFiles);
        } catch (error) {
            console.error("Error updating image preview:", error);
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
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.src = url;
        });

    // In your utils/getCroppedImg.js file:
    const applyCropZoomRotation = async (imageSrc, pixelCrop, rotation = 0) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

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
            safeArea / 2 - pixelCrop.width / 2,
            safeArea / 2 - pixelCrop.height / 2,
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
            }, "image/jpeg");
        });
    };

    const formatDateToISO = () => {
        if (!scheduledDate || !hour || !minutes) return "";
        let formattedHour = parseInt(hour, 10);
        if (period === "PM" && formattedHour !== 12) {
            formattedHour += 12;
        } else if (period === "AM" && formattedHour === 12) {
            formattedHour = 0;
        }
        const date = new Date(`${scheduledDate}T${String(formattedHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00.000Z`);
        return date.toISOString();
    };

    // const onSubmit = async (data) => {
    //   const formData = new FormData();
    //   // if (data.images) {
    //   //   data.images.forEach((file, index) => {
    //   //     formData.append(`images[${index}]`, file);
    //   //   });
    //   // }
    //   // let main = {...data, scheduleDateTime: formatDateToISO() , isScheduled :activeButton}
    //   let main = {
    //       ...data,
    //       isScheduled: activeButton,
    //       ...(activeButton !== "not-schedule" && {scheduleDateTime: formatDateToISO() }),
    //     };

    //   const response = await axios.put(`${baseUrl}/notifications/${id}`, main );
    //   console.log({ ...data, scheduleDateTime: formatDateToISO() , isScheduled :activeButton});
    //   console.log('response: ', response);
    //   if (response.data.success) {
    //       toast.success(response.data.message || "Item added successfully!", {
    //           position: "top-right",
    //           autoClose: 1000,
    //           theme: "colored",
    //           style: {
    //               backgroundColor: 'green',
    //               color: '#000',
    //           },
    //       });
    //      await reset();
    //   };
    // };

    const onSubmit = async (data) => {
        console.log('data: ', data);
        const formData = new FormData();
        // data.images.forEach((file, index) => {
        //   if (file) {
        //     formData.append(`images[${index}]`, file);
        //   }
        // });

        // let main = {
        //   ...data,
        //   isScheduled: activeButton,
        //   ...(activeButton !== "not-schedule" && { scheduleDateTime: formatDateToISO() }),
        //   id, 
        // };
        // if (
        //   data.images &&
        //   data.images.length > 0 &&
        //   data.images[0] instanceof File
        // ) {
        //   // delete main.images; // Remove `images` key to avoid array issue
        //   main.images = data.images[0]; // Send single file instead of array
        // }
        // console.log("main: ", main);
        // try {
        //   const response = await axios.put(`${baseUrl}/notifications/${id}`, main ,{
        //     headers: { "Content-Type": "multipart/form-data" },
        //   });
        //   console.log('response: ', response);
        //   if (response.data.success) {
        //     toast.success(response.data.message || "Notification updated successfully!", {
        //       position: "top-right",
        //       autoClose: 1000,
        //       theme: "colored",
        //       style: { backgroundColor: 'green', color: '#000' },
        //     });

        //     reset(); // Reset form after successful update
        //   }
        // } catch (error) {
        //   console.error("Error updating notification:", error);
        // }
    };


    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12 main-content">
                    <div className="form-container">
                        <h1 className="form-title">Edit Notification</h1>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="mb-4">
                                        <label className="form-label">Title:</label>
                                        <input
                                            type="text"
                                            {...register("title")}
                                            className="form-control shadow text-capitalize"
                                            placeholder="Add A Title Here"
                                        />
                                    </div>
                                    {/* Description Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Message :</label>
                                        <textarea
                                            {...register("body")}
                                            className="form-control shadow text-capitalize"
                                            rows="8"
                                            style={{
                                                resize: "none",
                                                overflowY: "auto",
                                                scrollbarWidth: "none",
                                                msOverflowStyle: "none",
                                            }}
                                            placeholder="Write A Message Here..."
                                        />
                                    </div>

                                    {/* Target Field */}
                                    <div className="mb-4">
                                        <label className="form-label">Target Link :</label>
                                        <input
                                            type="url"
                                            {...register("link")}
                                            className="form-control shadow"
                                            placeholder="Add a Target Link Here..."
                                        />
                                    </div>

                                    {/* Sends */}
                                    <div className="d-flex align-items-center justify-content-between mb-4">
                                        <div className="">
                                            <label className="form-label">Send To :</label>
                                            <select
                                                {...register("userType")}
                                                className="form-control form-select shadow text-capitalize"
                                                style={{
                                                    width: "400px",
                                                    color: sends === "" ? "#8DA9C4" : "inherit",
                                                }}
                                                value={sends}
                                                onChange={(e) => setSends(e.target.value)}
                                            >
                                                <option value="" className="default-option">
                                                    Select User To Send
                                                </option>
                                                {send.map((option, i) => (
                                                    <option
                                                        key={1 + i}
                                                        className="text-dark"
                                                        value={option.num}
                                                    >
                                                        {option.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-50 ms-3">
                                            <label className="form-label">Send Time</label>
                                            <br />
                                            <div className="d-flex btn-group-container gap-2">
                                                <button
                                                    className={`now-btn col-6 p-2 ${activeButton === "not-schedule" ? "active  active-now-btn" : ""
                                                        }`}
                                                    type="button"
                                                    onClick={() => setActiveButton("not-schedule")}
                                                >
                                                    Now
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`schedule-btn col-6 p-2 ${activeButton === "schedule" ? " active active-schedule-btn" : ""
                                                        }`}
                                                    onClick={() => setActiveButton("schedule")}
                                                >
                                                    Schedule
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {activeButton === "schedule" && <div className="row">
                                        <div className="col-6">
                                            <label>Scheduled Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label>Send Time</label>
                                            <div className="d-flex gap-2">
                                                {/* Hour Dropdown */}
                                                <select className="form-control" onChange={(e) => setHour(e.target.value)}>
                                                    <option value="">Select Hour</option>
                                                    {[...Array(12).keys()].map((h) => (
                                                        <option key={h + 1} value={h + 1}>
                                                            {h + 1}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Minutes Dropdown */}
                                                <select className="form-control" onChange={(e) => setMinutes(e.target.value)}>
                                                    <option value="">Select Minutes</option>
                                                    {[...Array(60).keys()].map((m) => (
                                                        <option key={m} value={m}>
                                                            {m}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* AM/PM Dropdown */}
                                                <select className="form-control" onChange={(e) => setPeriod(e.target.value)}>
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>}
                                </div>

                                {/* Image Upload Section */}
                                <div className="col-md-4">
                                    <label className="form-label mb-3 ms-4">Images:</label>
                                    <div className="shadow image-upload ms-4">
                                        <div className="upload-icon">
                                            <GrUploadOption className="arrow-up" />
                                        </div>
                                        {/* Image previews */}
                                        <div className="image-preview-container mt-3">
                                            {imageList.length > 0 && (
                                                <>
                                                    <div className="featured-image">
                                                        <div className="position-relative image-preview-item">
                                                            <img
                                                                src={imageList[0]}
                                                                alt={`Preview 1`}
                                                                className="cursor-pointer img-fluid img-thumbnail"
                                                                onClick={() => openImageEditor(0)}
                                                            />
                                                            <h5 className="mt-2">Main Image</h5>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm position-absolute remove-button"
                                                                onClick={() => removeImage(0)}
                                                            >
                                                                <MdDelete />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="text-center text-muted mt-2">
                                                        {imageList.length} image
                                                        {imageList.length > 1 ? "s" : ""} selected
                                                    </div>
                                                </>
                                            )}

                                            {imageList.length === 0 && (
                                                <>
                                                    <div className="fs-5 upload-text">
                                                        Upload Multiple Images Here
                                                    </div>
                                                    <div className="fs-6 upload-subtext">
                                                        (Jpg, png files supported only)
                                                        <br />
                                                        (Max File Size 10 MB per image)
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="w-50 edit-btn fs-6 mt-4"
                                                        onClick={() =>
                                                            document.getElementById("fileInput").click()
                                                        }
                                                    >
                                                        Select Images
                                                    </button>
                                                </>
                                            )}

                                            <input
                                                type="file"
                                                className="d-none form-control"
                                                id="fileInput"
                                                accept="image/jpeg,image/png,image/jpg"
                                                {...register("images")}
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                        {imageError && (
                                            <div className="text-danger mt-2">{imageError}</div>
                                        )}
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
                                                    <div
                                                        className="d-flex align-items-center rounded-pill control-group ps-2 pt-1 zoom-icon"
                                                        style={{ width: "180px", fontSize: "15px" }}
                                                    >
                                                        <label className="form-labels me-2">Zoom</label>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm border-0"
                                                            onClick={() =>
                                                                setZoom((prev) => Math.max(1, prev - 0.1))
                                                            }
                                                        >
                                                            <FiMinusCircle
                                                                style={{ color: "#000080", fontSize: "18px" }}
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
                                                                style={{ color: "#000080", fontSize: "18px" }}
                                                            />
                                                        </button>
                                                    </div>
                                                    <div
                                                        className="d-flex align-items-center rounded-pill control-group ps-3 pt-1 zoom-icon"
                                                        style={{ width: "130px", fontSize: "15px" }}
                                                    >
                                                        <label className="form-labels">Rotation</label>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm border-0 mx-2"
                                                            onClick={() =>
                                                                setRotation((prev) => (prev + 90) % 360)
                                                            }
                                                        >
                                                            <FaArrowRotateRight
                                                                style={{ color: "#000080", fontSize: "17px" }}
                                                            />
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
                                </div>
                                {/* Submit buttons */}
                                <div className="mt-4">
                                    <button
                                        type="submit"
                                        className="rounded-pill ms-3 submit-btn"
                                        style={{
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Update Notification
                                    </button>
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

export default EditNotification;
