import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = ({ user, setUser }) => { 
    const navigate = useNavigate();

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("token"); 
        setUser(null); // Clear user in App.js
        navigate("/"); 
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">Home</Link>
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
            </nav>

            {/* Welcome Message */}
            <div className="container mt-5 text-center">
                {user ? (
                    <h1>Hi {user.username}, you are logged in as <strong>{user.rolename}</strong></h1>
                ) : (
                    <div>
                        <h1>Welcome! Please log in.</h1>
                        <br />
                        <Link to="/login" className="btn btn-primary">Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
