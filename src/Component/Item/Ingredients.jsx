import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { RiSortAsc } from "react-icons/ri";
import { RiSortDesc } from "react-icons/ri";
import { ToastContainer, toast } from "react-toastify";
import { Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Ingredients() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [search, setSearch] = useState("");
    const [ingredients, setIngredients] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedfirstCategory, setSelectedfirstCategory] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selecteddate, setSelecteddate] = useState("");

    console.log("selectedCategory: ", selectedCategory);
    console.log("ingredients: ", ingredients);
    const [newIngredient, setNewIngredient] = useState({
        name: "",
        categoryId: "",
    });
    console.log("newIngredient: ", newIngredient);
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [categoris, setcategoris] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    console.log("currentPage: ", currentPage);
    const [limit, setLimit] = useState(10);
    console.log("limit: ", limit);
    const [totalItems, setTotalItems] = useState(0);
    console.log("totalItems: ", totalItems);
    console.log("categoris: ", categoris);
    const [sort, setsort] = useState("asc");
    console.log("sort: ", sort);
    const allfiltermethod = {
        category: selectedCategory,
        dateRange: selecteddate,
        page: currentPage,
        sort: sort,
        limit: limit,
        search: search.length > 2 ? search : "",
    };

    const queryParams = new URLSearchParams(allfiltermethod).toString();
    const fetchIngredients = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/ingredient/list?${queryParams}`
            );
            console.log("response--------------------------:-> ", response);
            setIngredients(response.data.data.ingredients);
            setTotalItems(ingredients.length);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
        }
    };
    async function getcategoris() {
        const categori = await axios.get(
            `${API_URL}/admin/ingredient/categories-list`
        );
        setcategoris(categori.data.data.categories);
    }
    useEffect(() => {
        getcategoris();
    }, []);
    useEffect(() => {
        fetchIngredients();
    }, [selectedCategory, selecteddate, currentPage, limit, search, sort]); // Jab bhi category ya date change ho tab API call hoga

    const addIngredient = async () => {
        if (!newIngredient.name || !newIngredient.categoryId) {
            alert("Please enter all fields");
            return;
        }
        const ingredientData = {
            ...newIngredient,
            categoryId: newIngredient.categoryId,
        };

        try {
            const response = await axios.post(
                `${API_URL}/ingredient/create`,
                ingredientData
            );
            console.log("Added Ingredient Response:", response.data);
            if (response.data && response.data.data) {
                setIngredients([...ingredients, response.data.data]);
            }
            setNewIngredient({ name: "", categoryId: "" });
            fetchIngredients();
            setSelectedfirstCategory(null);
        } catch (error) {
            console.error("Error adding ingredient:", error);
        }
    };

    // Edit Ingredient (Set ingredient for editing)
    const editIngredient = (ingredient) => {
        setEditingIngredient(ingredient);
        setNewIngredient({
            name: ingredient.name,
            categoryId: ingredient.categoryId._id, // Ensure correct category ID
        });

        // ✅ Set the selected category for the dropdown
        const selectedCategory = categoris.find(cat => cat._id === ingredient.categoryId._id);
        setSelectedfirstCategory(selectedCategory || null);
    };


    // Update Ingredient (PUT Request)
    const updateIngredient = async () => {
        if (!newIngredient.name || !newIngredient.categoryId) {
            alert("Please enter all fields");
            return;
        }

        try {
            await axios.put(
                `${API_URL}/ingredient/update/${editingIngredient._id}`,
                newIngredient
            );
            setIngredients(
                ingredients.map((item) =>
                    item.id === editingIngredient._id
                        ? { ...item, ...newIngredient }
                        : item
                )
            );
            setNewIngredient({ name: "", categoryId: "" });
            setEditingIngredient(null); setSelectedfirstCategory(null);
            fetchIngredients();
            toast.success("Ingredient update Successfully", {
                position: "top-right",
                autoClose: 2000,
                closeOnClick: false,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        } catch (error) {
            console.error("Error updating ingredient:", error);
        }
    };
    // Delete Ingredient
    const deleteIngredient = async (id) => {
        try {
            await axios.delete(`${API_URL}/ingredient/delete/${id}`);
            setIngredients(ingredients.filter((item) => item.id !== id));
            fetchIngredients();
            toast.success(" deleted ingredient Successfully", {
                position: "top-right",
                autoClose: 2000,
                closeOnClick: false,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        } catch (error) {
            console.error("Error deleting ingredient:", error);
            toast.error("Error deleting ingredient ", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    };

    const handleSelectCategory = (category) => {
        setSelectedfirstCategory(category);
        setNewIngredient((prev) => ({
            ...prev,
            categoryId: category._id, // Ensure category ID updates correctly
        }));
        setShowDropdown(false);
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`${API_URL}/admin/ingredient/categories-delete/${id}`);
            getcategoris(); // API se latest data lana
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };
    function Addfilter(e) {
        setSelectedCategory(e.target.value);
    }
    function adddate(e) {
        setSelecteddate(e.target.value);
    }
    const convertToIST = (utcTime) => {
        const options = {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour12: true,
        };
        return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
    };
    const [newCategory, setNewCategory] = useState("");
    const [showInput, setShowInput] = useState(false);
    const handleAddCategory = async () => {
        if (newCategory.trim() !== "") {
            try {
                await axios.post(`${API_URL}/admin/ingredient/categories`, {
                    title: newCategory,
                });
                await getcategoris();
                setNewCategory("");
                setShowInput(false);
            } catch (error) {
                console.error("Error adding new category:", error);
            }
        }
    };

    //!------------------- paginarion------------------------
    const Pagination = () => {
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (currentPage - 1) * limit + 1;
        const endIndex = Math.min(currentPage * limit, totalItems);
        const isNextButtonDisabled = totalItems < limit;
        return (
            <div className="pagination-container d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <span className="showing-text">
                        Showing {startIndex}-{endIndex} Of
                        <select
                            className="me-1 text-center customselect "
                            value={limit}
                            style={{
                                width: "-80px",
                                border: "none",
                                backgroundColor: "#EEF4ED",
                                color: "#0B2545",
                            }}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        Items
                    </span>
                </div>
                <div className="pagination-controls">
                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft />
                    </button>
                    <span
                        style={{
                            fontWeight: "bold",
                            backgroundColor: "#8DA9C4",
                            color: "#0B2545",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {currentPage}
                    </span>
                    <button
                        className="pagination-button"
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev + 1, totalPages))
                        }
                        disabled={isNextButtonDisabled}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        );
    };

    //!------------------ paginarion end here -------------------

    return (
        <>
            <div className="ingredients-container">
                <div className="ingredients-card">
                    <div className="ingredients-header">
                        <h2 className="ingredients-title">Ingredients Management</h2>
                        <div className="ingredients-form">
                            <input
                                type="text"
                                placeholder="e.g. Apple"
                                className="input-field"
                                value={newIngredient.name}
                                onChange={(e) =>
                                    setNewIngredient({ ...newIngredient, name: e.target.value })
                                }
                            />

                            <div className="custom-dropdown">
                                <button
                                    className="dropdown-btn"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    {selectedfirstCategory
                                        ? selectedfirstCategory.title
                                        : "Select Category"}{" "}
                                    ⬇
                                </button>
                                {showDropdown && (
                                    <div className="dropdown-content">
                                        {/* ✅ Category List with Delete Button */}
                                        {categoris.map((category) => (
                                            <div className="d-flex justify-content-between p-2">
                                                <div
                                                    key={category._id}
                                                    className="category-item f-2"
                                                    onClick={() => handleSelectCategory(category)}
                                                >
                                                    <span>{category.title}</span>
                                                </div>
                                                <button
                                                    className="deletes-btn"
                                                    onClick={() => deleteCategory(category._id)}
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ))}

                                        {/* ✅ Add New Category */}
                                        <div className="add-category">
                                            <input
                                                type="text"
                                                placeholder="Enter new category"
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                            />
                                            <button
                                                className="add-button"
                                                onClick={handleAddCategory}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {editingIngredient ? (
                                <button className="add-button" onClick={updateIngredient}>
                                    UPDATE
                                </button>
                            ) : (
                                <button className="add-button" onClick={addIngredient}>
                                    ADD
                                </button>
                            )}
                        </div>

                        {/* Search Bar */}
                        <hr />
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="input-field"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <h1
                                onClick={() =>
                                    setsort((pre) => (pre === "asc" ? "desc" : "asc"))
                                }
                                style={{ cursor: "pointer" }}
                            >
                                {sort === "asc" ? <RiSortAsc /> : <RiSortDesc />}
                            </h1>
                            <select
                                className="form-select custom-select text-center"
                                value={selectedCategory}
                                onChange={(e) => Addfilter(e)}
                            >
                                <option value="">All</option>
                                {categoris.map((v, i) => (
                                    <option key={v._id} value={v.title}>
                                        {v.title}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="form-select custom-select text-center"
                                onChange={(e) => adddate(e)}
                                value={selecteddate}
                            >
                                <option value="all">All</option>
                                <option value="Last 7 days">Last 7 days</option>
                                <option value="Last 1 month">Last 1 month</option>
                                <option value="Last 3 months">Last 3 months</option>
                                <option value="Last 7 months">Last 7 months</option>
                            </select>
                        </div>
                    </div>

                    {/* Ingredients Table */}
                    <table className="ingredients-table">
                        <thead>
                            <tr>
                                <th>Ingredient Name</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.categoryId.title}</td>
                                    <td>{convertToIST(item.createdAt)}</td>
                                    <td className="action-buttons">
                                        <button
                                            className="edit-button"
                                            onClick={() => editIngredient(item)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => deleteIngredient(item._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination />
            <ToastContainer />
        </>
    );
}

export default Ingredients