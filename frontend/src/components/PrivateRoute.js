import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    if (user === undefined) return <p>Loading...</p>; // Show loading state while checking auth
    return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
