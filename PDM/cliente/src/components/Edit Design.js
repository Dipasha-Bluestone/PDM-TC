import React, { useState, useEffect } from "react";

const EditDesign = ({ design_number, onUpdate }) => {
    const [design, setDesign] = useState({
        category: "",
        product_type: "",
        price: "",
        description: "",
        design_dimensions: "",
        text_notes: "",
        metals: [],
        gems: [],
    });
    const [design_image, setDesignImage] = useState(null);
    const [cad_file, setCadFile] = useState(null);
    const [model_sheet, setModelSheet] = useState(null);
    const [other_files, setOtherFiles] = useState([]);

    useEffect(() => {
        const fetchDesign = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:5000/designs/${design_number}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                setDesign(data);
            } catch (err) {
                console.error("Error fetching design:", err);
            }
        };
        fetchDesign();
    }, [design_number]);

    const handleChange = (e) => {
        setDesign({ ...design, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, setter) => {
        setter(e.target.files[0]);
    };

    const handleMultipleFileChange = (e) => {
        setOtherFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("design_number", design_number);
        formData.append("category", design.category);
        formData.append("product_type", design.product_type);
        formData.append("price", design.price);
        formData.append("description", design.description);
        formData.append("design_dimensions", design.design_dimensions);
        formData.append("text_notes", design.text_notes);
        formData.append("metals", JSON.stringify(design.metals));
        formData.append("gems", JSON.stringify(design.gems));

        if (design_image) formData.append("design_image", design_image);
        if (cad_file) formData.append("cad_file", cad_file);
        if (model_sheet) formData.append("model_sheet", model_sheet);
        if (other_files.length > 0) {
            other_files.forEach((file) => formData.append("other_files", file));
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/designs/${design_number}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                alert("Design updated successfully!");
                onUpdate();
            } else {
                alert("Failed to update design.");
            }
        } catch (err) {
            console.error("Error updating design:", err);
        }
    };

    return (
        <div className="edit-modal">
            <h2>Edit Design</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <label>Category:</label>
                <input type="text" name="category" value={design.category} onChange={handleChange} required />

                <label>Product Type:</label>
                <input type="text" name="product_type" value={design.product_type} onChange={handleChange} required />

                <label>Price:</label>
                <input type="number" name="price" value={design.price} onChange={handleChange} required />

                <label>Description:</label>
                <textarea name="description" value={design.description} onChange={handleChange} required />

                <label>Design Dimensions:</label>
                <input type="text" name="design_dimensions" value={design.design_dimensions} onChange={handleChange} required />

                <label>Notes:</label>
                <input type="text" name="text_notes" value={design.text_notes} onChange={handleChange} required />

                <label>Design Image:</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setDesignImage)} />
                {design.design_image && typeof design.design_image === "string" && (
                    <img src={design.design_image} alt="Current Design" width="200px" />
                )}

                <h3>Upload Files</h3>
                <label>CAD File:</label>
                <input type="file" accept=".cad,.stp,.step,.3dm,.stl" onChange={(e) => handleFileChange(e, setCadFile)} />
                <label>Model Sheet:</label>
                <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setModelSheet)} />
                <label>Other Files:</label>
                <input type="file" multiple onChange={handleMultipleFileChange} />

                <button type="submit">Update Design</button>
            </form>
        </div>
    );
};

export default EditDesign;
