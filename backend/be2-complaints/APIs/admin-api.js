const exp = require('express');
const asyncHandler = require('express-async-handler');
const jwt = require("jsonwebtoken"); 

const adminApp = exp.Router();
adminApp.use(exp.json()); // Middleware to parse JSON

let complaintsCollectionObj;
let adminsCollectionObj;
let flaggedusersCollectionObj;

// Middleware to get the collection object from the app
adminApp.use((req, res, next) => {
    complaintsCollectionObj = req.app.get('complaintsCollectionObj');
    adminsCollectionObj= req.app.get('adminsCollectionObj');
    flaggedusersCollectionObj=req.app.get('flaggedusersCollectionObj')
    next();
});

//Admin Login
adminApp.post("/login", async (req, res) => {
    const { admin_id, password } = req.body;
    

    try {
        // Ensure field names match your MongoDB collection
        const admin = await adminsCollectionObj.findOne({ admin_id });

        if (!admin) return res.status(400).json({ message: "Admin not found" });

        if (password !== admin.password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ admin_id: admin.admin_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Exclude password before sending the response
        const { password: _, ...adminData } = admin;

        res.json({ token, adminData, message: "Login successful" });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});




// GET API to view all complaints (sorted by priority)
adminApp.get('/view-complaints', asyncHandler(async (req, res) => {
    const complaints = await complaintsCollectionObj
        .find()
        .sort({ priority_score: -1, timestamp: -1 })
        .toArray();

    if (complaints.length === 0) {
        return res.status(404).json({ message: "No complaints found" });
    }

    res.status(200).json({ complaints });
}));

//GET Complaint Details by complaint ID
adminApp.get('/view-complaint/:complaintId', asyncHandler(async (req, res) => {
    const complaintId = req.params.complaintId; // Get complaint ID from request params

    try {
        const complaint = await complaintsCollectionObj.findOne({ complaint_id: complaintId });

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.status(200).json({ complaint });
    } catch (error) {
        console.error("Error fetching complaint:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));


//GET complaints Count
adminApp.get(
    "/complaints-count/:category",  // Category is passed as a URL parameter
    asyncHandler(async (req, res) => {
      try {
        // Get category from the URL parameter
        const { category } = req.params;
  
        // Fetch counts for each status within the specified category
        const [pendingCount, resolvedCount, ongoingCount] = await Promise.all([
          complaintsCollectionObj.countDocuments({ status: "Pending", category }),
          complaintsCollectionObj.countDocuments({ status: "Resolved", category }),
          complaintsCollectionObj.countDocuments({ status: "Ongoing", category })
        ]);
  
        // Send response with the counts for the given category
        res.status(200).json({
          pending: pendingCount,
          resolved: resolvedCount,
          ongoing: ongoingCount,
        });
        
      } catch (error) {
        console.error("Error fetching complaint counts:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    })
  );
  

// PUT API to update complaint status (Pending → In Progress → Resolved)
adminApp.put('/update-status/:complaint_id', asyncHandler(async (req, res) => {
    const complaintId = req.params.complaint_id;
    const { status } = req.body;

    const validStatuses = ["Pending", "Ongoing", "Resolved"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    const updateResult = await complaintsCollectionObj.updateOne(
        { complaint_id: complaintId },
        { $set: { status } }
    );

    if (updateResult.matchedCount === 0) {
        return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Complaint status updated successfully", status });
}));

// DELETE API to remove a complaint
adminApp.delete('/delete-complaint/:complaint_id', asyncHandler(async (req, res) => {
    const complaintId = req.params.complaint_id;

    const deleteResult = await complaintsCollectionObj.deleteOne({ complaint_id: complaintId });

    if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Complaint deleted successfully" });
}));

// GET API to filter complaints
adminApp.get('/filter-complaints', asyncHandler(async (req, res) => {
    const { category, status, dateRange } = req.query;

    let query = {};

    if (category) {
        query.category = category;
    }

    if (status) {
        query.status = status;
    }

    if (dateRange) {
        const { startDate, endDate } = getDateRange(dateRange);
        if (startDate && endDate) {
            query.timestamp = {
                $gte: startDate,
                $lte: endDate
            };
        }
    }

    const complaints = await complaintsCollectionObj.find(query).toArray();

    if (complaints.length > 0) {
        res.status(200).json({ complaints });
    } else {
        res.status(404).json({ message: "No complaints found for the given filters" });
    }
}));

// Helper function to get the start and end of the week or month
function getDateRange(dateRange) {
    const now = new Date();
    let startDate, endDate;

    if (dateRange === 'weekly') {
        const dayOfWeek = now.getDay();
        startDate = new Date(now.setDate(now.getDate() - dayOfWeek));
        endDate = new Date(now.setDate(now.getDate() + (6 - dayOfWeek)));
    } else if (dateRange === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
        return null;
    }

    return { startDate, endDate };
}

// Route to add a comment to a complaint
adminApp.post('/complaints/:id/comment', asyncHandler(async (req, res) => {
    const { id } = req.params; // Get complaint ID from URL
    const { comment } = req.body; // Get the full comment object from request body
   

    if (!comment || !comment.text) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const result = await complaintsCollectionObj.updateOne(
        { complaint_id: id },
        { $push: { comments: comment } } // Push new comment into the comments array
    );

    if (result.modifiedCount > 0) {
        res.json({ message: "Comment added successfully" });
    } else {
        res.status(404).json({ message: "Complaint not found or comment could not be added" });
    }
}));



module.exports = adminApp;