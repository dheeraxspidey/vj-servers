const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// ✅ Trust Proxy if Behind Nginx or Cloudflare
app.set("trust proxy", 1);

// ✅ CORS Middleware Fixes (Allow Private Network Access)

app.use(
  cors({
    origin: "http://campus.vnrzone.site",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true"); // 🔹 Allow Private Network Access
  next();
});


// ✅ Explicitly Set Private Network Access Header in Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true"); // 🔹 Allow PNA
  next();
});

// ✅ Enable JSON Parsing
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const EDUPRIME_API_KEY = process.env.EDUPRIME_API_KEY || "1234567890";
const EDUPRIME_BASE_URL =
  process.env.EDUPRIME_BASE_URL ||
  "https://automation.vnrvjiet.ac.in/eduprime3sandbox/api/";

console.log("JWT_SECRET:", JWT_SECRET ? "Loaded ✅" : "❌ Missing JWT_SECRET");
console.log("EDUPRIME_API_KEY:", EDUPRIME_API_KEY ? "Loaded ✅" : "❌ Missing EDUPRIME_API_KEY");

// ✅ Auth Route for EduPrime
app.post("/auth/eduprime", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    console.log("🔹 Attempting EduPrime login for:", username);

    // ✅ Make Request to EduPrime
    const response = await axios.post(
      `${EDUPRIME_BASE_URL}Auth/Validate`,
      { UserName: username, Password: password },
      { headers: { APIKey: EDUPRIME_API_KEY, "Content-Type": "application/json" } }
    );

    // ✅ Handle Invalid Login
    if (response.data.Status !== 1) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Generate JWT Token
    const eduprimeToken = response.data.Data;
    const userPayload = { username, eduprimeToken };
    const jwtToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "1h" });

    console.log("✅ Generated Token:", jwtToken);

    return res.json({
      message: "Authentication successful",
      token: jwtToken,
    });
  } catch (error) {
    console.error("❌ EduPrime Auth Failed:", error.response?.data || error.message);
    return res.status(500).json({ error: "Authentication failed" });
  }
});

// ✅ Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 EduPrime SSO Service running on port ${PORT}`));
