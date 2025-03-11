import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./InputDesign.css";

const InputDesign = ({ user, setUser }) => {
    const [designNumber, setDesignNumber] = useState("");
    const [designImage, setDesignImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [designDimensions, setDesignDimensions] = useState("");
    const [textNotes, setTextNotes] = useState("");
    const [cadFile, setCadFile] = useState(null);
    const [modelSheet, setModelSheet] = useState(null);
    const [otherFiles, setOtherFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState({});
    const [selectedType, setSelectedType] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newSubcategory, setNewSubcategory] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:5000/categories", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategories(response.data);
                //console.log("Fetched categories:", response.data); // Debugging
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        const fetchTypes = async () => {
            try {
                const response = await axios.get("http://localhost:5000/types", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTypes(response.data);
                //console.log("Fetched types:", response.data); // Debugging
            } catch (error) {
                console.error("Error fetching types:", error);
            }
        };
        fetchTypes();
        fetchCategories();
    }, [token]);

    // Metal State and Functions
    const [metals, setMetals] = useState([]);
    const addMetal = () => setMetals([...metals, { metal_name: "", metal_weight: "" }]);
    const updateMetal = (index, field, value) => {
        const updatedMetals = [...metals];
        updatedMetals[index][field] = value;
        setMetals(updatedMetals);
    };
    const removeMetal = (index) => setMetals(metals.filter((_, i) => i !== index));

    // Gem State and Functions
    const [gems, setGems] = useState([]);
    const addGem = () => setGems([...gems, { gem: "", shape: "", size: "", count: "", carat_per_gem: "", dimensions: "", setting: "" }]);
    const updateGem = (index, field, value) => {
        const updatedGems = [...gems];
        updatedGems[index][field] = value;
        setGems(updatedGems);
    };
    const removeGem = (index) => setGems(gems.filter((_, i) => i !== index));

    const handleAddCategory = async (type) => {
        if (!newCategory) return;

        try {
            const response = await axios.post(
                "http://localhost:5000/categories",
                { name: newCategory, type, parent_id: null }, // Add category under a type
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCategories([...categories, response.data]);
            setSelectedCategory(response.data.id); // Auto-select the new category
            setNewCategory("");
        } catch (error) {
            console.error("Error adding new category:", error);
        }
    };

    const handleAddSubcategory = async (parentId) => {
        if (!newSubcategory) return;

        try {
            const response = await axios.post(
                "http://localhost:5000/categories",
                { name: newSubcategory, parent_id: parentId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCategories([...categories, response.data]);

            setSelectedSubcategory((prev) => ({
                ...prev,
                [selectedType]: {
                    ...prev[selectedType],
                    [parentId]: response.data.id, // Store per type & category
                },
            }));

            setNewSubcategory("");
        } catch (error) {
            console.error("Error adding new subcategory:", error);
        }
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDesignImage(file);
            setImagePreview(URL.createObjectURL(file)); // Generate preview URL
        }
    };  

    // Form Submission
    const onSubmitForm = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("design_number", designNumber);
        formData.append("design_image", designImage);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("design_dimensions", designDimensions);
        formData.append("text_notes", textNotes);
        formData.append("metals", JSON.stringify(metals));
        formData.append("gems", JSON.stringify(gems));
        if (cadFile) formData.append("cad_file", cadFile);
        if (modelSheet) formData.append("model_sheet", modelSheet);
        otherFiles.forEach((file) => formData.append("other_files", file));

        try {
            const response = await fetch("http://localhost:5000/designs", {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (response.ok) {
                alert("Design uploaded successfully!");
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (err) {
            console.error("Error uploading design:", err);
        }
    };

    return (
        <div>
            <Navbar user={user} handleLogout={handleLogout} />
            <div className="container mt-4">
                <h1 className="text-center">Bill of Material</h1>

                <form className="mt-5" onSubmit={onSubmitForm} encType="multipart/form-data">
                    <div className="container">
                        <div className="row">
                            {/* Left Column */}
                            <div className="col-md-6 left-column">
                                <input type="text" className="form-control" placeholder="Design Number" value={designNumber} onChange={(e) => setDesignNumber(e.target.value)} required />
                                <input type="number" className="form-control" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                                <textarea className="form-control" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                                <input type="text" className="form-control" placeholder="Design Dimensions" value={designDimensions} onChange={(e) => setDesignDimensions(e.target.value)} required />

                                {/* Category Section */}
                                {categories.length > 0 && (
                                    <div>
                                        <h3>Category</h3>
                                        {types.map((type) => (
                                            <div key={type} className="mb-4">
                                                <h5>{type}</h5>
                                                <select className="form-control" value={selectedCategory[type] || ""} onChange={(e) => setSelectedCategory((prev) => ({ ...prev, [type]: e.target.value }))}>
                                                    <option value="">Select a Category</option>
                                                    {categories.filter((cat) => cat.type === type && !cat.parent_id).map((parent) => (
                                                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                                                    ))}
                                                    <option value="add_new">+ Add New Category</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Metal Details */}
                                <h3>Metal Details</h3>
                                {metals.map((metal, index) => (
                                    <div key={index}>
                                        <input type="text" className="form-control" placeholder="Metal Name" value={metal.metal_name} onChange={(e) => updateMetal(index, "metal_name", e.target.value)} required />
                                        <input type="number" className="form-control" placeholder="Metal Weight" value={metal.metal_weight} onChange={(e) => updateMetal(index, "metal_weight", e.target.value)} required />
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeMetal(index)}>Remove</button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-primary" onClick={addMetal}>Add Metal</button>

                                {/* Gem Details */}
                                <h3 className="mt-4">Gem Details</h3>
                                {gems.map((gem, index) => (
                                    <div key={index}>
                                        <input type="text" className="form-control" placeholder="Gem Type" value={gem.gem} onChange={(e) => updateGem(index, "gem", e.target.value)} required />
                                        <input type="text" className="form-control" placeholder="Shape" value={gem.shape} onChange={(e) => updateGem(index, "shape", e.target.value)} required />
                                        <input type="text" className="form-control" placeholder="Size" value={gem.size} onChange={(e) => updateGem(index, "size", e.target.value)} required />
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeGem(index)}>Remove</button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-primary" onClick={addGem}>Add Gem</button>
                            </div>

                            {/* Right Column */}
                            <div className="col-md-6 right-column">
                                <h3>Upload Image</h3>
                                {/* Image Upload */}
                                <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} required />
                                {imagePreview && (
                                    <div className="image-preview mt-3">
                                        <img src={imagePreview} alt="Preview" className="img-thumbnail" />
                                    </div>
                                )}

                                <h3 className="mt-4">Upload Files</h3>
                                <input type="file" className="form-control" accept=".cad,.stp,.step,.3dm,.stl" onChange={(e) => setCadFile(e.target.files[0])} />
                                <input type="file" className="form-control" accept=".pdf,.jpg,.png" onChange={(e) => setModelSheet(e.target.files[0])} />
                                <input type="file" className="form-control" multiple onChange={(e) => setOtherFiles([...e.target.files])} />

                                <h3 className="mt-4">Notes</h3>
                                <textarea className="form-control" placeholder="Notes" value={textNotes} onChange={(e) => setTextNotes(e.target.value)} required />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn btn-success mt-3 submit-button">Add Design</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InputDesign;
