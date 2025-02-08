const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");

// ✅ Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// ✅ Debugging logs (Remove in production)
console.log("JWT_SECRET:", JWT_SECRET ? "Loaded ✅" : "❌ Missing JWT_SECRET");
console.log("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "Loaded ✅" : "❌ Missing GOOGLE_CLIENT_ID");

// 🔹 Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    const userInfo = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value
    };
    return done(null, userInfo);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// 🔹 Google Login Route
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 🔹 Google OAuth Callback
app.get("/auth/google/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).json({ error: "Missing authorization code" });

    try {
        console.log("Received Google auth code:", code);

        // 🔹 Exchange Authorization Code for Access Token
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", new URLSearchParams({
            code: code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: "http://localhost:5000/auth/google/callback",
            grant_type: "authorization_code"
        }).toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        const accessToken = tokenResponse.data.access_token;

        // 🔹 Fetch User Details
        const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const userInfo = userResponse.data;

        // 🔹 Generate JWT Token
        const jwtToken = jwt.sign(userInfo, JWT_SECRET, { expiresIn: "1h" });

        // 🔹 Redirect to Frontend with Token
        return res.redirect(`${FRONTEND_URL}/callback?token=${jwtToken}`);

    } catch (error) {
        console.error("Error exchanging code for token:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to authenticate" });
    }
});

// 🔹 Protected Route: Validate JWT & Return User Info
app.get("/auth/profile", (req, res) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        // Remove "Bearer " prefix if present
        const jwtToken = token.replace("Bearer ", "");

        // Verify JWT
        const decoded = jwt.verify(jwtToken, JWT_SECRET);
        console.log("Decoded User:", decoded);
        res.json(decoded);
    } catch (error) {
        console.error("JWT Verification Failed:", error.message);
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
});

// 🔹 Start Server
app.listen(5000, () => console.log("✅ Auth Service running on port 5000"));
