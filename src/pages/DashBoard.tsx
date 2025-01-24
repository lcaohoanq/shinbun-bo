import React from "react";
import { Link } from "react-router-dom"; // Use react-router-dom instead of react-router
import Posts from "./Posts";

interface DashBoardProps {
  handleAuthentication: (status: boolean) => void;
}

const DashBoard: React.FC<DashBoardProps> = ({ handleAuthentication }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome to the dashboard!</p>
      <Link to="/md" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        Create New Post
      </Link>
      <button
        onClick={() => handleAuthentication(false)}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
      <Posts />
    </div>
  );
};

export default DashBoard;
