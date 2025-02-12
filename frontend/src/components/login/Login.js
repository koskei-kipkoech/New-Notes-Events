import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext
import './login.css'

function LoginPage() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth(); // Get login function from context

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            localStorage.removeItem("token"); // ✅ Remove old token before login
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            await login(formData.email, formData.password); // Use AuthContext login
            navigate("/dashboard"); // Redirect after successful login
        } catch (err) {
            setError("Login failed. Please check your credentials.");
        }
    };
    

    return (
        <div className="login-page">
            <div className="login-image">
                <img
                    src="https://img.freepik.com/premium-photo/goals-as-memo-notebook-with-idea-crumpled-paper-cup-coffee_120485-4384.jpg?w=1800"
                    alt="Login"
                />
            </div>
            <div className="login-form">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter Email"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Login</button>
                </form>
                <p className="login-link">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
