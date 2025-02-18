const exp = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();
const privateApi=require('./PublicApis/publicApi')
const jwt = require('jsonwebtoken');
const mc = require('mongodb').MongoClient;

const app = exp();
let dynamicOrigins = [];  // Declare dynamicOrigins globally

app.use(exp.json());
app.use(cookieParser());

// CORS Configuration 
const corsOptions = {
  origin: (origin, callback) => {
    const alwaysAllowedOrigins = [
      process.env.FRONTEND_URL, 
      "http://campus.vnrzone.site"  // ✅ Always allow this
    ];

    if (!origin || alwaysAllowedOrigins.includes(origin) || dynamicOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ Blocked CORS request from: ${origin}`); // Debugging logs
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};


app.use(cors(corsOptions)); // Ensure CORS middleware is above route definitions

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
  callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
  scope: ['user:email']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', (req, res, next) => {
  passport.authenticate('github', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/failure`); // Handle failure

    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log("GitHub Authentication Success!");

      // Redirect to frontend with a session token or user info
      res.redirect(`${process.env.FRONTEND_URL}`);
    });
  })(req, res, next);
});


// Public Route for User Info
app.get('/api/user', cors({ origin: true, credentials: true }), (req, res) => {
  const token = req.cookies.token;

  if (req.isAuthenticated()) {
    const { username, displayName, emails, photos } = req.user;
    const user = {
      username: username,
      name: displayName,
      email: emails && emails.length > 0 ? emails[0].value : null,
      avatar: photos && photos.length > 0 ? photos[0].value : null,
      userType: 'admin'
    };

    return res.send({ message: "Token Validated Successfully", user });
  }

  if (token) {
    jwt.verify(token, 'abcd', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = {
        username: decoded.username,
        userType: 'admin'
      };

      return res.send({ message: "Token Validated Successfully", user });
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

app.use('/public', privateApi);

// Database Connection and Fetch Origins
mc.connect(process.env.DB_URL)
  .then(client => {
    const vnrDB = client.db('VNR_DB');
    const vnrApplications = vnrDB.collection('VNR_APPLICATIONS');
    app.set('vnrApplications', vnrApplications);
    console.log('Connected to Database...');

    fetchAccessOrigins(vnrApplications);  // Fetch dynamic origins from DB

    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Server is Running on PORT : ${port}...`);
    });

    setInterval(() => fetchAccessOrigins(vnrApplications), 5 * 60 * 1000);  // Refresh every 5 minutes
  })
  .catch(err => {
    console.log(`Error Occurred at Database :- ${err}...`);
  });

// Function to Fetch Allowed Origins from DB
const fetchAccessOrigins = async (vnrApplications) => {
  try {
    const origins = await vnrApplications.find({}).toArray();
    dynamicOrigins = origins.map(item => item.url);  // Assuming DB stores origins under 'url' field
    console.log('Allowed Origins:', dynamicOrigins);
  } catch (err) {
    console.error('Error fetching allowed origins:', err);
  }
};

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(500).send({ message: `Error Occurred: ${err.message}` });
});
