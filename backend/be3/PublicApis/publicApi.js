const exp = require('express');
const expressAsyncHandler = require('express-async-handler');
const publicApi = exp.Router();
const ExpressAsyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')


publicApi.get('/get-all-applications',ExpressAsyncHandler(async (req, res) => {
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
                url:1,
            }
        }).toArray();  
        if (data.length === 0) {
            return res.send({ message: "Applications Not Found", data:data,success: false });
        }
        return res.send({ message: "Applications Found", data: data, success: true });
    } catch (error) {
        return res.send({ message: "Internal Server Error ", success: false });
    }
}));
publicApi.post('/login', expressAsyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }

    try {
        const userPayload = { username: username };
        const jwtToken = jwt.sign(userPayload, 'abcd', { expiresIn: "1h" });
        res.cookie('token', jwtToken, {  
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  
    maxAge: 6 * 60 * 60 * 1000, 
    sameSite: 'Strict',  
});

        return res.json({ message: "Login successful", token: jwtToken });

    } catch (error) {
        return res.status(500).json({ error: "Authentication failed due to server error" });
    }
}));
module.exports = publicApi;

