import React from "react";
import { Link } from "react-router-dom"; // Use react-router-dom instead of react-router
import Posts from "./Posts";
import { Button, Typography } from "@mui/material";

interface DashBoardProps {
  handleAuthentication: (status: boolean) => void;
}

const DashBoard: React.FC<DashBoardProps> = ({ handleAuthentication }) => {
  return (
    <div className="p-8">
      <Typography variant="h4" className="text-center text-black">
        Post Management
      </Typography>
      <div className="flex justify-end gap-3">
        <Link to="/md" className="bg-blue-500 px-4 py-2 rounded font-bold">
          Create New Post
        </Link>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleAuthentication(false)}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </Button>
      </div>
      <Posts />
    </div>
  );
};

export default DashBoard;
