import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const getToken = () => {
        return localStorage.getItem("token") || 
                document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1];
    };
    const logout = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) {
                console.warn("No token found, skipping logout request.");
                localStorage.removeItem("token");
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                setUser(null);
                return;
            }
    
            const response = await fetch("http://localhost:5555/logout", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Logout failed");
            }
    
            localStorage.removeItem("token");
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            setUser(null);
    
            console.log("Successfully logged out");
            window.location.reload();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }, []); // ✅ Memoize `logout`
    // ✅ Improved checkLogin to validate token without requiring email/password
    const checkLogin = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) {
                setUser(null);
                return;
            }
    
            const response = await fetch("http://localhost:5555/auth-check", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });
    
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                console.warn("Session expired. Logging out...");
                logout();
            }
        } catch (error) {
            console.error("Auto-login failed:", error);
            logout();
        }
    }, [logout]); // ✅ Now safe to include `logout`
    
    
    

    useEffect(() => {
        checkLogin();
    }, [checkLogin]);

    const login = async (email, password) => {
        try {
            localStorage.removeItem("token"); // ✅ Clear old token before new login
    
            const response = await fetch("http://localhost:5555/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }
    
            const data = await response.json();
    
            localStorage.setItem("token", data.token); // ✅ Store new token
            setUser(data.user);
        } catch (error) {
            console.error("Login failed:", error.message);
            throw error;
        }
    };

    
    
    
    return (
        <AuthContext.Provider value={{ user, login, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook for using auth context
export function useAuth() {
    return useContext(AuthContext);
}
