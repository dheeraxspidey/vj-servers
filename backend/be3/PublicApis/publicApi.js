const exp = require('express');
const publicApi = exp.Router();
const ExpressAsyncHandler=require('express-async-handler')


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
        console.log(`Internal Server Error ${error.message}`)
    }
}));

module.exports = publicApi;

