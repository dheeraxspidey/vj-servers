const exp = require('express');
const app = exp();
const mc = require('mongodb').MongoClient;
require('dotenv').config();
const { userApi } = require('./apis/userApi');
const cors = require('cors');

app.use(cors({
    origin: "http://localhost:3100", 
    credentials: true                 
}));

mc.connect(process.env.DB_URL)
  .then(client => {
    const vnr = client.db('vnr');
    const vnrCollections = vnr.collection('vnrCollections');

    app.set('vnrCollections', vnrCollections);

    console.log("Connected to Database...");

  })
  .catch(er => {
    console.error(`Error occurred during database connection: ${er.message}`);
    process.exit(1);  
  });
  
app.use(exp.json());
app.use('/user', userApi);

app.listen(process.env.PORT, () => {
    console.log(`Server is Running on PORT: ${process.env.PORT}`);
  });

app.use((err, req, res, next) => {
  console.error(`Error occurred: ${err.message}`);
  res.status(500).send({ message: `Internal server error: ${err.message}` });
});
