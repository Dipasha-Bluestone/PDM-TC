import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";

const Navbar = ({ user, handleLogout }) => {
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        setHasAnimated(true); // Mark animation as completed after first mount
    }, []);

    return (
        <motion.nav
            className="navbar navbar-expand-lg navbar-dark custom-navbar"
            initial={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}  // Only animate on first render
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
        >
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">AurumPDM</Link>

                {/* Navbar Toggle Button */}
                <button className="navbar-toggler" type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Collapsible Menu */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {user?.rolename === "admin" && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/manage-users">Manage Users</Link>
                            </li>
                        )}
                        {user && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/designs">Designs</Link>
                            </li>
                        )}
                        {user && (
                            <li className="nav-item">
                                <button className="btn btn-danger ms-3" onClick={handleLogout}>Logout</button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
