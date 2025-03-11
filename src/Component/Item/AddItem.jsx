// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { useForm } from 'react-hook-form';
// import axios from 'axios';
// import { GrUploadOption, GrClose } from "react-icons/gr";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useNavigate } from 'react-router-dom';
// import Cropper from 'react-easy-crop';
// import { FaArrowRotateRight } from "react-icons/fa6";
// import { GoPlusCircle } from "react-icons/go";
// import { FiPlusCircle, FiMinusCircle } from "react-icons/fi";
// import imageCompression from 'browser-image-compression';
// import { MdDelete } from "react-icons/md";
// function AddItem() {
//     const { register, handleSubmit, setValue, reset, watch } = useForm({
//         defaultValues: {
//             ratings: 0,
//             images: [],
//             categoryId: "",
//             size: [{
//                 sizeId: "",
//                 volume: "",
//                 sizePrice: ""
//             }],
//             personalSize: [{
//                 sizeId: "",
//                 volume: "",
//                 sizePrice: ""
//             }]
//         }
//     });
//     const baseUrl = import.meta.env.VITE_API_URL;
//     const [imageList, setImageList] = useState([]);
//     const [imageError, setImageError] = useState('');
//     const [currentImageIndex, setCurrentImageIndex] = useState(0);
//     const [selectedImagesCount, setSelectedImagesCount] = useState(0);
//     const [rating, setRating] = useState(0);
//     const [categories, setCategories] = useState([]);
//     const [sizes, setSizes] = useState([]);
//     const [imageSelected, setImageSelected] = useState(false);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [crop, setCrop] = useState({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const [rotation, setRotation] = useState(0);
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//     const navigate = useNavigate();
//     const [ingredients, setIngredients] = useState(['']);
//     const inputRefs = useRef([]);
//     const businessVariants = watch("size") || [];
//     const watchImages = watch("images") || [];

//     // useEffect
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const category = await axios.get(`${baseUrl}/admin/categories-list`);
//                 setCategories(category.data.data.categories);
//                 const sizes = await axios.get(`${baseUrl}/size/list`);
//                 setSizes(sizes.data.data.sizes);
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//                 toast.error("Failed to load categories and sizes.");
//             }
//         };

//         fetchData();
//     }, []);

//     // useEffect Ingredients
//     // useEffect(() => {
//     //     ingredients.forEach((ingredient, index) => {
//     //         const input = inputRefs.current[index];
//     //         if (input) {
//     //             const tempSpan = document.createElement('span');
//     //             tempSpan.style.visibility = 'hidden';
//     //             tempSpan.style.position = 'absolute';
//     //             tempSpan.style.font = window.getComputedStyle(input).font;
//     //             tempSpan.innerText = ingredient || input.placeholder || '';
//     //             document.body.appendChild(tempSpan);
//     //             const newWidth = Math.max(tempSpan.offsetWidth + 30, 60);
//     //             input.style.minWidth = `${newWidth}px`;
//     //             document.body.removeChild(tempSpan);
//     //         }
//     //     });
//     // }, [ingredients]);

//     // Ingredients Functions
//     // const handleIngredientChange = (index, newValue) => {
//     //     const updatedIngredients = [...ingredients];
//     //     updatedIngredients[index] = newValue;
//     //     setIngredients(updatedIngredients);
//     // };

//     // const addIngredient = () => {
//     //     setIngredients([...ingredients, '']);
//     // };

//     // const removeIngredient = (index) => {
//     //     const updatedIngredients = ingredients.filter((_, i) => i !== index);
//     //     setIngredients(updatedIngredients);
//     // };

//     // Ratings Functions
//     const handleRatingClick = (index) => {
//         setRating(index + 1);
//         setValue("ratings", index + 1);
//     };

//     // Variants Functions
//     const addPersonalVariant = () => {
//         const personalSizeArray = watch("personalSize");
//         personalSizeArray.push({ sizeId: "", volume: "", sizePrice: "" });
//         setValue("personalSize", personalSizeArray);
//     };
//     const addBusinessVariant = () => {
//         const sizeArray = watch("size") || [];
//         sizeArray.push({ sizeId: "", volume: "", sizePrice: "" });
//         setValue("size", sizeArray);
//     };
//     const removeBusinessVariant = (index) => {
//         const sizeArray = watch("size");
//         if (sizeArray.length > 1) {
//             const newArray = sizeArray.filter((_, i) => i !== index);
//             setValue("size", newArray);
//         }
//     };
//     const removePersonalVariant = (index) => {
//         const personalSizeArray = watch("personalSize");
//         if (personalSizeArray.length > 1) {
//             const newArray = personalSizeArray.filter((_, i) => i !== index);
//             setValue("personalSize", newArray);
//         }
//     };
//     // Handle Active Status
//     const handleActiveStatus = (sizeData) => {
//         if (sizeData && sizeData.length === 0) {
//             return { isActive: false, sizeData: [] };
//         } else if (sizeData && sizeData.length > 0) {
//             const validSizes = sizeData.filter(item => item.sizeId);
//             return validSizes.length === 0
//                 ? { isActive: false, sizeData: [] }
//                 : { isActive: true, sizeData: validSizes };
//         }
//         return { isActive: false, sizeData: [] };
//     };
//     // Multiple Image Functions
//     const handleImageChange = async (event) => {
//         const files = Array.from(event.target.files);
//         const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//         const maxFileSizeInKB = 10240; // 10 MB
//         const newImages = [];

//         for (const file of files) {
//             if (!allowedTypes.includes(file.type)) {
//                 setImageError('Only image files (JPG,JPEG PNG) are allowed!');
//                 continue;
//             }

//             const fileSizeInKB = file.size / 1024;
//             if (fileSizeInKB <= maxFileSizeInKB) {
//                 newImages.push({
//                     file: file,
//                     preview: URL.createObjectURL(file)
//                 });
//             } else {
//                 try {
//                     const options = {
//                         maxSizeMB: 10,
//                         maxWidthOrHeight: 1024,
//                         useWebWorker: true,
//                     };

//                     const compressedFile = await imageCompression(file, options);
//                     const compressedFileSizeInKB = compressedFile.size / 1024;

//                     if (compressedFileSizeInKB > maxFileSizeInKB) {
//                         setImageError('Compressed file size should not exceed 10 MB.');
//                         continue;
//                     }

//                     newImages.push({
//                         file: compressedFile,
//                         preview: URL.createObjectURL(compressedFile)
//                     });
//                 } catch (error) {
//                     console.error('Error during image compression:', error);
//                     setImageError('Error while compressing image.');
//                 }
//             }
//         }
//         setImageList(prev => [...prev, ...newImages]);
//         setImageSelected(true);
//         setImageError('');
//         const allFiles = [...(watchImages || []), ...newImages.map(img => img.file)];
//         setValue("images", allFiles);
//     };
//     const removeImage = (index) => {
//         setImageList(prev => {
//             const newList = prev.filter((_, i) => i !== index);
//             setValue("images", newList.map(img => img.file));
//             return newList;
//         });

//         if (imageList.length === 1) {
//             setImageSelected(false);
//         }
//     };
//     const openImageEditor = (index) => {
//         setCurrentImageIndex(index);
//         setIsModalOpen(true);
//         setCrop({ x: 0, y: 0 });
//         setZoom(1);
//         setRotation(0);
//     };
//     const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//         setCroppedAreaPixels(croppedAreaPixels);
//     }, []);
//     const updateImagePreview = async () => {
//         try {
//             if (!croppedAreaPixels) return;
//             // Apply the crop and zoom to the image
//             const croppedImage = await applyCropZoomRotation(
//                 imageList[currentImageIndex].preview,
//                 croppedAreaPixels,
//                 rotation
//             );
//             // Create a new file from the cropped image
//             const response = await fetch(croppedImage);
//             const blob = await response.blob();
//             const fileName = imageList[currentImageIndex].file.name;
//             const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });

//             // Update the image list with the new cropped image
//             setImageList(prev => {
//                 const newList = [...prev];
//                 newList[currentImageIndex] = {
//                     file: croppedFile,
//                     preview: croppedImage
//                 };
//                 return newList;
//             });

//             // Update the form value with the new files
//             const allFiles = imageList.map((img, i) =>
//                 i === currentImageIndex ? croppedFile : img.file
//             );
//             setValue("images", allFiles);

//         } catch (error) {
//             console.error('Error updating image preview:', error);
//         }
//     };
//     const closeModal = () => {
//         setIsModalOpen(false);
//         setCurrentImageIndex(null);
//     };
//     const createImage = (url) =>
//         new Promise((resolve, reject) => {
//             const image = new Image();
//             image.addEventListener('load', () => resolve(image));
//             image.addEventListener('error', (error) => reject(error));
//             image.src = url;
//         });

//     // In your utils/getCroppedImg.js file:
//     const applyCropZoomRotation = async (imageSrc, pixelCrop, rotation = 0) => {
//         const image = await createImage(imageSrc);
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');

//         const maxSize = Math.max(image.width, image.height);
//         const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

//         // set dimensions to double largest dimension to allow for rotation
//         canvas.width = safeArea;
//         canvas.height = safeArea;

//         // translate canvas center to image center
//         ctx.translate(safeArea / 2, safeArea / 2);
//         ctx.rotate((rotation * Math.PI) / 180);
//         ctx.translate(-safeArea / 2, -safeArea / 2);

//         // draw image in center of canvas
//         ctx.drawImage(
//             image,
//             safeArea / 2 - image.width * 0.5,
//             safeArea / 2 - image.height * 0.5
//         );

//         // extract cropped image
//         const data = ctx.getImageData(
//             safeArea / 2 - (pixelCrop.width / 2),
//             safeArea / 2 - (pixelCrop.height / 2),
//             pixelCrop.width,
//             pixelCrop.height
//         );

//         // set canvas width to final desired crop size
//         canvas.width = pixelCrop.width;
//         canvas.height = pixelCrop.height;

//         // place image data in the new canvas
//         ctx.putImageData(data, 0, 0);

//         return new Promise((resolve) => {
//             canvas.toBlob((blob) => {
//                 resolve(URL.createObjectURL(blob));
//             }, 'image/jpeg');
//         });
//     };
//     const onSubmit = async (data) => {
//         console.log(data)
//         const formData = new FormData();

//         // Append images
//         data.images.forEach((image) => {
//             formData.append("images", image);
//         });

//         // Ensure only non-empty ingredients are included
//         const filteredIngredients = ingredients.filter((item) => item.trim() !== "");
//         const businessStatus = handleActiveStatus(data.size);
//         const personalStatus = handleActiveStatus(data.personalSize);

//         data.isActiveForBusiness = businessStatus.isActive;
//         data.size = businessStatus.sizeData;

//         data.isActiveForPersonal = personalStatus.isActive;
//         data.personalSize = personalStatus.sizeData;

//         // Append other fields
//         formData.append("ratings", data.ratings);
//         formData.append("categoryId", data.categoryId);
//         formData.append("isActiveForBusiness", data.isActiveForBusiness);
//         formData.append("isActiveForPersonal", data.isActiveForPersonal);
//         formData.append("itemName", data.itemName)
//         data.size.forEach((item, index) => {
//             formData.append(`size[${index}][sizeId]`, item.sizeId);
//             formData.append(`size[${index}][volume]`, item.volume);
//             formData.append(`size[${index}][sizePrice]`, item.sizePrice);
//         });
//         filteredIngredients.forEach((item, index) => {
//             formData.append(`ingredients[${index}]`, item);
//         });
//         data.personalSize.forEach((item, index) => {
//             formData.append(`personalSize[${index}][sizeId]`, item.sizeId);
//             formData.append(`personalSize[${index}][volume]`, item.volume);
//             formData.append(`personalSize[${index}][sizePrice]`, item.sizePrice);
//         });
//         try {
//             const response = await axios.post(`${baseUrl}/menu/create`, formData, {
//                 headers: {
//                     "Content-Type": "multipart/form-data"
//                 }
//             });

//             if (response.data.success) {
//                 toast.success(response.data.message || "Item added successfully!", {
//                     position: "top-right",
//                     autoClose: 1000,
//                     theme: "colored",
//                     style: {
//                         backgroundColor: 'green',
//                         color: '#000',
//                     },
//                 });
//                 reset();
//                 setRating(0);
//                 setImageList([]);
//                 setCurrentImageIndex(null);
//                 setSelectedImagesCount(0);

//                 setTimeout(() => {
//                     navigate('/all-items');
//                 }, 1000);
//             }
//         } catch (error) {
//             console.error("Error details:", error.response ? error.response.data : error);
//             toast.error(error.response?.data?.message || "Failed to submit the form. Please try again.");
//         }
//     };
//     return (
//         <div className='dashboard-container'>
//             <div className="main-content pb-5">
//                 <div className="form-container">
//                     <h1 className="form-title">Add New Item</h1>
//                     <form action="/menu/create" method='POST' onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
//                         <div className="row g-0">
//                             {/* Name Field */}
//                             <div className="col-lg-8 col-md-8 col-sm-6 form-size">
//                                 <div className="mb-4">
//                                     <label className="form-label">Name :</label>
//                                     <input
//                                         type='text'
//                                         name="itemName"
//                                         {...register("itemName")}
//                                         className="form-control shadow"
//                                         placeholder="e.g. Masala Tea"
//                                     />
//                                 </div>

//                                 {/* Description Field */}
//                                 <div className="mb-4">
//                                     <label className="form-label">Description :</label>
//                                     <textarea
//                                         name='description'
//                                         {...register("description")}
//                                         // value="hello"
//                                         className="form-control shadow"
//                                         rows="4"
//                                         style={{
//                                             resize: 'none',
//                                             overflowY: 'auto',
//                                             scrollbarWidth: 'none',
//                                             msOverflowStyle: 'none'
//                                         }}
//                                         placeholder="Write a short description about this item..."
//                                     />
//                                 </div>

//                                 {/* Ingredients Field */}
//                                 {/* <div className="mb-4">
//                                     <label className="form-label">Ingredients:</label>
//                                     <div className="d-flex flex-wrap align-items-center">
//                                         {ingredients.map((ingredient, index) => (
//                                             <div key={index} className="d-flex align-items-center">
//                                                 <div className="input-group mt-2" style={{ width: 'auto' }}>
//                                                     <input
//                                                         ref={(el) => (inputRefs.current[index] = el)}
//                                                         type="text"
//                                                         className="form-control shadow"
//                                                         placeholder="e.g. Tea"
//                                                         value={ingredient}
//                                                         onChange={(e) => handleIngredientChange(index, e.target.value)}
//                                                         style={{
//                                                             width: '60px',
//                                                             minWidth: '60px !important',
//                                                             transition: 'width 0.2s ease'
//                                                         }}
//                                                     />
//                                                     <button
//                                                         type="button"
//                                                         className="btn btn-link p-2 end-0"
//                                                         onClick={() =>
//                                                             index === ingredients.length - 1
//                                                                 ? addIngredient()
//                                                                 : removeIngredient(index)
//                                                         }
//                                                     >
//                                                         {index === ingredients.length - 1 ? (
//                                                             <FiPlusCircle className="fs-5 text-primary" />
//                                                         ) : (
//                                                             <FiMinusCircle className="fs-5 text-danger" />
//                                                         )}
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div> */}
//                                 <div className="mb-4  d-flex align-items-center gap-4   ">
//                                     <div className="w-50">
//                                         <label className="form-label">Ingredients:</label>
//                                         <div className="align-items-center">
//                                             {ingredients.map((ingredient, index) => (
//                                                 <div key={index} className="d-flex align-items-center mb-2 me-2">
//                                                     <div className="input-group" >
//                                                         <select
//                                                             className="form-control shadow text-capitalize"
//                                                             value={ingredient.id || ""}
//                                                             onChange={(e) => {
//                                                                 const updatedIngredients = [...ingredients];
//                                                                 updatedIngredients[index] = {
//                                                                     id: e.target.value,
//                                                                     name: e.target.options[e.target.selectedIndex].text
//                                                                 };
//                                                                 setIngredients(updatedIngredients);
//                                                             }}
//                                                         >
//                                                             <option value="">Search Ingredient</option>
//                                                             {[
//                                                                 { _id: "ing1", name: "Milk" },
//                                                                 { _id: "ing2", name: "Tea" },
//                                                                 { _id: "ing3", name: "Sugar" },
//                                                                 { _id: "ing4", name: "Water" },
//                                                                 { _id: "ing5", name: "Coffee" }
//                                                             ].map((ing) => (
//                                                                 <option key={ing._id} value={ing._id}>
//                                                                     {ing.name}
//                                                                 </option>
//                                                             ))}
//                                                         </select>
//                                                         {/* <button
//                                                         type="button"
//                                                         className="btn btn-link p-2 end-0"
//                                                         // onClick={() =>
//                                                         //     index === ingredients.length - 1
//                                                         //         ? addIngredient()
//                                                         //         : removeIngredient(index)
//                                                         // }
//                                                     >
//                                                         {index === ingredients.length - 1 ? (
//                                                             <FiPlusCircle className="fs-5 text-primary" />
//                                                         ) : (
//                                                             <FiMinusCircle className="fs-5 text-danger" />
//                                                         )}
//                                                     </button> */}
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                     <div className="w-50">
//                                         <label className="form-label">Add Ons:</label>
//                                         <div className="align-items-center ">
//                                             {ingredients.map((ingredient, index) => (
//                                                 <div key={index} className="d-flex align-items-center mb-2 me-2">
//                                                     <div className="input-group" >
//                                                         <select
//                                                             className="form-control shadow text-capitalize"
//                                                             value={ingredient.id || ""}
//                                                             onChange={(e) => {
//                                                                 const updatedIngredients = [...ingredients];
//                                                                 updatedIngredients[index] = {
//                                                                     id: e.target.value,
//                                                                     name: e.target.options[e.target.selectedIndex].text
//                                                                 };
//                                                                 setIngredients(updatedIngredients);
//                                                             }}
//                                                         >
//                                                             <option value="">Select Add Ons</option>
//                                                             {[
//                                                                 { _id: "ing1", name: "Milk" },
//                                                                 { _id: "ing2", name: "Tea" },
//                                                                 { _id: "ing3", name: "Sugar" },
//                                                                 { _id: "ing4", name: "Water" },
//                                                                 { _id: "ing5", name: "Coffee" }
//                                                             ].map((ing) => (
//                                                                 <option key={ing._id} value={ing._id}>
//                                                                     {ing.name}
//                                                                 </option>
//                                                             ))}
//                                                         </select>
//                                                         {/* <button
//                                                         type="button"
//                                                         className="btn btn-link p-2 end-0"
//                                                         // onClick={() =>
//                                                         //     index === ingredients.length - 1
//                                                         //         ? addIngredient()
//                                                         //         : removeIngredient(index)
//                                                         // }
//                                                     >
//                                                         {index === ingredients.length - 1 ? (
//                                                             <FiPlusCircle className="fs-5 text-primary" />
//                                                         ) : (
//                                                             <FiMinusCircle className="fs-5 text-danger" />
//                                                         )}
//                                                     </button> */}
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Rating */}
//                                 <div className="mb-4 rating d-flex align-items-center">
//                                     <label className="rating-label form-label">Ratings:</label>
//                                     <div className="rating-stars-container">
//                                         {[...Array(5)].map((_, index) => (
//                                             <span
//                                                 key={index}
//                                                 className={`rating-stars ${index < rating ? "selected" : ""}`}
//                                                 onClick={() => handleRatingClick(index)}
//                                             >
//                                                 ★
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 <input
//                                     type="hidden"
//                                     name="ratings"
//                                     {...register("ratings", { required: true })}
//                                     value={rating}
//                                 />

//                             </div>
//                             {/* <div className="col-1"></div> */}
//                             {/* Image Upload Section */}
//                             <div className="col-md-4">
//                                 <label className="form-label mb-3 ms-4">Images:</label>
//                                 <div className="image-upload shadow ms-4">
//                                     <div className="upload-icon">
//                                         <GrUploadOption className="arrow-up" />
//                                     </div>

//                                     {/* Image previews */}
//                                     <div className="image-preview-container  mt-3">
//                                         {imageList.length > 0 && (
//                                             <>
//                                                 <div className="featured-image">
//                                                     <div className="image-preview-item position-relative">
//                                                         <img
//                                                             src={imageList[0].preview}
//                                                             alt={`Preview 1`}
//                                                             className="img-thumbnail cursor-pointer img-fluid"
//                                                             onClick={() => openImageEditor(0)}
//                                                         />
//                                                         <h5 className='mt-2'>Main Image</h5>
//                                                         <button
//                                                             type="button"
//                                                             className="btn btn-danger btn-sm position-absolute  remove-button"
//                                                             onClick={() => removeImage(0)}
//                                                         >
//                                                             <MdDelete />
//                                                         </button>
//                                                     </div>
//                                                 </div>

//                                                 {imageList.length > 1 && (
//                                                     <div className="remaining-images">
//                                                         {imageList.slice(1).map((image, index) => (
//                                                             <div key={index + 1} className="image-preview-item position-relative">
//                                                                 <img
//                                                                     src={image.preview}
//                                                                     alt={`Preview ${index + 2}`}
//                                                                     className="img-thumbnail cursor-pointer img-fluid"
//                                                                     onClick={() => openImageEditor(index + 1)}
//                                                                 />
//                                                                 <button
//                                                                     type="button"
//                                                                     className="btn btn-danger btn-sm position-absolute remove-button"
//                                                                     onClick={() => removeImage(index + 1)}
//                                                                 >
//                                                                     <MdDelete />
//                                                                 </button>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 )}

//                                                 <button
//                                                     type="button"
//                                                     className="edit-btn mt-3 w-50"
//                                                     onClick={() => document.getElementById("fileInput").click()}
//                                                 >
//                                                     Add More Images
//                                                 </button>

//                                                 <div className="mt-2 text-muted text-center">
//                                                     {imageList.length} image{imageList.length > 1 ? 's' : ''} selected
//                                                 </div>
//                                             </>
//                                         )}

//                                         {imageList.length === 0 && (
//                                             <>
//                                                 <div className="upload-text fs-5">Upload Multiple Images Here</div>
//                                                 <div className="upload-subtext fs-6">
//                                                     (Jpg, Jpeg, Png files supported only)
//                                                     <br />
//                                                     (Max File Size 10 MB per image)
//                                                 </div>
//                                                 <button
//                                                     type="button"
//                                                     className="edit-btn mt-4 w-50 fs-6"
//                                                     onClick={() => document.getElementById("fileInput").click()}
//                                                 >
//                                                     Select Images
//                                                 </button>
//                                             </>
//                                         )}


//                                         <input
//                                             type="file"
//                                             className="form-control d-none"
//                                             id="fileInput"
//                                             multiple
//                                             accept="image/jpeg,image/png,image/jpg"
//                                             {...register("images")}
//                                             onChange={handleImageChange}
//                                         />
//                                     </div>
//                                     {imageError && <div className="text-danger mt-2">{imageError}</div>}
//                                 </div>

//                                 {/* Image Editing Modal */}
//                                 {isModalOpen && currentImageIndex !== null && (
//                                     <div
//                                         className="modal-overlay"
//                                         onClick={(e) => {
//                                             if (e.target === e.currentTarget) {
//                                                 closeModal();
//                                             }
//                                         }}
//                                     >
//                                         <div className="modal-div" onClick={(e) => e.stopPropagation()}>
//                                             <button
//                                                 type="button"
//                                                 onClick={closeModal}
//                                                 className="close-button"
//                                             >
//                                                 <GrClose />
//                                             </button>
//                                             <Cropper
//                                                 image={imageList[currentImageIndex].preview}
//                                                 crop={crop}
//                                                 zoom={zoom}
//                                                 rotation={rotation}
//                                                 aspect={5 / 3}
//                                                 onCropChange={setCrop}
//                                                 onZoomChange={setZoom}
//                                                 onRotationChange={setRotation}
//                                                 onCropComplete={onCropComplete}
//                                             />
//                                             <div className="crop-controls">
//                                                 <div className="control-group d-flex align-items-center pt-1 rounded-pill ps-2 zoom-icon" style={{ width: "180px", fontSize: "15px" }}>
//                                                     <label className="form-labels me-2">Zoom</label>
//                                                     <button
//                                                         type="button"
//                                                         className="btn btn-sm border-0"
//                                                         onClick={() => setZoom(prev => Math.max(1, prev - 0.1))}
//                                                     >
//                                                         <FiMinusCircle style={{ color: "#000080", fontSize: "18px" }} />
//                                                     </button>
//                                                     <span className="mx-2">{zoom.toFixed(1)}x</span>
//                                                     <button
//                                                         type="button"
//                                                         className="btn btn-sm border-0"
//                                                         onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
//                                                     >
//                                                         <GoPlusCircle style={{ color: "#000080", fontSize: "18px" }} />
//                                                     </button>
//                                                 </div>
//                                                 <div className="control-group d-flex align-items-center pt-1 rounded-pill ps-3 zoom-icon" style={{ width: "130px", fontSize: "15px" }}>
//                                                     <label className="form-labels">Rotation</label>
//                                                     <button
//                                                         type="button"
//                                                         className="btn btn-sm mx-2 border-0"
//                                                         onClick={() => setRotation((prev) => (prev + 90) % 360)}
//                                                     >
//                                                         <FaArrowRotateRight style={{ color: "#000080", fontSize: "17px" }} />
//                                                     </button>
//                                                 </div>
//                                                 <button
//                                                     type="button"
//                                                     style={{ fontSize: "15px" }}
//                                                     className="edit-btn "
//                                                     onClick={async () => {
//                                                         await updateImagePreview();
//                                                         closeModal();
//                                                     }}
//                                                 >
//                                                     Done
//                                                 </button>
//                                                 <button
//                                                     type="button"
//                                                     style={{ fontSize: "15px" }}
//                                                     className="edit-btn full-size-btn"
//                                                     onClick={() => {
//                                                         setZoom(1);
//                                                         setRotation(0);
//                                                     }}
//                                                 >
//                                                     Real Size
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}


//                             </div>
//                         </div>
//                         <div className="row">
//                             {/* Business Menu Variants */}
//                             <div className="variants-section col-12">
//                                 <h3 className="variants-title">Business Menu Variants</h3>
//                                 <div className="row">
//                                     {watch("size").map((_, index) => (
//                                         <div key={index} className="row w-100 mx-0 mb-3">
//                                             <div className="col-md-3 mb-2">
//                                                 <label className="form-label">Category :</label>
//                                                 <select
//                                                     {...register('categoryId')}
//                                                     className="form-control shadow text-capitalize"
//                                                     name='categoryId'
//                                                     disabled={businessVariants.length > 1}
//                                                 >
//                                                     <option value="">Select Any One</option>
//                                                     {categories.map((category) => (
//                                                         <option key={category._id} value={category._id}>
//                                                             {category.title}
//                                                         </option>
//                                                     ))}
//                                                 </select>
//                                             </div>

//                                             <div className="col-md-3">
//                                                 <label className="form-label">Size :</label>
//                                                 <select
//                                                     {...register(`size[${index}].sizeId`)}
//                                                     className="form-control shadow text-capitalize"
//                                                     name={`size[${index}].sizeId`}
//                                                 >
//                                                     <option value="">Select Any One</option>
//                                                     {sizes.map((size) => (
//                                                         <option key={size._id} value={size._id}>{size.size}</option>
//                                                     ))}
//                                                 </select>
//                                             </div>

//                                             <div className="col-md-3">
//                                                 <label className="form-label">Volume :</label>
//                                                 <input
//                                                     type="text"
//                                                     {...register(`size[${index}].volume`)}
//                                                     name={`size[${index}].volume`}
//                                                     className="form-control shadow text-capitalize"
//                                                     placeholder="e.g. 60ml"
//                                                 />
//                                             </div>

//                                             <div className="col-md-3">
//                                                 <label className="form-label">Price :</label>
//                                                 <input
//                                                     type="number"
//                                                     name={`size[${index}].sizePrice`}

//                                                     {...register(`size[${index}].sizePrice`)}
//                                                     className="form-control shadow"
//                                                     placeholder="₹ e.g. 100"
//                                                 />
//                                             </div>

//                                             {watch("size").length > 1 && (
//                                                 <div className="col-2 d-flex align-items-end">
//                                                     <button
//                                                         type="button"
//                                                         className="btn mb-2"
//                                                         onClick={() => removeBusinessVariant(index)}
//                                                     >
//                                                         <FiMinusCircle className='text-danger  fs-5' /><b className='ms-2'>Remove Variant</b>
//                                                     </button>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>

//                                 <button type="button" className="add-variant-btn" onClick={addBusinessVariant}>
//                                     + ADD VARIANT
//                                 </button>
//                             </div>

//                             {/* Personal Menu Variants */}
//                             {/* <div className="variants-section col-12">
//                                 <h3 className="variants-title">Personal Menu Variants</h3>
//                                 {watch("personalSize").map((_, index) => (
//                                     <div key={index} className="row">
//                                         <div className="col-md-3 mb-2">
//                                             <label className="form-label">Category :</label>
//                                             <select
//                                                 // {...register(`personalSize[${index}].categoryId`)}
//                                                 className="form-control shadow"
//                                                 disabled
//                                             >
//                                                 <option value="">Select Any One</option>
//                                                 {categories.map((category) => (
//                                                     <option key={category._id} value={category._id}>
//                                                         {category.title}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>

//                                         {/* Personal Size 
//                                         <div className="col-md-3 mb-2">
//                                             <label className="form-label">Size :</label>
//                                             <select
//                                                 name={`personalSize[${index}].sizeId`}
//                                                 {...register(`personalSize[${index}].sizeId`)}
//                                                 className="form-control shadow"
//                                             >
//                                                 <option value="">Select Any One</option>
//                                                 {sizes.map((size) => (
//                                                     <option key={size._id} value={size._id}>{size.size}</option>
//                                                 ))}
//                                             </select>
//                                         </div>

//                                         {/* Personal Size - Volume 
//                                         <div className="col-md-3 mb-2">
//                                             <label className="form-label">Volume :</label>
//                                             <input
//                                                 type="text"
//                                                 name={`personalSize[${index}].volume`}
//                                                 {...register(`personalSize[${index}].volume`)}

//                                                 className="form-control shadow"
//                                                 placeholder="e.g. 60ml"
//                                             />
//                                         </div>

//                                         {/* Personal Size - Price 
//                                         <div className="col-md-3 mb-2">
//                                             <label className="form-label">Price :</label>
//                                             <input
//                                                 type="number"
//                                                 name={`personalSize[${index}].sizePrice`}
//                                                 {...register(`personalSize[${index}].sizePrice`,)}

//                                                 className="form-control shadow"
//                                                 placeholder="₹ e.g. 100"
//                                             />
//                                         </div>
//                                         {watch("personalSize").length > 1 && (
//                                             <div className="col-2 d-flex align-items-end">
//                                                 <button
//                                                     type="button"
//                                                     className="btn mb-2"
//                                                     onClick={() => removePersonalVariant(index)}
//                                                 >
//                                                     <FiMinusCircle className='text-danger  fs-5' /><b className='ms-2'>Remove Variant</b>
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))}
//                                 <button type="button" className="add-variant-btn mt-3" onClick={addPersonalVariant}>
//                                     + ADD VARIANT
//                                 </button>

//                             </div> */}

//                         </div>
//                         <div className="mt-4">
//                             <button type="submit" className="submit-btn">ADD ITEM</button>
//                         </div>
//                     </form>
//                 </div >
//             </div >
//             <ToastContainer />
//         </div >
//     );
// }
// export default AddItem;
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { GrUploadOption, GrClose } from "react-icons/gr";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { FaArrowRotateRight } from "react-icons/fa6";
import { GoPlusCircle } from "react-icons/go";
import { FiPlusCircle, FiMinusCircle } from "react-icons/fi";
import imageCompression from 'browser-image-compression';
import { MdDelete } from "react-icons/md";
function AddItem() {
    const { register, handleSubmit, setValue, reset, watch } = useForm({
        defaultValues: {
            ratings: "",
            images: [],
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
            }],
            ingredients: [],
            addOns: []
        }
    });
    const baseUrl = import.meta.env.VITE_API_URL;
    const [imageList, setImageList] = useState([]);
    const [imageError, setImageError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedImagesCount, setSelectedImagesCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [imageSelected, setImageSelected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const navigate = useNavigate();
    const businessVariants = watch("size") || [];
    const watchImages = watch("images") || [];
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
    const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [addons, setAddons] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [addonSearchTerm, setAddonSearchTerm] = useState('');
    const [showAddonDropdown, setShowAddonDropdown] = useState(false);
    const [filteredAddons, setFilteredAddons] = useState([]);
    // useEffect
    useEffect(() => {
        const fetchData = async () => {
            try {
                const category = await axios.get(`${baseUrl}/admin/categories-list`);
                setCategories(category.data.data.categories);
                const sizes = await axios.get(`${baseUrl}/size/list`);
                setSizes(sizes.data.data.sizes);
                const ingredientsResponse = await axios.get(`${baseUrl}/menu/ingredient/list`);
                setIngredients(ingredientsResponse.data.data.ingredients);
                const addonsResponse = await axios.get(`${baseUrl}/menu/addOn/list`);
                setAddons(addonsResponse.data.data.addOns);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load categories,sizes,ingredients & addons .");
            }
        };

        fetchData();
    }, []);
    // handleInputFocus ingredients & Addons
    const handleInputFocus = (type) => {
        if (type === 'ingredient') {
            setShowIngredientDropdown(true);
            setFilteredIngredients(ingredients.slice(0, 3));
        } else if (type === 'addon') {
            setShowAddonDropdown(true);
            setFilteredAddons(addons.slice(0, 3));
        }
    };
    // Ingredients
    const handleIngredientSearch = (e) => {
        const term = e.target.value;
        setIngredientSearchTerm(term);

        // Always show dropdown when typing or clicking
        setShowIngredientDropdown(true);

        if (term.trim() === '') {
            setFilteredIngredients(ingredients.slice(0, 3));
        } else {
            const filtered = ingredients
                .filter(item => item.name.toLowerCase().includes(term.toLowerCase()))
                .slice(0, 5);
            setFilteredIngredients(filtered);
        }
    };
    const addIngredient = (ingredient) => {
        if (!selectedIngredients.some(item => item._id === ingredient._id)) {
            const newSelected = [...selectedIngredients, ingredient];
            setSelectedIngredients(newSelected);
            // Update the form value with the new array of ingredient IDs
            setValue("ingredients", newSelected.map(item => item._id));
        }
        setIngredientSearchTerm('');
        setShowIngredientDropdown(false);
    };
    const removeIngredient = (ingredientId) => {
        const newSelected = selectedIngredients.filter(item => item._id !== ingredientId);
        setSelectedIngredients(newSelected);
        // Update the form value with the new array of ingredient IDs
        setValue("ingredients", newSelected.map(item => item._id));
    };
    const clearAllIngredients = () => {
        setSelectedIngredients([]);
        setValue("ingredients", []);
    };
    useEffect(() => {
        const handleClickOutside = () => {
            setShowIngredientDropdown(false);
            setShowAddonDropdown(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
    // Addons
    const handleAddonSearch = (e) => {
        const term = e.target.value;
        setAddonSearchTerm(term);


        setShowAddonDropdown(true);

        if (term.trim() === '') {
            setFilteredAddons(addons.slice(0, 3));
        } else {
            const filtered = addons
                .filter(item => item.name.toLowerCase().includes(term.toLowerCase()))
                .slice(0, 3);
            setFilteredAddons(filtered);
        }
    };
    const addAddon = (addon) => {
        if (!selectedAddons.some(item => item._id === addon._id)) {
            const newSelected = [...selectedAddons, addon];
            setSelectedAddons(newSelected);
            setValue("addOns", newSelected.map(item => item._id));
        }
        setAddonSearchTerm('');
        setShowAddonDropdown(false);
    };
    const removeAddon = (addonId) => {
        const newSelected = selectedAddons.filter(item => item._id !== addonId);
        setSelectedAddons(newSelected);
        setValue("addOns", newSelected.map(item => item._id));
    };
    const clearAllAddons = () => {
        setSelectedAddons([]);
        setValue("addOns", []);
    };

    // Variants Functions
    const addBusinessVariant = () => {
        const sizeArray = watch("size") || [];
        sizeArray.push({ sizeId: "", volume: "", sizePrice: "" });
        setValue("size", sizeArray);
    };
    const removeBusinessVariant = (index) => {
        const sizeArray = watch("size");
        if (sizeArray.length > 1) {
            const newArray = sizeArray.filter((_, i) => i !== index);
            setValue("size", newArray);
        }
    };
    // Handle Active Status
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
    // Multiple Image Functions
    const handleImageChange = async (event) => {
        const files = Array.from(event.target.files);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxFileSizeInKB = 10240; // 10 MB
        const newImages = [];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setImageError('Only image files (JPG,JPEG PNG) are allowed!');
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
        setImageList(prev => [...prev, ...newImages]);
        setImageSelected(true);
        setImageError('');
        const allFiles = [...(watchImages || []), ...newImages.map(img => img.file)];
        setValue("images", allFiles);
    };
    const removeImage = (index) => {
        setImageList(prev => {
            const newList = prev.filter((_, i) => i !== index);
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
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);
    const updateImagePreview = async () => {
        try {
            if (!croppedAreaPixels) return;
            // Apply the crop and zoom to the image
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
            const allFiles = imageList.map((img, i) =>
                i === currentImageIndex ? croppedFile : img.file
            );
            setValue("images", allFiles);

        } catch (error) {
            console.error('Error updating image preview:', error);
        }
    };
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
        console.log(data, "data");
        const formData = new FormData();

        const businessStatus = handleActiveStatus(data.size);
        const personalStatus = handleActiveStatus(data.personalSize);

        data.isActiveForBusiness = businessStatus.isActive;
        data.size = businessStatus.sizeData;

        data.isActiveForPersonal = personalStatus.isActive;
        data.personalSize = personalStatus.sizeData;
        // Append images
        data.images.forEach((image) => {
            formData.append("images", image);
        });
        // Append other fields
        formData.append("ratings", data.ratings);
        formData.append("categoryId", data.categoryId);
        formData.append("isActiveForBusiness", data.isActiveForBusiness);
        formData.append("isActiveForPersonal", data.isActiveForPersonal);
        formData.append("itemName", data.itemName);
        formData.append("description", data.description);
        formData.append("recipe", data.recipe);


        data.size.forEach((item, index) => {
            formData.append(`size[${index}][sizeId]`, item.sizeId);
            formData.append(`size[${index}][volume]`, item.volume);
            formData.append(`size[${index}][sizePrice]`, item.sizePrice);
        });

        // Append ingredients
        data.ingredients.forEach((item, index) => {
            formData.append(`ingredients[${index}]`, item);
        });

        // Append add-ons
        data.addOns.forEach((item, index) => {
            formData.append(`addOn[${index}]`, item);
        });
        // Append personalSize 
        data.personalSize.forEach((item, index) => {
            formData.append(`personalSize[${index}][sizeId]`, item.sizeId);
            formData.append(`personalSize[${index}][volume]`, item.volume);
            formData.append(`personalSize[${index}][sizePrice]`, item.sizePrice);
        });

        try {
            const response = await axios.post(`${baseUrl}/menu/create`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            console.log('response: ', response);

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
                setImageList([]);
                setAddons([]);
                setIngredients([]);
                setCurrentImageIndex(null);
                setSelectedImagesCount(0);

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
            <div className="main-content pb-5">
                <div className="form-container">
                    <h1 className="form-title">Add New Item</h1>
                    <form action="/menu/create" method='POST' onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                        <div className="row g-0">
                            {/* Name Field */}
                            <div className="col-lg-8 col-md-8 col-sm-6 form-size">
                                <div className="mb-4">
                                    <label className="form-label ">Name :</label>
                                    <input
                                        type='text'
                                        name="itemName"
                                        {...register("itemName")}
                                        className="form-control shadow text-capitalize"
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
                                        className="form-control shadow text-capitalize"
                                        rows="5"
                                        style={{
                                            resize: 'none',
                                            overflowY: 'auto',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none'
                                        }}
                                        placeholder="Write a short description about this item..."
                                    />
                                </div>
                                {/* Recipe Field */}
                                {/* <div className="mb-4">
                                    <label className="form-label">Recipe :</label>
                                    <textarea
                                        name='description'
                                        {...register("recipe")}
                                        // value="hello"
                                        className="form-control shadow text-capitalize"
                                        rows="4"
                                        style={{
                                            resize: 'none',
                                            overflowY: 'auto',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none'
                                        }}
                                        placeholder="Write a short description about this item..."
                                    />
                                </div> */}
                                {/* Ingredients Field */}
                                <div className="mb-4">
                                    <label className="form-label">Item Ingredients :</label>
                                    <div className="position-relative">
                                        <div className="input-container border border-2 border-dark rounded-pill  d-flex align-items-center shadow">
                                            {/* Selected Ingredients */}
                                            <div className="d-flex ms-1 fs-4 align-items-center">
                                                {selectedIngredients.map(item => (
                                                    <div key={item._id} className="me-1 mb-1">
                                                        <span className="badge rounded-pill text-white fw-bold"
                                                            style={{ backgroundColor: '#0B2545', }}>
                                                            {item.name}
                                                            <span
                                                                className="ms-2 cursor-pointer"
                                                                onClick={() => removeIngredient(item._id)}
                                                            >×</span>
                                                        </span>
                                                    </div>
                                                ))}

                                                {/* Search Input */}
                                                <input
                                                    type="text"
                                                    className="form-control border-0"
                                                    placeholder=" Search Ingredients"
                                                    value={ingredientSearchTerm}
                                                    onChange={handleIngredientSearch}
                                                    onFocus={() => handleInputFocus('ingredient')}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowIngredientDropdown(true);
                                                        if (filteredIngredients.length === 0) {
                                                            setFilteredIngredients(ingredients.slice(0, 5));
                                                        }
                                                    }}
                                                    style={{ boxShadow: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Hidden input for react-hook-form to register the ingredients */}
                                        <input
                                            type="hidden"
                                            {...register("ingredients")}
                                        />

                                        {/* Ingredients Dropdown */}
                                        {showIngredientDropdown && filteredIngredients.length > 0 && (
                                            <div className="position-absolute w-100 border rounded bg-white shadow-sm mt-4 pt-2"
                                                style={{
                                                    zIndex: 1000,
                                                    maxHeight: '180px',
                                                    overflowY: 'auto',
                                                    top: '100%',

                                                    left: 0
                                                }}
                                                onClick={(e) => e.stopPropagation()}>
                                                {filteredIngredients.map(item => (
                                                    <div key={item._id}
                                                        className="dropdown-item py-2 px-3 cursor-pointer hover-bg-light"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => addIngredient(item)}>
                                                        {item.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Clear All Button for Ingredients */}
                                        {selectedIngredients.length > 0 && (
                                            <div className="d-flex justify-content-end ">
                                                <button
                                                    type="button"
                                                    className="btn btn-link  "
                                                    style={{ textDecoration: 'none', color: '#0B2545' }}
                                                    onClick={clearAllIngredients}
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* <div className="col-1"></div> */}
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
                                                    (Jpg, Jpeg, Png files supported only)
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
                        </div>
                        {/* Add Ons Section */}
                        <div className="row ">
                            <div className="col-md-8">
                                <div className="mb-4">
                                    <label className="form-label">Add-ons :</label>
                                    <div className="position-relative">
                                        <div className="input-container border border-2 border-dark rounded-pill d-flex align-items-center shadow">
                                            {/* Selected Add-ons */}
                                            <div className="d-flex ms-1 fs-4 align-items-center">
                                                {selectedAddons.map(item => (
                                                    <div key={item._id} className="me-1 mb-1">
                                                        <span className="badge rounded-pill text-white fw-bold"
                                                            style={{ backgroundColor: '#0B2545', }}>
                                                            {item.name}
                                                            <span
                                                                className="ms-2 cursor-pointer"
                                                                onClick={() => removeAddon(item._id)}
                                                            >×</span>
                                                        </span>
                                                    </div>
                                                ))}

                                                {/* Search Input */}
                                                <input
                                                    type="text"
                                                    className="form-control border-0"
                                                    placeholder=" Search Add-ons"
                                                    value={addonSearchTerm}
                                                    onChange={handleAddonSearch}
                                                    onFocus={() => handleInputFocus('addon')}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowAddonDropdown(true);
                                                        if (filteredAddons.length === 0) {
                                                            setFilteredAddons(addons.slice(0, 5));
                                                        }
                                                    }}
                                                    style={{ boxShadow: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Hidden input for react-hook-form to register the add-ons */}
                                        <input
                                            type="hidden"
                                        // {...register("addOn")}
                                        />

                                        {/* Add-ons Dropdown */}
                                        {showAddonDropdown && filteredAddons.length > 0 && (
                                            <div className="position-absolute w-100 border rounded bg-white shadow-sm mt-4 pt-2"
                                                style={{
                                                    zIndex: 1000,
                                                    maxHeight: '180px',
                                                    overflowY: 'auto',
                                                    top: '100%',
                                                    left: 0
                                                }}
                                                onClick={(e) => e.stopPropagation()}>
                                                {filteredAddons.map(item => (
                                                    <div key={item._id}
                                                        className="dropdown-item py-2 px-3 cursor-pointer hover-bg-light"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => addAddon(item)}>
                                                        {item.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Clear All Button for Add-ons */}
                                        {selectedAddons.length > 0 && (
                                            <div className="d-flex justify-content-end ">
                                                <button
                                                    type="button"
                                                    className="btn btn-link"
                                                    style={{ textDecoration: 'none', color: '#0B2545' }}
                                                    onClick={clearAllAddons}
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Rating */}
                            <div className="col-md-4 mt-1">
                                <div className="mb-2">
                                    <label className="form-label">Ratings:</label>
                                    <input
                                        type="number"
                                        name="ratings"
                                        {...register("ratings", { required: true })}
                                        className="form-control shadow"
                                        placeholder=" E.g 4.5"
                                    />
                                </div>
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
                                                    className="form-control shadow text-capitalize"
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
                                                    className="form-control shadow text-capitalize"
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
                                                    className="form-control shadow text-capitalize"
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
                            {/* Recipe Field */}
                            <div className="mb-4">
                                <label className="form-label">Recipe :</label>
                                <textarea
                                    name='description'
                                    {...register("recipe")}
                                    // value="hello"
                                    className="form-control shadow text-capitalize"
                                    rows="4"
                                    style={{
                                        resize: 'none',
                                        overflowY: 'auto',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none'
                                    }}
                                    placeholder="Write the cooking instructions for this item..."
                                />
                            </div>
                            {/* Personal Menu Variants */}
                            {/* <div className="variants-section col-12">
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

                                        {/* Personal Size 
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

                                        {/* Personal Size - Volume 
                                        <div className="col-md-3 mb-2">
                                            <label className="form-label">Volume :</label>
                                            <input
                                                type="text"
                                                name={`personalSize[${index}].volume`}
                                                {...register(`personalSize[${index}].volume`)}

                                                className="form-control shadow"
                                                placeholder="e.g. 60ml"
                                            />
                                        </div>

                                        {/* Personal Size - Price 
                                        <div className="col-md-3 mb-2">
                                            <label className="form-label">Price :</label>
                                            <input
                                                type="number"
                                                name={`personalSize[${index}].sizePrice`}
                                                {...register(`personalSize[${index}].sizePrice`,)}

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

                            </div> */}

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