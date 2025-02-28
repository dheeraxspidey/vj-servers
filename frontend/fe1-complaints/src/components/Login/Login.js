import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const Login = () => {
  const { user, admin, loginWithGithub, loginAsAdmin, logout } = useAuth();
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  let navigate = useNavigate();

  // Redirect users/admins after login
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (user) navigate("/home");
    if (admin || adminToken) navigate("/adminpage");
  }, [user, admin, navigate]);

  // Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    const admin_id = e.target.admin_id.value;
    const password = e.target.password.value;

    const success = await loginAsAdmin(admin_id, password);
    if (success) {
      navigate("/adminpage");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="login-container p-5 shadow-lg rounded-3 bg-white">
        <h2 className="text-center mb-4">Welcome Back</h2>
        <p className="text-center mb-4">Please login to your account</p>

        <div className="role-selector d-flex justify-content-center mb-4">
          <div className={`role-option ${role === "user" ? "active" : ""}`} onClick={() => setRole("user")}>
            User
          </div>
          <div className={`role-option ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}>
            Admin
          </div>
        </div>

        {role === "user" ? (
          <div className="user-login text-center">
            {user ? (
              <div>
                <h5>Welcome, {user.displayName}</h5>
                <img src={user.photoURL} alt="Profile" width={50} className="rounded-circle mb-3" />
                <button onClick={logout} className="btn btn-danger w-100">Logout</button>
              </div>
            ) : (
              <button onClick={loginWithGithub} className="btn btn-dark w-100 d-flex align-items-center justify-content-center">
                <i className="fab fa-github me-2"></i>
                Login with GitHub
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="admin-login">
            {error && <p className="text-danger text-center">{error}</p>}
            <div className="mb-3">
              <input type="text" name="admin_id" placeholder="Admin ID" className="form-control" required />
            </div>
            <div className="mb-3">
              <input type="password" name="password" placeholder="Admin Password" className="form-control" required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
