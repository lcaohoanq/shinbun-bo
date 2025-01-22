import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Authentication handler that can be passed to Login component
  const handleAuthentication = (status: boolean) => {
    setIsAuthenticated(status);
  };

  // Protected Route wrapper component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route - Login page */}
        <Route
          path="/login"
          element={<Login onLoginSuccess={() => handleAuthentication(true)} />}
        />

        {/* Protected route - Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <button
                  onClick={() => handleAuthentication(false)}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                >
                  Logout
                </button>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
