import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Timer,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Search,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import "./Home.css";

const CATEGORIES = [
  "Infrastructure",
  "Transport",
  "Canteen",
  "Faculty and Staff",
  "Examination",
  "Fee Payment",
  "Hostel and Accommodation",
  "Extracurricular and Events",
  "Others",
];
const STATUSES = ["Pending", "Ongoing", "Resolved"];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.accessToken;
  const [userVotes, setUserVotes] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState([]);
  const baseUrl = process.env.REACT_APP_COMPLAINTS_APP_BE_URL;

  useEffect(() => {
    fetchComplaints();
  }, [categoryFilter, statusFilter]);

  const fetchComplaints = async () => {
    try {
      const url = `${baseUrl}/user-api/filter-complaints?category=${categoryFilter}&status=${statusFilter}`;
      const response = await axios.get(url);
      const data = response.data?.complaints || [];
      setComplaints(data);
      
      const votes = {};
      data.forEach((complaint) => {
        if (Array.isArray(complaint.votedUsers)) {
          const userVote = complaint.votedUsers.find((v) => v.email === user?.email);
          if (userVote) votes[complaint.complaint_id] = userVote.type;
        }
      });
      setUserVotes(votes);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setComplaints([]);
    }
  };

  const handleVote = async (id, type) => {
    if (!token) return alert("Please log in to vote.");
    if (userVotes[id] === type) return; // Prevent duplicate voting
    
    try {
      const url = `${baseUrl}/user-api/${type === "upvote" ? "like" : "dislike"}-complaint/${id}`;
      await axios.post(url, { email: user?.email }, { headers: { Authorization: `Bearer ${token}` } });
      setUserVotes((prevVotes) => ({ ...prevVotes, [id]: type })); // Update state immediately
      fetchComplaints();
    } catch (error) {
      console.error("Error updating vote:", error.response?.data || error.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown Date";
    return new Date(timestamp).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="home-container-page">
      <div className="homepage-container container">
        <div className="header container">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="">All Status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="complaints-list container">
          {complaints.length === 0 ? (
            <p>No complaints found.</p>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.complaint_id} className="complaint-card">
                <div className="card-header">
                  <div className="date-info">
                    <Calendar className="calendar-icon" size={18} />
                    <span className="date">{formatDate(complaint.timestamp)}</span>
                  </div>
                  <div className="voting-section">
                    <button
                      className={`vote-btn upvote ${userVotes[complaint.complaint_id] === "upvote" ? "voted" : ""}`}
                      onClick={() => handleVote(complaint.complaint_id, "upvote")}
                    >
                      <ThumbsUp size={20} />
                      <span className="vote-count">{complaint.likes}</span>
                    </button>
                    <button
                      className={`vote-btn downvote ${userVotes[complaint.complaint_id] === "downvote" ? "voted" : ""}`}
                      onClick={() => handleVote(complaint.complaint_id, "downvote")}
                    >
                      <ThumbsDown size={20} />
                      <span className="vote-count">{complaint.dislikes}</span>
                    </button>
                  </div>
                </div>
                <div className="card-content">
                  <h4>{complaint.title}</h4>
                  <p>{complaint.description}</p>
                  {complaint.github_issue && (
                    <a href={complaint.github_issue} target="_blank" rel="noopener noreferrer" className="github-link">
                      <LinkIcon size={18} /> View GitHub Issue
                    </a>
                  )}
                  <div className="card-footer">
                    <span className="category-tag">{complaint.category}</span>
                    <span className={`status-badge ${complaint.status.toLowerCase()}`}>
                      {complaint.status === "Resolved" ? <CheckCircle2 size={18} /> : <Timer size={18} />}
                      {complaint.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <button className="add-complaint-btn" onClick={() => navigate("/complaint-form")}>➕ Add Complaint</button>
      </div>
    </div>
  );
};

export default Home;