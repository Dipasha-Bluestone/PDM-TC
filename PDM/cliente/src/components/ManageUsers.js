import React, { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import Navbar from "./Navbar";

const ManageUsers = ({ user, setUser }) => {
    const [users, setUsers] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [formData, setFormData] = useState({ username: "", email: "", roleid: "" });
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:5000/users", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!response.ok) throw new Error("Failed to fetch users");

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error.message);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch("http://localhost:5000/roles");
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null); // Clear user in App.js
        navigate("/");
    };

    const handleEdit = (user) => {
        setEditUser(user);
        setFormData({ username: user.username, email: user.email, roleid: user.roleid });
        setProfilePicFile(null); // Reset file selection when editing a new user
    };

    const handleDelete = async (userID) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await fetch(`http://localhost:5000/users/${userID}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleUpdate = async () => {
        const updatedFormData = new FormData();
        updatedFormData.append("username", formData.username);
        updatedFormData.append("email", formData.email);
        updatedFormData.append("roleid", formData.roleid);
        if (profilePicFile) updatedFormData.append("profile_pic", profilePicFile); // Append file if selected

        try {
            const response = await fetch(`http://localhost:5000/users/${editUser.userid}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: updatedFormData, // Sending FormData instead of JSON
            });

            if (!response.ok) throw new Error("Failed to update user");

            fetchUsers();
            setEditUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <div>  <Navbar user={user} handleLogout={handleLogout} />
        <div className="container mt-5">
          
            <h1>Manage Users</h1>
            <Link to="/register" className="btn btn-primary mb-3">Register New User</Link>

            <table className="table table-bordered">
                <thead className="table-dark">
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.userid}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.rolename}</td>
                            <td>
                                <button className="btn btn-warning me-2" onClick={() => handleEdit(user)}>
                                    <FaEdit size={20} color="navy" />
                                </button>
                                <button className="btn btn-danger" onClick={() => handleDelete(user.userid)}>
                                    <FaTrash size={20} color="red" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editUser && (
                <div className="modal-container">
                    <h3>Edit User</h3>
                    <input type="file" className="form-control" accept="image/*"
                        onChange={(e) => setProfilePicFile(e.target.files[0])}
                    />
                    <input type="text" placeholder="Username" value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <input type="email" placeholder="Email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <div className="mb-3">
                        <label>Role:</label>
                        <select name="roleid" className="form-control" value={formData.roleid}
                            onChange={(e) => setFormData({ ...formData, roleid: e.target.value })} required>
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role.roleid} value={role.roleid}>
                                    {role.rolename}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className="btn btn-success mt-2" onClick={handleUpdate}>Update</button>
                    <button className="btn btn-secondary mt-2" onClick={() => setEditUser(null)}>Cancel</button>
                </div>
            )}
            </div>
        </div>
    );
};

export default ManageUsers;
