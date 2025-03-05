import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Design.css"; // Import CSS for styling

const Design = ({ user, setUser }) => {
    const [designs, setDesigns] = useState([]);
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
        navigate("/");
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
        <div>
            <Navbar user={user} handleLogout={handleLogout} />
            <div className="container">
                <h1 className="text-center mt-4"></h1>

                {/* Add New Design */}
                {user && (user.roleid === 1 || user.roleid === 2 || user.roleid === 3 || user.roleid === 4) && (
                    <Link to="/bom" className="btn btn-primary mb-3">
                        Add Design
                    </Link>
                )}

                {/* Design Gallery */}
                <div className="design-gallery">
                    {designs.map((design) => (
                        <div
                            key={design.design_number}
                            className="design-item"
                            onClick={() => navigate(`/designs/${design.design_number}`)} // Navigate on click
                        >
                            <img
                                src={design.design_image || "https://via.placeholder.com/150"}
                                alt={`Design ${design.design_number}`}
                                className="design-image"
                            />
                            <p className="design-number">{design.design_number}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Design;
