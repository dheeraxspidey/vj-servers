const exp = require('express');
const expressAsyncHandler = require('express-async-handler');
const privateApi = exp.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config()
const allowedOrigin=process.env.FRONTEND_URL
privateApi.get('/get-all-applications', expressAsyncHandler(async (req, res) => {
    const origin = req.get('origin');

    if (!origin || !allowedOrigin == origin) {
        console.log(`❌ Blocked CORS request from: ${origin}`);
        return res.status(403).send({ message: "Access Denied", success: false });
    }

    try {
        const vnrApplications = req.app.get('vnrApplications');
        const data = await vnrApplications.find({}, {
            projection: {
                appName: 1,
                description: 1,
                createdBy: 1,
                handledBy: 1,
                lastUpdated: 1,
                createdDate: 1,
                status: 1,
                url: 1,
            }
        }).toArray();  

        if (data.length === 0) {
            return res.send({ message: "Applications Not Found", data: data, success: false });
        }

        return res.send({ message: "Applications Found", data: data, success: true });
    } catch (error) {
        return res.send({ message: "Internal Server Error", success: false });
    }
}));
privateApi.post('/update-url', expressAsyncHandler(async (req, res) => {
    const origin = req.get('origin');
    if (origin !== allowedOrigin) {
        return res.status(403).send({ message: "Access Denied", success: false });
    }

    const { appName, newUrl } = req.body;
    if (!appName || !newUrl) {
        return res.status(400).json({ message: "Missing required fields", success: false });
    }

    try {
        const vnrApplications = req.app.get('vnrApplications');
        const result = await vnrApplications.updateOne(
            { appName: appName },
            { $set: { url: newUrl, lastUpdated: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Application not found", success: false });
        }

        return res.json({ message: "URL updated successfully", success: true });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}));

privateApi.post('/set-api', expressAsyncHandler(async (req, res) => {
    const { token } = req.body;
    try {
        res.cookie('token', token, {  
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  
            maxAge: 6 * 60 * 60 * 1000, 
            sameSite: 'Strict',  
        });

        return res.json({ message: "Login successful", token: token });
    } catch (error) {
        return res.status(500).json({ error: "Authentication failed due to server error" });
    }
}));

module.exports = privateApi;
