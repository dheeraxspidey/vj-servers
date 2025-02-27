import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { useAuth } from "../../Context/AuthContext";

const Hero = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (user) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="badge">🎓 Voice of Students</div>
          <h1>Your Voice Matters: <span>Share Your Campus Experience</span></h1>
          <p>A platform where you can safely express your concerns about campus life. From infrastructure to canteen services, help improve your college experience through constructive feedback.</p>
          <div className="cta-group">
            <button className="cta-btn primary" onClick={() => handleNavigation("/complaint-form")}>
              Submit Your Complaint
            </button>
            <button className="cta-btn secondary" onClick={() => handleNavigation("/home")}>
              View Complaints
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80" alt="College Campus" />
        </div>
      </div>
    </header>
  );
};

const LandingPage = () => {
  return (
    <div>
      <Hero />
    </div>
  );
};

export default LandingPage;
