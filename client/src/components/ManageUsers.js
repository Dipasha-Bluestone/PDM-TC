import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [formData, setFormData] = useState({ username: "", email: "", roleid: "" });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:5000/users");
            if (!response.ok) throw new Error("Failed to fetch users");

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error.message);
        }
    };

    const handleEdit = (user) => {
        setEditUser(user);
        setFormData({ username: user.Username, email: user.Email, roleid: user.RoleID });
    };

    const handleDelete = async (userID) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await fetch(`http://localhost:5000/users/${userID}`, { method: "DELETE" });
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleUpdate = async () => {
        try {
            await fetch(`http://localhost:5000/users/${editUser.UserID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            setEditUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
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
                        <tr key={user.userID}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.rolename}</td>
                            <td>
                                <button className="btn btn-warning me-2" onClick={() => handleEdit(user)}><FaEdit size={20} color="navy" /></button>
                                <button className="btn btn-danger" onClick={() => handleDelete(user.UserID)}><FaTrash size={20} color="red" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editUser && (
                <div className="modal-container">
                    <h3>Edit User</h3>
                    <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                    <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <input type="text" placeholder="Role ID" value={formData.roleid} onChange={(e) => setFormData({ ...formData, roleid: e.target.value })} />
                    <button className="btn btn-success mt-2" onClick={handleUpdate}>Update</button>
                    <button className="btn btn-secondary mt-2" onClick={() => setEditUser(null)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
