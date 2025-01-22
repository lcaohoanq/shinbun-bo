import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === "admin" && password === "admin") {
      onLoginSuccess();
      navigate("/dashboard");
    } else {
      setErrorMessage("Invalid username or password");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <Container maxWidth="sm" className="mt-16">
      <Paper elevation={3} className="p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-blue-500 p-4 rounded-full">
            <LockOutlinedIcon className="text-white" />
          </div>

          <Typography variant="h4" className="font-medium">
            Login
          </Typography>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-50"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-50"
            />

            {errorMessage && (
              <Alert severity="error" className="mt-4">
                {errorMessage}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              className="mt-6 py-3"
            >
              Login
            </Button>
          </form>
        </div>
      </Paper>
    </Container>
  );
};

export default Login;
