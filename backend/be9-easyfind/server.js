require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const authRoutes = require("./apis/auth/auth.route");
const itemsRoutes = require("./apis/items/items.route");    
const userDetails = require("./apis/users/userDetails");
// const securityRoutes = require("./apis/security/security.route");

const app = express();

// Database connection
    
// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
require("./config/passport");

// Routes
app.use("/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api", userDetails);
// app.use("/api/security", securityRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
