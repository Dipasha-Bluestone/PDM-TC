import React from "react";

const DeleteDesign = ({ design_number, onDelete }) => {
    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/designs/${design_number}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Design deleted successfully!");
                onDelete();  // Close the delete modal and refresh list
            } else {
                alert("Failed to delete design.");
            }
        } catch (err) {
            console.error("Error deleting design:", err);
        }
    };

    return (
        <div className="delete-modal">
            <h2>Are you sure you want to delete this design?</h2>
            <button onClick={handleDelete} className="btn-danger">Yes, Delete</button>
        </div>
    );
};

export default DeleteDesign;
