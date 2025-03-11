import React, { useState, useEffect, useRef } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown, Button, Form } from "react-bootstrap";

const ProductTypeSelector = ({ onProductTypeChange, onSubcategoryChange, user }) => {
    const [productTypes, setProductTypes] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedParent, setSelectedParent] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [newProductType, setNewProductType] = useState("");
    const [newSubcategory, setNewSubcategory] = useState("");
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSubDropdown, setShowSubDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchProductTypes = async () => {
            try {
                if (!token) return;
                const response = await fetch(`http://localhost:5000/product_types/parents`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error("Failed to fetch product types");
                const data = await response.json();
                setProductTypes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching product types:", err);
                setProductTypes([]);
            }
        };
        if (user) fetchProductTypes();
    }, [user]);

    useEffect(() => {
        if (selectedParent) {
            fetch(`http://localhost:5000/product_types/${selectedParent}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setSubcategories(data))
                .catch(() => setError("Error fetching subcategories"));
        } else {
            setSubcategories([]);
        }
    }, [selectedParent]);

    // Handle Product Type Selection
    const handleParentSelection = (name) => {
        setNewProductType(name);
        setShowDropdown(false);

        const matched = productTypes.find(pt => pt.name.toLowerCase() === name.toLowerCase());
        if (matched) {
            setSelectedParent(matched.id);
            onProductTypeChange(matched.id);
        } else {
            setSelectedParent(""); // Reset if it's a new entry
            onProductTypeChange("");
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
                setShowSubDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubcategorySelection = (name) => {
        setNewSubcategory(name);
        setShowSubDropdown(false);

        const matched = subcategories.find(sub => sub.name.toLowerCase() === name.toLowerCase());
        if (matched) {
            setSelectedSubcategory(matched.id);
            onSubcategoryChange(matched.id); // Send subcategory back
        } else {
            setSelectedSubcategory("");
            onSubcategoryChange(null);
        }
    };

    const handleAddProductType = async () => {
        if (!newProductType.trim()) return;
        try {
            const response = await fetch("http://localhost:5000/product_types", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newProductType, parent_id: null }),
            });

            if (response.ok) {
                const newType = await response.json();
                setProductTypes([...productTypes, newType]);
                setSelectedParent(newType.id);
                setNewProductType("");
            }
        } catch {
            setError("Error adding product type");
        }
    };

    const handleEditSubmit = async () => {
        if (!editName.trim() || !editId) return;
        try {
            const response = await fetch(`http://localhost:5000/category/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: editName }),
            });

            if (response.ok) {
                const updated = await response.json();
                setProductTypes(productTypes.map(pt => (pt.id === updated.id ? updated : pt)));
                setSubcategories(subcategories.map(sub => (sub.id === updated.id ? updated : sub)));
                setEditId(null);
                setEditName("");
            }
        } catch {
            setError("Error updating product type");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const response = await fetch(`http://localhost:5000/category/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setProductTypes(productTypes.filter(pt => pt.id !== deleteId));
                setSubcategories(subcategories.filter(sub => sub.id !== deleteId));
                setDeleteId(null);
            }
        } catch {
            setError("Error deleting product type");
        }
    };

    const handleAddSubcategory = async () => {
        if (!newSubcategory.trim() || !selectedParent) return;
        try {
            const response = await fetch(`http://localhost:5000/product_types`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newSubcategory, parent_id: selectedParent }),
            });
    if (response.ok) {
        const newSub = await response.json();
        setSubcategories([...subcategories, newSub]);
        setSelectedSubcategory(newSub.id);
        setNewSubcategory("");
    }
} catch {
    setError("Error adding subcategory");
}
    };

    return (
        <div>
            <Dropdown show={showDropdown} ref={dropdownRef}>
                {/* Input Field (Toggles Dropdown on Focus) */}
                <Form.Control
                    type="text"
                    placeholder="Select or type product type"
                    value={newProductType}  // Show selected name
                    onChange={(e) => handleParentSelection(e.target.value)} // Call handleParentSelection
                    onFocus={() => setShowDropdown(true)} // Open dropdown on focus
                />

                {/* Dropdown Menu */}
                <Dropdown.Menu
                    className="w-100 overflow-auto"
                    style={{ maxHeight: "250px", width: "100%" }}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent dropdown from closing when clicking inside
                >
                    {productTypes.map((pt) => (
                        <Dropdown.Item
                            key={pt.id}
                            className="d-flex justify-content-between align-items-center"
                            onClick={() => {
                                handleParentSelection(pt.name); // Select product type
                                setShowDropdown(false); // Close dropdown after selection
                            }}
                        >
                            {editId === pt.id ? (
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={handleEditSubmit} // Call handleEditSubmit when clicking away
                                    autoFocus
                                />
                            ) : (
                                <span>{pt.name}</span>
                            )}
                            <div>
                                <FaPencilAlt
                                    className="text-primary mx-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditId(pt.id);
                                    }}
                                />
                                <FaTrash
                                    className="text-danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteId(pt.id);
                                    }}
                                />
                            </div>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            {/* Add Button */}
            <Button variant="success" onClick={handleAddProductType}>+</Button>

            {/* Subcategory Dropdown */}
            {selectedParent && (
                <Dropdown show={showSubDropdown} ref={dropdownRef}>
                    {/* Input Field (Toggles Dropdown on Focus) */}
                    <Form.Control
                        type="text"
                        placeholder="Select or type subcategory"
                        value={newSubcategory}  // Show selected name
                        onChange={(e) => handleSubcategorySelection(e.target.value)} // Update input value
                        onFocus={() => setShowSubDropdown(true)} // Open dropdown on focus
                    />

                    {/* Dropdown Menu */}
                    <Dropdown.Menu
                        className="w-100 overflow-auto"
                        style={{ maxHeight: "250px", width: "80%" }}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent dropdown from closing when clicking inside
                    >
                        {subcategories.map((sub) => (
                            <Dropdown.Item
                                key={sub.id}
                                className="d-flex justify-content-between align-items-center"
                                onClick={() => {
                                    handleSubcategorySelection(sub.name); // Select subcategory
                                    setShowSubDropdown(false); // Close dropdown after selection
                                }}
                            >
                                {editId === sub.id ? (
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={handleEditSubmit} // Call handleEditSubmit on blur
                                        autoFocus
                                    />
                                ) : (
                                    <span>{sub.name}</span>
                                )}
                                <div>
                                    <FaPencilAlt
                                        className="text-primary mx-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditId(sub.id, sub.name);
                                        }}
                                    />
                                    <FaTrash
                                        className="text-danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteId(sub.id);
                                        }}
                                    />
                                </div>
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>

                    {/* Add Button */}
                    <Button className="btn btn-success" onClick={handleAddSubcategory}>+</Button>
                </Dropdown>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="modal show d-block">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete this Product Type?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductTypeSelector;
