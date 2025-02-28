import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion
import "./Login.css"; // Styling

const Login = ({ setUser }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                let user = data.user;
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(user));
                setUser(user);

                // Delay navigation to allow exit animation
                setTimeout(() => {
                    navigate("/");
                }, 500);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <motion.div
            className="login-container"
            exit={{ opacity: 0, y: -50 }} // Slide out upwards on exit
            transition={{ duration: 0.5, ease: "easeOut" }} // Smooth transition
        >
            <h1 className="app-title">AurumPDM</h1>
            <div className="login-card">
                <h2 className="login-title">Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </motion.div>
    );
};

export default Login;
