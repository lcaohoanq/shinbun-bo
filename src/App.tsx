import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
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
              <div className="p-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="mt-4">Welcome to the dashboard!</p>
                <Link
                  to="/md"
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Go to Markdown Preview
                </Link>
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

        <Route
          path="/md"
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
