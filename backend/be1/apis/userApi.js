const exp = require('express');
const userApi = exp.Router();
const ExpressAsyncHandler = require('express-async-handler');

userApi.post('/register', ExpressAsyncHandler(async (req, res) => {
  const vnrCollections = req.app.get('vnrCollections');
  const data = req.body;

  if (!data) {
    return res.status(400).send({ message: "Data is required" });
  }

  const found = await vnrCollections.findOne({ username: data.username });
  if (found) {
    return res.status(400).send({ message: "User already exists in the database", success: false });
  }

  const done = await vnrCollections.insertOne(data);
  if (done.acknowledged) {
    return res.status(201).send({ message: "User added successfully", success: true });
  }

  return res.status(500).send({ message: "Error occurred while adding user" });
}));

module.exports = { userApi };
