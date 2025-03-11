import React, { useState } from "react";
import { Button } from "react-bootstrap";
import AddCategoryModal from "./Categories/AddCategory";
import CategoryPage from "./Categories/CategoryPage";

const AdminSetup = ({ user, setUser }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Admin Setup</h1>

            {/* Add Category Button */}
            <Button onClick={() => setShowModal(true)} className="mb-4">
                Add Category
            </Button>

            {/* Add Category Modal */}
            <AddCategoryModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                user={user}
            />
            <CategoryPage />
        </div>
    );
};

export default AdminSetup;
