import React, { useState, useEffect } from "react";

const EditDesign = ({ design_number, onUpdate }) => {
    const [design, setDesign] = useState({
        design_image: null,
        category: "",
        product_type: "",
        price: "",
        description: "",
    });

    useEffect(() => {
        const fetchDesign = async () => {
            try {
                const response = await fetch(`http://localhost:5000/designs/${design_number}`);
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

    const handleFileChange = (e) => {
        setDesign({ ...design, design_image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("design_number", design_number);
        formData.append("category", design.category);
        formData.append("product_type", design.product_type);
        formData.append("price", design.price);
        formData.append("description", design.description);
        if (design.design_image) {
            formData.append("design_image", design.design_image);
        }

        try {
            const response = await fetch(`http://localhost:5000/designs/${design_number}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                alert("Design updated successfully!");
                onUpdate();  // Close the form after update
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

                <label>Design Image:</label>
                <input type="file" name="design_image" accept="image/*" onChange={handleFileChange} />

                {design.design_image && typeof design.design_image === "string" && (
                    <img src={design.design_image} alt="Current Design" width="200px" />
                )}

                <button type="submit">Update Design</button>
            </form>
        </div>
    );
};

export default EditDesign;
