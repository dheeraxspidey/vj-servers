const exp = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();
const publicApi = require('./PublicApis/publicApi');
const jwt=require('jsonwebtoken')
const app = exp();

app.use(exp.json());  
app.use(cookieParser()); 

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new (require('passport-github2').Strategy)({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:5001/auth/github/callback",
  scope: ['user:email']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:3001/failure' }),
  (req, res) => {
    res.redirect('http://localhost:3001');
  }
);

app.get('/api/user', (req, res) => {
  const token = req.cookies.token;

  if (req.isAuthenticated()) {
      const { username, displayName, emails, photos } = req.user;
      return res.json({
          username: username,
          name: displayName,
          email: emails && emails.length > 0 ? emails[0].value : null,
          avatar: photos && photos.length > 0 ? photos[0].value : null
      });
  }

  if (token) {
      jwt.verify(token, 'abcd', (err, decoded) => {
          if (err) {
              return res.status(401).json({ error: 'Invalid token' });
          }
          return res.json({
              username: decoded.username
          });
      });
  } else {
      return res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/logout', (req, res, next) => {
  req.logout(err => {
      if (err) {
          return next(err);
      }

      res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict'
      });

      res.clearCookie('token', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict'
      });

      res.status(200).json({ message: 'Logged out successfully' });
  });
});


app.use('/public', publicApi);

const mc = require('mongodb').MongoClient;

mc.connect(process.env.DB_URL)
  .then(client => {
    const vnrDB = client.db('vnrDB');
    const vnrApplications = vnrDB.collection('vnrApplications');
    app.set('vnrApplications', vnrApplications);
    console.log('Connected to Database...');
    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Server is Running on PORT : ${port}...`);
    });
  })
  .catch(err => {
    console.log(`Error Occurred at Database :- ${err}...`);
  });

app.use((err, req, res, next) => {
  res.status(500).send({ message: `Error Occurred: ${err.message}` });
});
