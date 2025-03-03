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
import { FiPlusCircle, FiMinusCircle } from "react-icons/fi";
import imageCompression from "browser-image-compression";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

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
  const [ingredients, setIngredients] = useState([{ value: "" }]);
  const volume = useRef();
  const sizePrice = useRef();
  const navigate = useNavigate();
  // const [selecteditmes, setselecteditmes] = useState([]);
  // console.log("searchTerm: ", searchTerm);
  // const inputRefs = useRef([]);
  // const dropdownRef = useRef(null);
  // const [variants, setVariants] = useState([{}]); // First row initialized
  // const [selecteditmes ,  setselecteditmes] = useState([])'
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const [containers, setContainers] = useState([{}]);
  // const periods = ["Regular", "Jain", "Weekly", "Monthly", "Yearly"];
  // const categories = ["Food", "Beverage", "Clothing", "Electronics", "Books"];

  const [searchTerm, setSearchTerm] = useState(""); // 🔍 Search term state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [variants, setVariants] = useState([
    {
      ingredients: [{ value: "" }],
      selectedItems: [],
      isDropdownOpen: false,
      selectedCategory: "",
      addOns: [{ name: "", price: "" }],
    },
  ]);
  console.log("variants: ", variants);
  const dropdownRef = useRef([]);
  const inputRefs = useRef([]);

  const periods = ["Regular", "Jain", "Weekly", "Monthly", "Yearly"];
  const categories = ["Food", "Beverage", "Clothing", "Electronics", "Books"];

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        ingredients: [{ value: "" }],
        selectedItems: [],
        isDropdownOpen: false,
        selectedCategory: "",
        addOns: [{ name: "", price: "" }],
      },
    ]);
  };

  const handleDeleteVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSelect = (variantIndex, item) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              selectedItems: variant.selectedItems.includes(item)
                ? variant.selectedItems.filter((i) => i !== item)
                : [...variant.selectedItems, item],
            }
          : variant
      )
    );
  };

  const handleIngredientChange = (variantIndex, ingredientIndex, newValue) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].ingredients[ingredientIndex].value = newValue;
    setVariants(updatedVariants);
  };

  const addIngredient = (variantIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].ingredients.push({ value: "" });
    setVariants(updatedVariants);
  };

  const removeIngredient = (variantIndex, ingredientIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].ingredients = updatedVariants[
      variantIndex
    ].ingredients.filter((_, i) => i !== ingredientIndex);
    setVariants(updatedVariants);
  };

  useEffect(() => {
    variants.forEach((variant, vIndex) => {
      variant.ingredients.forEach((ingredient, iIndex) => {
        const input = inputRefs.current[`${vIndex}-${iIndex}`];
        if (input) {
          const tempSpan = document.createElement("span");
          tempSpan.style.visibility = "hidden";
          tempSpan.style.position = "absolute";
          tempSpan.style.font = window.getComputedStyle(input).font;
          tempSpan.innerText = ingredient.value || input.placeholder || "";
          document.body.appendChild(tempSpan);
          const newWidth = Math.max(tempSpan.offsetWidth + 30, 60);
          input.style.minWidth = `${newWidth}px`;
          document.body.removeChild(tempSpan);
        }
      });
    });
  }, [variants]);


  // add ons 

  const handleAddAddOn = (variantIndex) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              addOns: [...variant.addOns, { name: "", price: "" }], // ✅ Add a new add-on
            }
          : variant
      )
    );
  };
  
  const handleRemoveAddOn = (variantIndex, addOnIndex) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              addOns:
                variant.addOns.length > 1
                  ? variant.addOns.filter((_, index) => index !== addOnIndex) // ✅ Remove if more than one exists
                  : variant.addOns, // ✅ Prevent removing the last one
            }
          : variant
      )
    );
  };
  
  const handleAddOnChange = (variantIndex, addOnIndex, field, value) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              addOns: variant.addOns.map((addOn, j) =>
                j === addOnIndex ? { ...addOn, [field]: value } : addOn
              ),
            }
          : variant
      )
    );
  };
  
  

  // const handleSelect = (item) => {
  //   setselecteditmes((prev) => {
  //     if (Array.isArray(prev)) {
  //       return prev.includes(item)
  //         ? prev.filter((i) => i !== item) // Remove if selected
  //         : [...prev, item]; // Add if not selected
  //     } else {
  //       return [item]; // Reset to array if corrupted
  //     }
  //   });
  // };

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setIsDropdownOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  function getbysearch(e) {
    setSearchTerm(e.target.value);
    if (searchTerm.length > 1) {
      console.log("hello");
    }
  }
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
      price: sizePrice.current.value,
    };
    console.log("updatedData: ", updatedData);
    try {
      const response = await axios.post(
        `${baseUrl}/subscription/create`,
        updatedData
      );

      if (response.data.success) {
        toast.success(response.data.message || "Item added successfully!", {
          position: "top-right",
          autoClose: 1000,
          theme: "colored",
          style: {
            backgroundColor: "green",
            color: "#000",
          },
        });
        reset();
        setRating(0);
        setImagePreviews("");
        setTimeout(() => {
          navigate("/AllSubscriptions");
        }, 1000);
      }
    } catch (error) {
      console.error(
        "Error details:",
        error.response ? error.response.data : error
      );
      toast.error(
        error.response?.data?.message ||
          "Failed to submit the form. Please try again."
      );
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

  // const handleIngredientChange = (index, newValue) => {
  //   const updatedIngredients = [...ingredients];
  //   updatedIngredients[index].value = newValue;
  //   setIngredients(updatedIngredients);
  // };

  // const addIngredient = () => {
  //   setIngredients([...ingredients, { value: "" }]);
  // };

  // const removeIngredient = (index) => {
  //   const updatedIngredients = ingredients.filter((_, i) => i !== index);
  //   setIngredients(updatedIngredients);
  // };

  // useEffect(() => {
  //   ingredients.forEach((ingredient, index) => {
  //     const input = inputRefs.current[index];
  //     if (input) {
  //       const tempSpan = document.createElement("span");
  //       tempSpan.style.visibility = "hidden";
  //       tempSpan.style.position = "absolute";
  //       tempSpan.style.font = window.getComputedStyle(input).font;
  //       tempSpan.innerText = ingredient.value || input.placeholder || "";
  //       document.body.appendChild(tempSpan);
  //       const newWidth = Math.max(tempSpan.offsetWidth + 30, 60); // Add padding and set minimum width
  //       input.style.minWidth = `${newWidth}px`;
  //       document.body.removeChild(tempSpan);
  //     }
  //   });
  // }, [ingredients]);
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

                {/* Rating */}
                <div className="mb-4 rating d-flex align-items-center">
                  <label className="rating-label form-label">Ratings:</label>
                  <div className="rating-stars-container">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className={`rating-stars ${
                          index < ratings ? "selected" : ""
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
            <h3 className="variants-title mt-4">ADD ITEMS</h3>
            {/* Itmes Field */}

            {variants.map((variant, vIndex) => (
              <>
                <div
                  key={vIndex}
                  className="d-flex justify-content-around gap-3 "
                >
                  {/* Items Dropdown */}
                  <div className="mb-1 col-6">
                    <div
                      className="position-relative"
                      ref={(el) => (dropdownRef.current[vIndex] = el)}
                    >
                      <label className="form-label">Items:</label>
                      <div
                        className="form-control shadow cursor-pointer mt-2"
                        onClick={() =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === vIndex
                                ? { ...v, isDropdownOpen: !v.isDropdownOpen }
                                : v
                            )
                          )
                        }
                      >
                        {variant.selectedItems.length > 0
                          ? variant.selectedItems.join(", ")
                          : "Select Multiple Items"}{" "}
                        <MdOutlineKeyboardArrowDown />
                      </div>

                      {variant.isDropdownOpen && (
                        <div
                          className="position-absolute  items-dropdown border shadow w-100 mt-1 z-3"
                          style={{ backgroundColor: "#EEF4ED" }}
                        >
                          <div className="d-flex gap-2 mb-2 dropdown-search-container">
                            <input
                              type="text"
                              className="form-control dropdown-search"
                              placeholder="Search items..."
                              value={searchTerm}
                              onChange={(e) => getbysearch(e)}
                              style={{
                                backgroundColor: "#0B2545",
                                color: "white",
                              }}
                            />

                            <select
                              className="form-control"
                              value={variant.selectedCategory} // 👈 Bind value to variant's category
                              onChange={(e) => {
                                const updatedVariants = [...variants];
                                updatedVariants[vIndex].selectedCategory =
                                  e.target.value;
                                setVariants(updatedVariants);
                              }}
                            >
                              <option value="">Categories</option>
                              {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          {periods.map((item) => (
                            <div
                              key={item}
                              className="p-2 cursor-pointer d-flex align-items-center justify-content-between"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(vIndex, item);
                              }}
                            >
                              <input
                                type="checkbox"
                                className="me-2"
                                checked={variant.selectedItems.includes(item)}
                                readOnly
                              />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="add-ons mt-2 d-flex flex-column">
  <label className="form-label">Add Ons:</label>
  {variant.addOns.map((addOn, addOnIndex) => (
    <div key={addOnIndex} className="d-flex gap-2 mt-2 ">
      <input
        type="text"
        className="form-control shadow "
        placeholder="Name"
        value={addOn.name}
        onChange={(e) =>
          handleAddOnChange(vIndex, addOnIndex, "name", e.target.value)
        }
      />
      <input
        type="text"
        className="form-control shadow "
        placeholder="Price"
        value={addOn.price}
        onChange={(e) =>
          handleAddOnChange(vIndex, addOnIndex, "price", e.target.value)
        }
      />

      {/* Show - for all except first add-on */}
      {variant.addOns.length > 1 && (
        <FiMinusCircle
          className="fs-1 text-danger cursor-pointer"
          onClick={() => handleRemoveAddOn(vIndex, addOnIndex)}
        />
      )}

      {/* Show + only for last add-on */}
      {addOnIndex === variant.addOns.length - 1 && (
        <FiPlusCircle
          className="fs-1 text-primary cursor-pointer"
          onClick={() => handleAddAddOn(vIndex)}
        />
      )}
    </div>
  ))}
</div>

                  </div>

                  {/* Ingredients Field */}
                  <div className="mb-1 col-6">
                    <label className="form-label">Ingredients:</label>
                    <div className="d-flex flex-wrap align-items-center">
                      {variant.ingredients.map((ingredient, iIndex) => (
                        <div
                          key={iIndex}
                          className="d-flex align-items-center mt-2"
                        >
                          <div
                            className="input-group"
                            style={{ width: "auto" }}
                          >
                            <input
                              ref={(el) =>
                                (inputRefs.current[`${vIndex}-${iIndex}`] = el)
                              }
                              type="text"
                              className="form-control shadow"
                              placeholder="Add Ingredient"
                              value={ingredient.value}
                              onChange={(e) =>
                                handleIngredientChange(
                                  vIndex,
                                  iIndex,
                                  e.target.value
                                )
                              }
                              style={{
                                width: "60px",
                                transition: "width 0.2s ease",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-link p-2"
                              onClick={() =>
                                iIndex === variant.ingredients.length - 1
                                  ? addIngredient(vIndex)
                                  : removeIngredient(vIndex, iIndex)
                              }
                            >
                              {iIndex === variant.ingredients.length - 1 ? (
                                <FiPlusCircle className="fs-5 text-primary" />
                              ) : (
                                <FiMinusCircle className="fs-5 text-danger" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                      
                  {/* Delete Variant Button */}
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    className="btn mb-2"
                    onClick={() => handleDeleteVariant(vIndex)}
                  >
                    <FiMinusCircle className="text-danger  fs-5" />
                    <b className="ms-2">Remove Variant</b>
                  </button>
                )}
                <hr className="edit-hr" />
              </>
            ))}

            {/* Add Variant Button */}
            <button
              type="button"
              className="add-variant-btn d-block  my-2"
              onClick={handleAddVariant}
            >
              + ADD ITEMS
            </button>
            <h3 className="variants-title mt-4">ADD ITEMS</h3>
            {/* Variants Section */}

            <div className="row">
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
                  value={sizeId}
                  onChange={(e) => setsizeId(e.target.value)}
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

              <div
                className="col-md-3 mb-3 position-relative "
              >
                <h5>Timing : </h5>
                <div className="position-absolute bg-white   form-control  mt-4 bg-transparent ">
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
                      checked={selectedtimePeriods.includes(
                        "9:00 AM TO 10:00 AM"
                      )}
                      onChange={() => {}}
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
                      onChange={() => {}}
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
                      checked={selectedtimePeriods.includes(
                        "1:30 AM TO 2:30 AM"
                      )}
                      onChange={() => {}}
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
                      checked={selectedtimePeriods.includes(
                        "3:00 AM TO 4:00 AM"
                      )}
                      onChange={() => {}}
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
                      checked={selectedtimePeriods.includes(
                        "4:00 AM TO 5:00 AM"
                      )}
                      {...register("itemName")}
                      onChange={() => {}}
                    />
                    <span>4:00 AM TO 5:00 AM</span>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3 ">
                <label className="form-label">Period :</label>
                <div className=" position-relative form-control ">
                  <div
                    className="  bg-transparent  w-100 mt-1"
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
                        onChange={() => {}}
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
                        onChange={() => {}}
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
