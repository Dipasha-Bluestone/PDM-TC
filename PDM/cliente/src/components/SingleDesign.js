import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import EditDesign from "./Edit Design";
import DeleteDesign from "./DeleteDesign";
import Navbar from "./Navbar";

const Design = ({ user, setUser }) => {
    const [designs, setDesigns] = useState([]);
    const [editDesignNumber, setEditDesignNumber] = useState(null);
    const [deleteDesignNumber, setDeleteDesignNumber] = useState(null);
    const navigate = useNavigate();

    // Check authentication when component mounts
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setTimeout(() => {
            navigate("/");
        }, 0);
    };

    // Fetch designs with authentication
    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5000/designs", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Unauthorized or failed to fetch");
                }

                const data = await response.json();
                setDesigns(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching designs:", err.message);
                setDesigns([]); // Fallback to empty state
            }
        };
        fetchDesigns();
    }, []);

    return (
        <div>  <Navbar user={user} handleLogout={handleLogout} />
            <div className="container">
                <h1 className="text-center mt-4">PDM Designs</h1>

                {/* Add New Design */}
                {user && (user.roleid === 1 || user.roleid === 2 || user.roleid === 3 || user.roleid === 4) && (
                    <>
                        <Link to="/bom" className="btn btn-primary mb-3" onDesignAdded={() => window.location.reload()}>Add Design</Link>
                    </>)}
                {/* Table of Designs */}
                <table className="design-table">
                    <thead>
                        <tr>
                            <th>Design No.</th>
                            <th>Image</th>
                            <th>Category</th>
                            <th>Product Type</th>
                            <th>Price</th>
                            <th>Design Dimensions</th>
                            <th>Description</th>
                            <th> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {designs.map((design) => (
                            <tr key={design.design_number}>
                                <td>{design.design_number}</td>
                                <td>
                                    {design.design_image ? (
                                        <img
                                            src={design.design_image}
                                            alt="Design"
                                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                        />
                                    ) : (
                                        "No Image"
                                    )}
                                </td>
                                <td>{design.category}</td>
                                <td>{design.product_type}</td>
                                <td>${design.price}</td>
                                <td>{design.design_dimensions}</td>
                                <td>{design.description}</td>
                                <td>{user && (user.roleid === 1 || user.roleid === 2 || user.userid === design.author) && (
                                    <>
                                        <button onClick={() => setEditDesignNumber(design.design_number)} className="btn-icon"><FaEdit size={20} color="navy" />

                                        </button>
                                        <button onClick={() => setDeleteDesignNumber(design.design_number)} className="btn-icon"><FaTrash size={20} color="red" />

                                        </button> </>)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Show EditDesign when edit button is clicked */}
                {editDesignNumber && (
                    <div className="modal-container">
                        <EditDesign
                            design_number={editDesignNumber}
                            onUpdate={() => {
                                setEditDesignNumber(null);
                                window.location.reload();
                            }}
                        />
                        <button onClick={() => setEditDesignNumber(null)}>Cancel</button>

                    </div>
                )}

                {/* Show DeleteDesign when delete button is clicked */}
                {deleteDesignNumber && (
                    <div className="modal-container">
                        <DeleteDesign
                            design_number={deleteDesignNumber}
                            onDelete={() => {
                                setDeleteDesignNumber(null);
                                window.location.reload();
                            }}
                        />
                        <button onClick={() => setDeleteDesignNumber(null)}>Cancel</button>
                    </div>
                )}

                <button className="btn btn-danger mt-3" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default Design;

