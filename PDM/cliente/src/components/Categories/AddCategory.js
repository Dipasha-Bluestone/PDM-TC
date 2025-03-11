import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Form, Dropdown } from "react-bootstrap";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import axios from "axios";

const AddCategoryModal = ({ show, handleClose,user}) => {
    const [newCategory, setNewCategory] = useState({
        type: "",
        category: "",
        subcategory: "",
    });
    const [types, setTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);

    const dropdownRef = useRef(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const res = await axios.get("http://localhost:5000/types");
            setTypes(res.data);
        } catch (error) {
            console.error("Error fetching types:", error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowTypeDropdown(false);
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchParentCategories = async (typeName) => {
        console.log("Fetching parent categories for type:", typeName);
        try {
            const res = await axios.get(`http://localhost:5000/parents/${typeName}`, {
                headers: { Authorization: `Bearer ${token}` }
            }); 

            console.log("Parent categories fetched:", res.data);
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching parent categories:", error.response ? error.response.data : error);
        }
    };


    const handleTypeSelection = (typeName) => {
        console.log("Selected Type:", typeName); // Debugging
        if (!typeName) {
            console.error("Error: Type is undefined or empty");
            return;
        }

        setNewCategory((prev) => ({ ...prev, type: typeName }));

        fetchParentCategories(typeName);
    };


    const handleCategorySelection = (selectedCategory) => {
        setNewCategory((prev) => ({
            ...prev,
            category: selectedCategory.id, 
            categoryName: selectedCategory.name, 
            subcategory: "", 
        }));
    };

    const handleAddCategory = async () => {
        try {
            let parent_id = newCategory.category ? parseInt(newCategory.category, 10) : null;
            let name = newCategory.subcategory || newCategory.categoryName;

            if (!name) {
                console.error("Error: Name cannot be empty.");
                return;
            }

            const response = await axios.post(
                "http://localhost:5000/categories",
                {
                    name,
                    type: newCategory.type,
                    parent_id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Category added:", response.data);
            handleClose();
        } catch (error) {
            console.error("Error adding category:", error.response?.data || error.message);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Type Dropdown */}
                <Dropdown show={showTypeDropdown} ref={dropdownRef}>
                    <Form.Control
                        type="text"
                        placeholder="Select or type Type"
                        value={newCategory.type}
                        onChange={(e) => handleTypeSelection(e.target.value)}
                        onFocus={() => setShowTypeDropdown(true)}
                    />
                    <Dropdown.Menu className="w-100" style={{ maxHeight: "250px", overflowY: "auto" }}>
                        {types.map((t, index) => (
                            <Dropdown.Item key={index} onClick={() => handleTypeSelection(t)} onMouseDown={(e) => {
                                e.preventDefault(); // Prevent Bootstrap dropdown from closing
                                handleTypeSelection(t.name || t);
                            }}>
                                {t}
                            </Dropdown.Item>
                        ))}

                    </Dropdown.Menu>
                </Dropdown>

                {/* Category Dropdown (Filtered by Type) */}
                <Dropdown show={showCategoryDropdown} ref={dropdownRef} className="mt-2">
                    <Form.Control
                        type="text"
                        placeholder="Select or type Category"
                        value={newCategory.categoryName || ""}
                        onChange={(e) =>
                            setNewCategory((prev) => ({
                                ...prev,
                                categoryName: e.target.value,
                            }))
                        }
                        onFocus={() => setShowCategoryDropdown(true)}
                    />
                    <Dropdown.Menu className="w-100" style={{ maxHeight: "250px", overflowY: "auto" }}>
                        {categories.map((c) => (
                            <Dropdown.Item
                                key={c.id}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleCategorySelection(c);
                                    setShowCategoryDropdown(false);
                                }}
                            >
                                {c.name}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                {/* Subcategory Dropdown */}
                <Dropdown show={showSubcategoryDropdown} ref={dropdownRef} className="mt-2">
                    <Form.Control
                        type="text"
                        placeholder="Type Subcategory (Optional)"
                        value={newCategory.subcategory || ""}
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, subcategory: e.target.value }))}
                        onFocus={() => setShowSubcategoryDropdown(true)}
                    />
                </Dropdown>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAddCategory}>
                    Add Category
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
export default AddCategoryModal;
