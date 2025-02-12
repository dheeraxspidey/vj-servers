const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());  // To handle cookies

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";
const EDUPRIME_API_KEY = process.env.EDUPRIME_API_KEY || "1234567890";
const EDUPRIME_BASE_URL = process.env.EDUPRIME_BASE_URL || "https://automation.vnrvjiet.ac.in/eduprime3sandbox/api/";

console.log("JWT_SECRET:", JWT_SECRET ? "Loaded ✅" : "❌ Missing JWT_SECRET");
console.log("EDUPRIME_API_KEY:", EDUPRIME_API_KEY ? "Loaded ✅" : "❌ Missing EDUPRIME_API_KEY");

app.post("/auth/eduprime", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }

    try {
        console.log("Attempting EduPrime login for:", username);

        // 🔹 Send credentials to EduPrime API
        const response = await axios.post(
            `${EDUPRIME_BASE_URL}Auth/Validate`,
            { UserName: username, Password: password },
            { headers: { APIKey: EDUPRIME_API_KEY, "Content-Type": "application/json" } }
        );

        if (response.data.Status !== 1) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // ✅ EduPrime Auth Successful: Extract token
        const eduprimeToken = response.data.Data;

        const userPayload = { username: username };
        const jwtToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "1h" });

        res.cookie('token', jwtToken, {  
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 6 * 60 * 60 * 1000, 
            sameSite: 'Strict',
        });

        // 🎉 Send success response
        return res.status(200).json({ message: "Authentication successful", token: jwtToken });

    } catch (error) {
        console.error("EduPrime Auth Failed:", error.response?.data || error.message);
        return res.status(500).json({ error: "Authentication failed" });
    }
});

// 🔹 Protected Route: Validate JWT & Return User Info
app.get("/auth/profile", (req, res) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const jwtToken = token.replace("Bearer ", "");
        const decoded = jwt.verify(jwtToken, JWT_SECRET);
        console.log("Decoded User:", decoded);
        res.json(decoded);
    } catch (error) {
        console.error("JWT Verification Failed:", error.message);
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
});

// 🔹 Start Server
app.listen(5001, () => console.log("✅ EduPrime SSO Service running on port 5001"));
