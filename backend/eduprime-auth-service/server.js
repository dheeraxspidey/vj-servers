const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(
    cors({
        origin: function (origin, callback) {
            callback(null, true); 
        },
        credentials: true, 
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


app.use(express.json());



const JWT_SECRET = process.env.JWT_SECRET;
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

        const response = await axios.post(
            `${EDUPRIME_BASE_URL}Auth/Validate`,
            { UserName: username, Password: password },
            { headers: { APIKey: EDUPRIME_API_KEY, "Content-Type": "application/json" } }
        );

        if (response.data.Status !== 1) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const eduprimeToken = response.data.Data;

        const userPayload = { username, eduprimeToken };
        const jwtToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "1h" });

        console.log("✅ Generated Token:", jwtToken);

        return res.json({
            message: "Authentication successful",
            token: jwtToken
        });

    } catch (error) {
        console.error("EduPrime Auth Failed:", error.response?.data || error.message);
        return res.status(500).json({ error: "Authentication failed" });
    }
});


// 🔹 Start Server
app.listen(5001, () => console.log("✅ EduPrime SSO Service running on port 5001"));
