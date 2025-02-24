import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "C:/Users/sw3/source/repos/PDM/client/src/components/Home";
import Register from "C:/Users/sw3/source/repos/PDM/client/src/components/Register";
import Login from "C:/Users/sw3/source/repos/PDM/client/src/components/Login";
import Design from "C:/Users/sw3/source/repos/PDM/client/src/components/Design";
import ManageUsers from "./components/ManageUsers";
    
    function App() {
        const isAuthenticated = !!localStorage.getItem("token");
        const [user, setUser] = useState(null);

        useEffect(() => {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser)); //Load user from localStorage
            }
        }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home user={user} setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/manage-users" element={<ManageUsers />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/designs" element={isAuthenticated ? <Design /> : <Login />} />
            </Routes>
        </Router>
    );
};

export default App;

 