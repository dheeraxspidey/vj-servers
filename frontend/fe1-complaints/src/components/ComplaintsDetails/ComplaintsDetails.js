import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./ComplaintsDetails.css";

const ComplaintsDetails = () => {
  const { complaint_id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [newComment, setNewComment] = useState("");
  const baseUrl = process.env.REACT_APP_COMPLAINTS_APP_BE_URL;

  // Function to format date
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Fetch complaint details
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/admin-api/view-complaint/${complaint_id}`
        );
        console.log(response);
        const complaintData = response.data.complaint;
        setComplaint({
          ...complaintData,
          comments: complaintData.comments || [], // Ensure comments is always an array
        });
        setStatus(complaintData.status);
      } catch (error) {
        console.error("Error fetching complaint details:", error);
      }
    };
    fetchComplaint();
  }, [complaint_id]);

  // Handle status update
  const handleStatusChange = async (e) => {
    const updatedStatus = e.target.value;
    setStatus(updatedStatus);
    console.log(complaint_id);

    try {
      await axios.put(
        `${baseUrl}/admin-api/update-status/${complaint_id}`,
        { status: updatedStatus }
      );
      setComplaint((prev) => ({ ...prev, status: updatedStatus }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Handle new comment submission
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: (complaint.comments.length || 0) + 1, // Ensure length exists
      date: new Date().toISOString(),
      text: newComment,
    };

    try {
      // Sending the entire comment object, not just text
      await axios.post(
        `${baseUrl}/admin-api/complaints/${complaint_id}/comment`,
        { comment: newCommentObj } // Send the complete comment object
      );
      setComplaint((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newCommentObj], // Ensure comments exist
      }));
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Handle delete complaint
  const handleDeleteComplaint = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this complaint?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${baseUrl}/admin-api/delete-complaint/${complaint_id}`
      );
      alert("Complaint has been deleted successfully.");
      navigate("/adminpage");
    } catch (error) {
      console.error("Error deleting complaint:", error);
    }
  };

  if (!complaint) {
    return <div className="container">Loading complaint details...</div>;
  }

  return (
    <div className="complaint-page">
      <div className="container">
        <h1 className="page-title fs-1 fw-bold">Complaint Details</h1>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end align-items-center mb-4">
          <div className="action-buttons">
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDeleteComplaint}
            >
              <i className="bi bi-trash3-fill me-1"></i> Delete Complaint
            </button>
          </div>
        </div>

        {/* Complaint Card */}
        <div className="card mb-4">
          <div className="card-body">
            <h1 className="h4 fw-bold">{complaint.title}</h1>
            <div className="complaint-meta mt-2">
              <span className="me-3">
                <i className="bi bi-calendar3 me-1"></i>{" "}
                {formatDate(complaint.timestamp)}
              </span>
              <span className="badge bg-info">{complaint.category}</span>
              <span className="ms-3">
                <i className="bi bi-hand-thumbs-up me-1"></i> {complaint.likes}{" "}
                upvotes |{" "}
                <i className="bi bi-hand-thumbs-down me-1"></i> {complaint.dislikes}{" "}
                downvotes
              </span>
            </div>
            <p className="lead mt-3">{complaint.description}</p>

            {/* GitHub Issue Link */}
            {complaint.github_issue && (
              <>
                <h6 className="text-muted">GitHub Issue Link:</h6>
                <a
                  href={complaint.github_issue}
                  className="github-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-github me-2"></i> {complaint.github_issue}
                </a>
              </>
            )}

            {/* Status Dropdown */}
            <div className="mt-4">
              <h6>Update Status</h6>
              <select
                className="form-select"
                value={status}
                onChange={handleStatusChange}
              >
                <option value="Pending">🟡 Pending</option>
                <option value="Ongoing">🔵 Ongoing</option>
                <option value="Resolved">🟢 Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="h5 mb-3">Your Comments</h3>
            {complaint.comments && complaint.comments.length > 0 ? (
              complaint.comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <small className="text-muted">
                    {formatDate(comment.date)}
                  </small>
                  <p className="mb-0">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-muted">No comments yet.</p>
            )}

            <textarea
              className="form-control"
              placeholder="Add your comment here..."
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
            <button
              className="btn btn-primary mt-3 w-25 mx-auto d-block"
              onClick={handleCommentSubmit}
            >
              <i className="bi bi-send-fill me-2"></i> Submit Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsDetails;
