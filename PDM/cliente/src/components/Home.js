import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css"; //styling
import { motion } from "framer-motion"; 

const Home = ({ user, setUser }) => { 
    const navigate = useNavigate();

    const defaultProfilePic = "https://media.istockphoto.com/id/1223671392/vector/default-profile-picture-avatar-photo-placeholder-vector-illustration.jpg?s=612x612&w=0&k=20&c=s0aTdmT5aU6b8ot7VKm11DeID6NctRCpB755rA1BIP0="; // Gray Circle Placeholder

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("token"); 
        setUser(null); // Clear user in App.js
        navigate("/"); 
    };

    return (
        <div className="home-container">
                       {/* Navbar */}
            <motion.nav className="navbar navbar-expand-lg navbar-dark custom-navbar"
                initial={{ opacity: 0, y: 1000 }}  // Start slightly below and invisible
                animate={{ opacity: 1, y: 0 }}  // Animate to visible and normal position
                transition={{ duration: 1, ease: "easeOut" }}>
                <div className="container-fluid">
                
                    <Link className="navbar-brand" to="/">AurumPDM</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
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

            {/* Welcome Section */}
            <motion.div className="container d-flex justify-content-center align-items-center vh-100"
                initial={{ opacity: 0, y: 1000 }}  // Start slightly below and invisible
                animate={{ opacity: 1, y: 0 }}  // Animate to visible and normal position
                transition={{ duration: 1, ease: "easeOut" }}>
                {user ? (

                    <div className="profile-card d-flex p-4 shadow">
                        {/* Profile Picture */}
                        <div className="profile-pic-container">
                            <img
                                src={user.profile_pic || defaultProfilePic}
                                alt="Profile"
                                className="profile-pic"
                            />
                        </div>

                        {/* User Info */}
                        <div className="profile-info">
                            <h2>{user.username}</h2>
                            <p className="role">{user.rolename}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <h1>Welcome! Please log in.</h1>
                        <br />
                        <Link to="/login" className="btn btn-primary">Login</Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};


export default Home;
