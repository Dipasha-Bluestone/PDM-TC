import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        roleid: "",
        profile_pic: null, 
    });

    const navigate = useNavigate(); 

    // Fetch roles from backend
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch("http://localhost:5000/roles");
                const data = await response.json();
                setRoles(data);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };
        fetchRoles();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        if (e.target.name === "profile_pic") {
            setFormData({ ...formData, profile_pic: e.target.files[0] }); 
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append("username", formData.username);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("roleid", formData.roleid);
        formDataToSend.append("profile_pic", formData.profile_pic); 

        try {
            const response = await fetch("http://localhost:5000/register", {
                method: "POST",
                body: formDataToSend, 
            });

            const data = await response.json();

            if (response.ok) {
                alert("User registered successfully!");
                navigate("/"); 
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error registering user:", error);
        }
    };

    return (
        <div className="container">
        <br/>
            <h2>Add User</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Username:</label>
                    <input type="text" name="username" className="form-control" value={formData.username} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label>Email:</label>
                    <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label>Password:</label>
                    <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label>Role:</label>
                    <select name="roleid" className="form-control" value={formData.roleid} onChange={handleChange} required>
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                            <option key={role.roleid} value={role.roleid}>
                                {role.rolename}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label>Profile Picture:</label>
                    <input type="file" name="profile_pic" className="form-control" onChange={handleChange} />
                </div>

                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    );
};

export default Register;
