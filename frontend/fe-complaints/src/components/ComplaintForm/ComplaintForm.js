import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import { Modal } from "react-bootstrap";
import { CheckCircleFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./ComplaintForm.css";

const ComplaintForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize navigate

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    githubIssue: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const baseUrl = process.env.REACT_APP_COMPLAINTS_APP_BE_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!user) {
      setMessage("You must be logged in to submit a complaint.");
      setLoading(false);
      return;
    }

    try {
      const complaintData = {
        complaint_id: Date.now().toString(),
        title: formData.title,
        category: formData.category,
        description: formData.description,
        user_id: user?.email,
        github_issue: formData.githubIssue || null,
      };

      console.log("Printing base url")
      console.log(baseUrl)
      console.log(process.env.REACT_APP_COMPLAINTS_APP_BE_URL)
      const response = await axios.post(`${baseUrl}/user-api/add-complaint`, complaintData);

      if (response.status === 201) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/home"); // Redirect to home after success
        }, 3000); // Wait for 3 seconds before redirecting
        setFormData({ title: "", category: "", description: "", githubIssue: "" });
      } else {
        setMessage("Failed to register complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "An error occurred while submitting your complaint.");
    }

    setLoading(false);
  };

  return (
    <div className="complaint-container">
      <h2>Register a Complaint</h2>

      {/* Avatar and User Name */}
      <div className="user-info">
        <img src={user?.photoURL} alt="User Avatar" className="avatar" />
        <span className="username">{user?.displayName}</span>
      </div>

      <form onSubmit={handleSubmit} className="complaint-form">
        <label>Title:</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter Title" required />

        <label>Tag:</label>
        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="" disabled>Select a category</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Transport">Transport</option>
          <option value="Canteen">Canteen</option>
          <option value="Faculty and Staff">Faculty and Staff</option>
          <option value="Examination">Examination</option>
          <option value="Fee Payment">Fee Payment</option>
          <option value="Hostel and Accommodation">Hostel and Accommodation</option>
          <option value="Extracurricular and Events">Extracurricular and Events</option>
          <option value="Others">Others</option>
        </select>

        <label>Description:</label>
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Write description" required></textarea>

        <label>GitHub Issue Link (Optional):</label>
        <input
          type="url"
          name="githubIssue"
          value={formData.githubIssue}
          onChange={handleChange}
          placeholder="GitHub Issue Link (if any)"
          pattern="https://github\.com/.*"
          title="Enter a valid GitHub issue URL (e.g., https://github.com/user/repo/issues/1)"
        />

        <p className="media-instruction">
          You can attach media files related to your complaint through GitHub by{" "}
          <a href="https://github.com/shaaz10/Complaint_Platform/issues" target="_blank" rel="noopener noreferrer">
            clicking here
          </a>.
        </p>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Registering..." : "Register Complaint"}
        </button>
      </form>

      {message && <p className="message text-danger">{message}</p>}

      {/* Success Popup */}
      <Modal show={showSuccess} onHide={() => setShowSuccess(false)} centered>
        <Modal.Body className="text-center p-5">
          <CheckCircleFill className="success-icon" />
          <h5 className="text-success">Complaint Registered Successfully!</h5>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ComplaintForm;
