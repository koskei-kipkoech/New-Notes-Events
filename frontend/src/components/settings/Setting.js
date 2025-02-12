import { useState } from "react";
import axios from "axios";
import "./setting.css";

const Settings = () => {
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Clear previous messages

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                "http://localhost:5555/settings",  // Ensure this matches your Flask server port
                { email, current_password: currentPassword, new_password: newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(response);
            // Show success message
            setMessage("Update successful!");

            // Clear form fields after success
            setEmail("");
            setCurrentPassword("");
            setNewPassword("");

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="settings-container">
            <h2>Update Login Settings</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter new email"
                    />
                </div>
                <div className="form-group">
                    <label>Current Password:</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                    />
                </div>
                <button type="submit" className="update-button">Update</button>
            </form>
        </div>
    );
};

export default Settings;
