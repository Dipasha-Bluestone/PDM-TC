import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setUser }) => { //Receive setUser from props
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                let user = data.user;

                //// Convert profile_pic (BYTEA) to Base64 if it exists
                //if (user.profile_pic) {
                //    user.profile_pic = `data:image/png;base64,${user.profile_pic.toString("base64")}`;
                //}

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(user));
                setUser(user);
                navigate("/");
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error("Login error:", err);
        }
    };


    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
