import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import "./register.css"

function RegisterPage() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        const response = await axios.post('http://localhost:5555/register', formData);
        if (response.status === 201) {
            navigate('/login'); // Redirect to login page after successful registration
        }
        } catch (err) {
        setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-page">
            <div className="register-image">
                <img
                src="https://img.freepik.com/free-photo/class-2021-congratulations-graduate_1150-44328.jpg?t=st=1738758620~exp=1738762220~hmac=5f69ab5f7cde6b91e552cc786b57868b41b9e065f6929bd6b521343681e443bf&w=2000"
                alt="Register"
                />
            </div>
            <div className="register-form">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
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
                <button type="submit">Register</button>
                </form>
                <p className="login-link">
                Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
