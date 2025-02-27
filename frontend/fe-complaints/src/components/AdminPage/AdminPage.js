import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Row, Col } from "react-bootstrap";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaCalendarAlt,
  FaEdit,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaChartBar, // Icon for Analysis button
} from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";
import "./AdminPage.css";

const AdminPage = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const baseUrl = process.env.REACT_APP_COMPLAINTS_APP_BE_URL;

  useEffect(() => {
    if (admin?.category) {
      fetchComplaints(admin.category);
    }
  }, [admin]);

  const fetchComplaints = async (category) => {
    try {
      const response = await axios.get(
        `${baseUrl}/admin-api/filter-complaints?category=${category}`
      );
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown Date";
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaExclamationCircle className="text-warning" />;
      case "Ongoing":
        return <FaClock className="text-primary" />;
      case "Resolved":
        return <FaCheckCircle className="text-success" />;
      default:
        return null;
    }
  };

  return (
    <div className="container">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary text-center mt-3 mb-4">Admin Complaints Dashboard</h2>
        <Button
          variant="outline-primary"
          onClick={() => navigate("/admin-analysis")}
          className="d-flex align-items-center"
        >
          <FaChartBar className="me-2" />
          Analysis
        </Button>
      </div>

      {/* Complaints List */}
      <Row className="g-4">
        {complaints.map((complaint) => (
          <Col key={complaint.complaint_id} md={6} lg={4}>
            <Card className="shadow-lg p-3 rounded glass-effect" style={{ height: "100%" }}>
              <div className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => navigate(`/complaints-details/${complaint.complaint_id}`)}
                >
                  <FaEdit style={{ fontSize: "1.5em" }} />
                </Button>
              </div>
              <Card.Body>
                <Card.Title className="fw-bold text-dark">{complaint.title}</Card.Title>
                <Card.Text className="text-muted">
                  <FaCalendarAlt className="me-2" />
                  {formatDate(complaint.timestamp)}
                </Card.Text>
                <Card.Text>
                  {complaint.description.length > 100
                    ? `${complaint.description.substring(0, 100)}...`
                    : complaint.description}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Button variant="outline-success" size="sm" className="me-2">
                      <FaThumbsUp /> {complaint.likes}
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      <FaThumbsDown /> {complaint.dislikes}
                    </Button>
                  </div>
                  <div className="d-flex align-items-center">
                    {getStatusIcon(complaint.status)}
                    <span className={`ms-2 fw-bold status-${complaint.status.toLowerCase()}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminPage;
