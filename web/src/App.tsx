import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashBoard from "./pages/Dashboard";
import Login from "./pages/Login";
import MarkdownPreview from "./pages/MarkdownPreview";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const App = () => {
  // Initialize auth state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const handleAuthentication = (status: boolean) => {
    setIsAuthenticated(status);
    localStorage.setItem("isAuthenticated", status.toString());
  };

  // Optionally: Check authentication on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={() => handleAuthentication(true)} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard handleAuthentication={handleAuthentication} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts/:postDirectory/:postTitle"
          element={
            <ProtectedRoute>
              <MarkdownPreview />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
