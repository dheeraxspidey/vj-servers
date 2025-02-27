import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Timer, CheckCircle2, ThumbsUp, ThumbsDown, Search, Calendar, MessageCircle,Clock,ChevronUp, ChevronDown } from "lucide-react";
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
  "Others"
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
  const [expanded, setExpanded] = useState({}); // Track which complaint updates are visible
  const baseUrl = process.env.REACT_APP_COMPLAINTS_APP_BE_URL;

  useEffect(() => {
    fetchComplaints();
  }, [categoryFilter, statusFilter]);

  const fetchComplaints = async () => {
    try {
      const url = `${baseUrl}/user-api/filter-complaints?category=${categoryFilter}&status=${statusFilter}`;
      const response = await axios.get(url);
      if (response.data && Array.isArray(response.data.complaints)) {
        setComplaints(response.data.complaints);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setComplaints([]);
    }
  };

  const handleVote = async (id, type) => {
    if (!token) {
      alert("Please log in to vote.");
      return;
    }

    try {
      const url = `${baseUrl}/user-api/${type === "upvote" ? "like" : "dislike"}-complaint/${id}`;
      await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) => {
          if (complaint.complaint_id === id) {
            const currentVote = userVotes[id];
            let newLikes = complaint.likes;
            let newDislikes = complaint.dislikes;

            if (currentVote === "upvote" && type === "downvote") {
              newLikes -= 1;
              newDislikes += 1;
            } else if (currentVote === "downvote" && type === "upvote") {
              newLikes += 1;
              newDislikes -= 1;
            } else if (!currentVote) {
              if (type === "upvote") newLikes += 1;
              else newDislikes += 1;
            } else if (currentVote === type) {
              if (type === "upvote") newLikes -= 1;
              else newDislikes -= 1;
            }

            return {
              ...complaint,
              likes: newLikes,
              dislikes: newDislikes,
            };
          }
          return complaint;
        })
      );

      setUserVotes((prevVotes) => {
        const currentVote = prevVotes[id];
        if (currentVote === type) {
          const { [id]: _, ...rest } = prevVotes;
          return rest;
        } else {
          return { ...prevVotes, [id]: type };
        }
      });
    } catch (error) {
      console.error("Error updating vote:", error.response?.data || error.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown Date";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleUpdates = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = search ? complaint.title.toLowerCase().includes(search.toLowerCase()) : true;
    const matchesCategory = categoryFilter ? complaint.category === categoryFilter : true;
    const matchesStatus = statusFilter ? complaint.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="complaints-list container">
          {filteredComplaints.length === 0 ? (
            <div className="no-complaints">
              <p>No complaints found.</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
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
                      aria-label="Upvote"
                    >
                      <ThumbsUp size={20} />
                      <span className="vote-count">{complaint.likes}</span>
                    </button>
                    <button
                      className={`vote-btn downvote ${userVotes[complaint.complaint_id] === "downvote" ? "voted" : ""}`}
                      onClick={() => handleVote(complaint.complaint_id, "downvote")}
                      aria-label="Downvote"
                    >
                      <ThumbsDown size={20} />
                      <span className="vote-count">{complaint.dislikes}</span>
                    </button>
                  </div>
                </div>
                <div className="card-content">
                  <h4>{complaint.title}</h4>
                  <p>{complaint.description}</p>
                  <div className="card-footer">
                    <span className="category-tag">{complaint.category}</span>
                    <span className={`status-badge ${complaint.status.toLowerCase()}`}>
                      {complaint.status === "Resolved" ? (
                        <CheckCircle2 className="status-icon" size={18} />
                      ) : (
                        <Timer className="status-icon" size={18} />
                      )}
                      {complaint.status}
                    </span>
                  </div>

                  {/* Admin Updates Section */}
                  <button
                    className="admin-updates-btn"
                    onClick={() => toggleUpdates(complaint.complaint_id)}
                  >
                    🛠 Admin Updates {expanded[complaint.complaint_id] ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {expanded[complaint.complaint_id] && (
                    <div className="admin-updates-section">
                      {complaint.comments && complaint.comments.length > 0 ? (
                        complaint.comments.map((comment) => (
                          <div key={comment.id} className="admin-update">
                            <p className="update-text">{comment.text}</p>
                            <span className="update-time">
                              <Clock  /> {formatDate(comment.date)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="no-updates">No updates available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <button className="add-complaint-btn" onClick={() => navigate("/complaint-form")}>
          ➕ Add Complaint
        </button>
      </div>
    </div>
  );
};

export default Home;