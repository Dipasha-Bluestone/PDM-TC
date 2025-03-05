import React, { useState, useEffect, useRef } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown, Button, Form } from "react-bootstrap";

const DesignTypeSelector = ({ onDesignTypeChange, user }) => {
    const [designtypes, setDesignTypes] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedParent, setSelectedParent] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [newDesignType, setNewDesignType] = useState("");
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
        const fetchDesignTypes = async () => {
            try {
                if (!token) return;
                const response = await fetch(`http://localhost:5000/designtypes/parents`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error("Failed to fetch DesignTypes");
                const data = await response.json();
                setDesignTypes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching DesignTypes:", err);
                setDesignTypes([]);
            }
        };
        if (user) fetchDesignTypes();
    }, [user]);

    useEffect(() => {
        if (selectedParent) {
            fetch(`http://localhost:5000/designtypes/${selectedParent}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setSubcategories(data))
                .catch(() => setError("Error fetching subcategories"));
        } else {
            setSubcategories([]);
        }
    }, [selectedParent]);

    // Handle DesignType Selection
    const handleParentSelection = (name) => {
        setNewDesignType(name);
        setShowDropdown(false);

        const matched = designtypes.find(pt => pt.name.toLowerCase() === name.toLowerCase());
        if (matched) {
            setSelectedParent(matched.id);
            onDesignTypeChange(matched.id);
        } else {
            setSelectedParent(""); // Reset if it's a new entry
            onDesignTypeChange("");
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

    const handleAddDesignType = async () => {
        if (!newDesignType.trim()) return;
        try {
            const response = await fetch("http://localhost:5000/designtypes", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newDesignType, parent_id: null }),
            });

            if (response.ok) {
                const newType = await response.json();
                setDesignTypes([...designtypes, newType]);
                setSelectedParent(newType.id);
                setNewDesignType("");
            }
        } catch {
            setError("Error adding design type");
        }
    };

    const handleEditSubmit = async () => {
        if (!editName.trim() || !editId) return;
        try {
            const response = await fetch(`http://localhost:5000/categories/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: editName }),
            });

            if (response.ok) {
                const updated = await response.json();
                setDesignTypes(designtypes.map(pt => (pt.id === updated.id ? updated : pt)));
                setSubcategories(subcategories.map(sub => (sub.id === updated.id ? updated : sub)));
                setEditId(null);
                setEditName("");
            }
        } catch {
            setError("Error updating design type");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const response = await fetch(`http://localhost:5000/categories/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setDesignTypes(designtypes.filter(pt => pt.id !== deleteId));
                setSubcategories(subcategories.filter(sub => sub.id !== deleteId));
                setDeleteId(null);
            }
        } catch {
            setError("Error deleting design type");
        }
    };

    const handleAddSubcategory = async () => {
        if (!newSubcategory.trim() || !selectedParent) return;
        try {
            const response = await fetch(`http://localhost:5000/designtypes`, {
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
                    placeholder="Select or type design type"
                    value={newDesignType}  // Show selected name
                    onChange={(e) => handleParentSelection(e.target.value)} // Call handleParentSelection
                    onFocus={() => setShowDropdown(true)} // Open dropdown on focus
                />

                {/* Dropdown Menu */}
                <Dropdown.Menu
                    className="w-100 overflow-auto"
                    style={{ maxHeight: "250px", width: "100%" }}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent dropdown from closing when clicking inside
                >
                    {designtypes.map((pt) => (
                        <Dropdown.Item
                            key={pt.id}
                            className="d-flex justify-content-between align-items-center"
                            onClick={() => {
                                handleParentSelection(pt.name); 
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
            <Button variant="success" onClick={handleAddDesignType}>+</Button>

            {/* Subcategory Dropdown */}
            {selectedParent && (
                <Dropdown show={showSubDropdown} ref={dropdownRef}>
                    {/* Input Field (Toggles Dropdown on Focus) */}
                    <Form.Control
                        type="text"
                        placeholder="Select or type subcategory"
                        value={newSubcategory}  // Show selected name
                        onChange={(e) => setNewSubcategory(e.target.value)} // Update input value
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
                                    setNewSubcategory(sub.name); // Select subcategory
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
                                Are you sure you want to delete this DesignType?
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

export default DesignTypeSelector;
