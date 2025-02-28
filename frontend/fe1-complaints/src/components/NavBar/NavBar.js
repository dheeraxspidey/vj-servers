import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "./NavBar.css";

const NavBar = () => {
  let navigate = useNavigate();
  const { user, admin, logout } = useAuth();

  const handleLogout = async () => {
    await logout(); // Log out the user/admin
    navigate("/login"); // Navigate to the login page
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <div className="logo text-white" onClick={() => navigate("/complaint-website")}>
          THRIVE
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-lg-0">
            {/* Show Home only if user is logged in */}
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/home">Home</NavLink>
              </li>
            )}

            {/* Show Dashboard only if user/admin is logged in */}
            {(user) && (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link text-white"
                  onClick={() => navigate("/user-dashboard", { state: { email: user.email } })}
                >
                  Dashboard
                </button>
              </li>
            )}

            <li className="nav-item">
              {user || admin ? (
                <button className="nav-link btn btn-link text-white" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <NavLink className="nav-link" to="/login">Login</NavLink>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;