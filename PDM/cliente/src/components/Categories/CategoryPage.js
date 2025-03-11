import React, { useState, useEffect } from "react";
import { Button, ListGroup, Card, Modal, Form,Dropdown } from "react-bootstrap";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchCategories();
        fetchTypes();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get("http://localhost:5000/categories", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setLoading(false);
        }
    };

    const fetchTypes = async () => {
        try {
            const res = await axios.get("http://localhost:5000/types");
            setTypes(res.data);
        } catch (error) {
            console.error("Error fetching types:", error);
        }
    };

    // Open edit modal
    const handleEdit = (category) => {
        setSelectedCategory(category);
        setNewCategoryName(category.name);
        setShowEditModal(true);
    };

    // Update category name
    const handleUpdate = async () => {
        if (!selectedCategory) return;

        try {
            await axios.put(
                `http://localhost:5000/categories/${selectedCategory.id}`,
                { name: newCategoryName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchCategories(); // Refresh categories
            setShowEditModal(false);
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };

    // Delete category
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            await axios.delete(`http://localhost:5000/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCategories(); // Refresh categories
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const handleEditType = (oldType) => {
        const newType = prompt("Enter new type name:", oldType);
        if (newType && newType !== oldType) {
            axios
                .put(`http://localhost:5000/types/${encodeURIComponent(oldType)}`, { newType },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                .then(() => fetchTypes()) // Refresh list after update
                .catch((error) => console.error("Error updating type:", error));
        }
    };

    const handleDeleteType = (type) => {
        if (window.confirm(`Are you sure you want to delete type "${type}"?`)) {
            axios
                .delete(`http://localhost:5000/types/${encodeURIComponent(type)}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                .then(() => fetchTypes()) // Refresh list after deletion
                .catch((error) => console.error("Error deleting type:", error));
        }
    };

    return (
        <div className="container mt-4">
            <h2>Categories</h2>
            {loading ? <p>Loading categories...</p> : null}

            {types.map((type) => (
                <Card key={type} className="mb-3">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">{type}</h4>
                        <div>
                            <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditType(type)}>
                                <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteType(type)}>
                                <FaTrash />
                            </Button>
                        </div>
                    </Card.Header>
                    <ListGroup variant="flush">
                        {categories
                            .filter((cat) => cat.type === type && !cat.parent_id) // Parent categories
                            .map((parent) => (
                                <ListGroup.Item key={parent.id}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <strong>{parent.name}</strong>
                                        <div>
                                            <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(parent)}>
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(parent.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Check if subcategories exist before accessing length */}
                                    {categories
                                        .filter((cat) => cat.parent_id === parent.id) // Get subcategories
                                        .length > 0 ? (
                                        <ListGroup className="mt-2">
                                            {categories
                                                .filter((cat) => cat.parent_id === parent.id) // Get subcategories again
                                                .map((sub) => (
                                                    <ListGroup.Item key={sub.id} className="ms-4 d-flex justify-content-between align-items-center">
                                                        {sub.name}
                                                        <div>
                                                            <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(sub)}>
                                                                <FaEdit />
                                                            </Button>
                                                            <Button variant="danger" size="sm" onClick={() => handleDelete(sub.id)}>
                                                                <FaTrash />
                                                            </Button>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))}
                                        </ListGroup>
                                    ) : (
                                        <p className="text-muted ms-4">No subcategories</p>
                                 )}
                                </ListGroup.Item>
                            ))}
                    </ListGroup>
                </Card>
            ))}
            {/* Edit Category Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleUpdate}>
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default CategoryPage;
