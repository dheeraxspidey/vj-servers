require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

console.log("KP client id")
console.log(process.env.GOOGLE_CLIENT_ID);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    console.log("KP client id")
    console.log(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, hd } = payload;

    console.log("1 Google Payload:", payload);

    // Ensure only VNRVJIET users can log in
    if (hd !== "vnrvjiet.in") {
      return res.status(403).json({ error: "Unauthorized domain" });
    }

    // Generate a new JWT token for the session
    const userToken = jwt.sign({ email, name, picture }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("2 About to exit with token");
    res.json({ token: userToken, user: { email, name, picture } });
  } catch (error) {
    console.log("Error occured");
    res.status(401).json({ error: "Invalid Token" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
