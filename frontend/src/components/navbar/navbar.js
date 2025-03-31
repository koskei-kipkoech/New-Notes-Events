import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';  
import './navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false); // Sidebar state

    const toggleSidebar = () => {
        setIsOpen(!isOpen); // Toggle sidebar open/close
    };

    return (
        <>
            {/* Navbar with Logo and Toggle Button */}
            <nav className="navbar">
                <div className="navbar-left">
                    <button className="menu-icon" onClick={toggleSidebar}>☰</button>
                    <div className="navbar-logo">
                        <Link to="/dashboard">MyApp</Link>
                    </div>
                </div>
                <div className='navbar-right'>
                    <button className="add-button">
                        <Link to='/addnotes'>Add Notes</Link>
                    </button>
                </div>
            </nav>

            {/* Sidebar Navigation */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <button className="close-btn" onClick={toggleSidebar}>×</button>
                {/* User Info */}
                {user && (
                    <div className="sidebar-user">
                        <span className="account-icon">👤 </span>
                        <strong>Welcome {user.username}</strong> 
                    </div>
                )}

                <ul className="sidebar-links">
                    {user && (
                        <li>
                            <Link to="/dashboard" onClick={toggleSidebar}>Dashboard</Link>
                            <Link to="/addevents" onClick={toggleSidebar}>My Events</Link>
                        </li>
                    )}
                    {!user ? (
                        <>
                            <li>
                                <Link to="/login" onClick={toggleSidebar}>Login</Link>
                            </li>
                            <li>
                                <Link to="/" onClick={toggleSidebar}>Register</Link>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link to="/login" onClick={() => { logout(); toggleSidebar(); }}>Logout</Link>
                        </li>
                    )}
                </ul>
                <Link to="/settings" className="settings-icon"> ⚙️</Link>


                
            </div>

            {/* Overlay to close sidebar when clicking outside */}
            {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}
        </>
    );
}

export default Navbar;
