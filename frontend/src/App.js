import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/PrivateRoute";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Dashboard from "./components/dashboard/Dashboard";  // Dashboard for notes
import Navbar from "./components/navbar/navbar";
import AddNote from "./components/notesform/Addnote";
import CalendarEvents from "./components/events/Events";
import Settings from "./components/settings/Setting";

function App() {
    return (
        <AuthProvider>
            <Router>
                <MainApp />
            </Router>
        </AuthProvider>
    );
}

function MainApp() {
    const location = useLocation();
    const { user } = useAuth();

    // Hide Navbar on login and register pages
    const hideNavbarRoutes = ["/login", "/"];
    const shouldShowNavbar = user && !hideNavbarRoutes.includes(location.pathname);

    return (
        <>
            {shouldShowNavbar && <Navbar />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Register />} />
                {/* Protect Dashboard route */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/addnotes" 
                    element={
                        <ProtectedRoute>
                            <AddNote/>
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/addevents" 
                    element={
                        <ProtectedRoute>
                            <CalendarEvents/>
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/settings" 
                    element={
                        <ProtectedRoute>
                            <Settings/>
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </>
    );
}

export default App;
