import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import EditDesign from "./Edit Design";
import DeleteDesign from "./DeleteDesign";
import Navbar from "./Navbar";

import { useParams } from "react-router-dom";

const SingleDesign = ({ user, setUser }) => {
    const { design_number } = useParams();
    const [design, setDesign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    useEffect(() => {
        // Fetch the design details
        const fetchDesign = async () => {
            try {
                const response = await fetch(`http://localhost:5000/designs/${design_number}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch design");
                }
                const data = await response.json();
                setDesign(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDesign();
    }, [design_number]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null); // Clear user in App.js
        navigate("/");
    };


    if (loading) return <p>Loading design details...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            {/* Navbar */}
            <Navbar user={user} handleLogout={handleLogout} />

            <div className="container mt-4">
                <h1>Design Details</h1>
                <hr />
                <h2>Design Number: {design.design_number}</h2>
                <p><strong>Author:</strong> {design.author_name}</p> {/* Now displays username */}
                <p><strong>Last Modified By:</strong> {design.modified_by}</p>
                <p><strong>Created At:</strong> {new Date(design.created_at).toLocaleString()}</p>
                <p><strong>Last Modified At:</strong> {new Date(design.last_modified_at).toLocaleString()}</p>

                {/* Gems Section */}
                <h3>Gems</h3>
                <ul>
                    {design.gems.map((gem, index) => (
                        <li key={index}>
                            {gem.shape} {gem.gem} - {gem.size} ({gem.count} pcs)
                        </li>
                    ))}
                </ul>

                {/* Metals Section */}
                <h3>Metals</h3>
                <ul>
                    {design.metals.map((metal, index) => (
                        <li key={index}>
                            {metal.metal_name}: {metal.weight}g
                        </li>
                    ))}
                </ul>

                {/* Files Section */}
                {/*{design.files.length > 0 ? (*/}
                {/*    <ul>*/}
                {/*        {design.files.map((file, index) => (*/}
                {/*            <li key={index}>*/}
                {/*                <a*/}
                {/*                    href={file.url}*/}
                {/*                    target="_blank"*/}
                {/*                    rel="noopener noreferrer"*/}
                {/*                >*/}
                {/*                    {file.name}*/}
                {/*                </a>*/}
                {/*            </li>*/}
                {/*        ))}*/}
                {/*    </ul>*/}
                {/*) : (*/}
                {/*    <p>No files attached.</p>*/}
                {/*)}*/}
            </div>
        </div>
    );

};

export default SingleDesign;

