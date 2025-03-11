import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Home from "./components/Home";
import AdminSetup from "./components/AdminSetup";
import Register from "./components/Register";
import Login from "./components/Login";
import Design from "./components/Design";
import InputDesign from "./components/InputDesign";
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

    return (<Router>
        <AnimatedRoutes isAuthenticated={isAuthenticated} user={user} setUser={setUser} isAdmin={isAdmin} isCustomer={isCustomer} isSales={isSales} />
    </Router>);
}
const AccessRestricted = () => (
    <div style={{ textAlign: "center", marginTop: "20px", color: "red", fontWeight: "bold" }}>
        <br />
        <h2>Access Restricted</h2>
        <p>You do not have permission to view this page. Please contact the admin in case this is a mistake.</p>
    </div>
);

    const AnimatedRoutes = ({ isAuthenticated, user, setUser, isAdmin, isCustomer, isSales }) => {
        const location = useLocation();

        return (<AnimatePresence mode="wait"> {/* Ensures exit animations work */}
      
            <Routes key={location.pathname} location={location}>
                <Route path="/" element={isAuthenticated ? <Home user={user} setUser={setUser} /> : <Navigate to="/login" />} />
                <Route path="/login" element={<Login setUser={setUser} />} />

                {/* Admin-only routes */}
                {isAuthenticated && isAdmin ? (
                    <>
                        <Route path="/register" element={<Register user={user} setUser={setUser} />} />
                        <Route path="/manage-users" element={<ManageUsers user={user} setUser={setUser} />} />
                        <Route path="/admin-setup" element={<AdminSetup user={user} setUser={setUser} />} />
                    </>
                ) : (
                    <>
                        <Route path="/register" element={<AccessRestricted />} />
                        <Route path="/manage-users" element={<AccessRestricted />} />
                        <Route path="/admin-setup" element={<AccessRestricted />} />
                    </>
                )}

                {/* Forbid sales and customers routes */}
                {isAuthenticated && (isCustomer || isSales) ? (
                    <>
                        <Route path="/designs" element={<Design user={user} setUser={setUser} />} />
                        <Route path="/bom" element={<InputDesign user={user} setUser={setUser} />} />
                    </>
                ) : (
                    <>
                            <Route path="/designs" element={<Design user={user} setUser={setUser} />} />
                            <Route path="/bom" element={<InputDesign user={user} setUser={setUser} />} />
                    </>
                )}
            </Routes>
        </AnimatePresence>
    );
}

export default App;
