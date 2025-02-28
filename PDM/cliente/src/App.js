import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Design from "./components/Design";
import ManageUsers from "./components/ManageUsers";

function App() {
    const isAuthenticated = !!localStorage.getItem("token");
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser)); // Load user from localStorage
        }
    }, []);

    // Check if the user's role
    const isAdmin = user?.rolename?.toLowerCase() === "admin";
    const isManager = user?.rolename?.toLowerCase() === "manager";
    const isCustomer = user?.rolename?.toLowerCase() === "customer";
    const isSales = user?.rolename?.toLowerCase() === "salesperson";

    const AccessRestricted = () => (
        <div style={{ textAlign: "center", marginTop: "20px", color: "red", fontWeight: "bold" }}>
        <br/>
            <h2>Access Restricted</h2>
            <p>You do not have permission to view this page. Please contact the admin in case this is a mistake.</p>
        </div>
    ); 

    return (
        <Router>
            <Routes>
                <Route path="/" element={isAuthenticated ? <Home user={user} setUser={setUser} /> : <Navigate to="/login" />} />
                <Route path="/login" element={<Login setUser={setUser} />} />

                {/* Admin-only routes */}
                {isAuthenticated && isAdmin ? (
                    <>
                        <Route path="/register" element={<Register />} />
                        <Route path="/manage-users" element={<ManageUsers />} />
                    </>
                ) : (
                    <>
                            <Route path="/register" element={<AccessRestricted />} />
                            <Route path="/manage-users" element={<AccessRestricted />} />
                    </>
                )}
                {/* Forbid sales and customers routes */}
                {isAuthenticated && isCustomer || isAuthenticated && isSales ? (
                    <>
                        <Route path="/designs" element={<Design user={user} setUser={setUser} />} />
                    </>
                ) : (
                        <>
                            <Route path="/designs" element={<Design user={user} setUser={setUser} />} />
                    </>
                )}
            </Routes>
        </Router>
    );
}

export default App;
