const exp = require("express");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const axios = require("axios");
const authenticateUser = require("../Middleware/authMiddleware.js");


dotenv.config(); // Load environment variables

const userApp = exp.Router();
userApp.use(exp.json()); // Middleware to parse JSON

let complaintsCollectionObj;

// Middleware to get the collection object from the app
userApp.use((req, res, next) => {
    complaintsCollectionObj = req.app.get("complaintsCollectionObj");
    next();
});

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Step 1: Redirect to GitHub OAuth
userApp.get("/auth/github", (req, res) => {
  const redirectUri = "http://localhost:5000/auth/github/callback";
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user`
  );
});

// Step 2: GitHub Callback and Token Exchange
userApp.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = response.data.access_token;
    res.json({ token: accessToken });
  } catch (error) {
    res.status(500).json({ error: "GitHub Authentication Failed" });
  }
});

  

userApp.post(
  "/add-complaint",
  asyncHandler(async (req, res) => {
 

    const { complaint_id, title, description, category, user_id, github_issue } = req.body;

    // Validate required fields
    if (!complaint_id || !title || !description || !category || !user_id) {
      
      return res.status(400).json({
        message: "Complaint ID, title, description, category, and user ID are required",
      });
    }

    const newComplaint = {
      complaint_id,
      title,
      description,
      category,
      user_id,
      github_issue: github_issue || null, // Added github_issue (default to null if not provided)
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      status: "Pending",
      comments: [],
      flagged: false,
      votedUsers: {} // Initialize empty object to track user votes
    };

    try {
      const result = await complaintsCollectionObj.insertOne(newComplaint);

      if (result.acknowledged) {
        res.status(201).json({ message: "Complaint added successfully", complaint: newComplaint });
      } else {
        res.status(500).json({ message: "Failed to add complaint" });
      }
    } catch (error) {
      
      res.status(500).json({ message: "Database error" });
    }
  })
);


  

// GET API to fetch complaints of a specific user and count of pending, resolved, and ongoing complaints
userApp.get("/view-complaints/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params; // Get the userId from the URL parameter

  // Fetch the complaints of the specific user
  const complaints = await complaintsCollectionObj
    .find({ user_id: userId }) // Filter by userId
    .sort({ timestamp: -1 }) // Sort by timestamp in descending order (most recent first)
    .toArray();

  // Count complaints by status
  const counts = {
    pending: complaints.filter(complaint => complaint.status === 'Pending').length,
    resolved: complaints.filter(complaint => complaint.status === 'Resolved').length,
    ongoing: complaints.filter(complaint => complaint.status === 'Ongoing').length
  };

  res.status(200).json({
    complaints,
    counts
  });
}));


//To fetch Users Complaints

userApp.get("/my-complaints/:user_id", asyncHandler(async (req, res) => {
  const userId = req.params.user_id; // Extract user_id from request parameters

  const userComplaints = await complaintsCollectionObj
      .find({ user_id: userId }) // Filter complaints by user_id
      .sort({ timestamp: -1 }) // Sort by timestamp (most recent first)
      .toArray();

  res.status(200).json({ complaints: userComplaints });
}));



// POST API to like a complaint


// POST API to like a complaint
userApp.post("/like-complaint/:complaint_id", authenticateUser, asyncHandler(async (req, res) => {
  const { complaint_id } = req.params;
  const userId = req.user.id; // Extracted from JWT

  const complaint = await complaintsCollectionObj.findOne({ complaint_id });

  if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
  }

  // Check if user already voted
  if (complaint.votedUsers && complaint.votedUsers[userId] === "upvote") {
      return res.status(400).json({ message: "You have already liked this complaint" });
  }

  let updateQuery = {};

  if (complaint.votedUsers && complaint.votedUsers[userId] === "downvote") {
      // User previously disliked, switch to like
      updateQuery = {
          $inc: { likes: 1, dislikes: -1 },
          $set: { [`votedUsers.${userId}`]: "upvote" }
      };
  } else {
      // User is liking for the first time
      updateQuery = {
          $inc: { likes: 1 },
          $set: { [`votedUsers.${userId}`]: "upvote" }
      };
  }

  const result = await complaintsCollectionObj.updateOne(
      { complaint_id },
      updateQuery
  );

  res.status(200).json({ message: "Complaint liked successfully" });
}));

// POST API to dislike a complaint
userApp.post("/dislike-complaint/:complaint_id", authenticateUser, asyncHandler(async (req, res) => {
  const { complaint_id } = req.params;
  const userId = req.user.id; // Extracted from JWT

  const complaint = await complaintsCollectionObj.findOne({ complaint_id });

  if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
  }

  // Check if user already voted
  if (complaint.votedUsers && complaint.votedUsers[userId] === "downvote") {
      return res.status(400).json({ message: "You have already disliked this complaint" });
  }

  let updateQuery = {};

  if (complaint.votedUsers && complaint.votedUsers[userId] === "upvote") {
      // User previously liked, switch to dislike
      updateQuery = {
          $inc: { likes: -1, dislikes: 1 },
          $set: { [`votedUsers.${userId}`]: "downvote" }
      };
  } else {
      // User is disliking for the first time
      updateQuery = {
          $inc: { dislikes: 1 },
          $set: { [`votedUsers.${userId}`]: "downvote" }
      };
  }

  const result = await complaintsCollectionObj.updateOne(
      { complaint_id },
      updateQuery
  );

  res.status(200).json({ message: "Complaint disliked successfully" });
}));

// Helper function to get the start and end of the week or month
function getDateRange(dateRange) {
    const now = new Date();
    let startDate, endDate;

    if (dateRange === "weekly") {
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(now.setDate(now.getDate() + 6));
    } else if (dateRange === "monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
        return null;
    }

    return { startDate, endDate };
}

// GET API to filter complaints with text-based search
userApp.get("/filter-complaints", asyncHandler(async (req, res) => {
  const { category, status, dateRange, searchKeyword } = req.query;
  let query = {};

  if (searchKeyword) query.$text = { $search: searchKeyword };
  if (category) query.category = category;
  if (status) query.status = status;
  if (dateRange) {
      const { startDate, endDate } = getDateRange(dateRange);
      if (startDate && endDate) query.timestamp = { $gte: startDate, $lte: endDate };
  }

  const complaints = await complaintsCollectionObj.find(query).sort({ timestamp: -1 }).toArray();
  res.status(200).json({ complaints });
}));
module.exports = userApp;
