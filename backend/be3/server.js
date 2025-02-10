const exp=require('express');
const publicApi = require('./PublicApis/publicApi');
const app=exp();
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
require('dotenv').config();
const cors=require('cors')
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
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/auth/github/callback",
    scope: ['user:email']
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));
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
    if (req.isAuthenticated()) {
        const { username, displayName, emails, photos } = req.user;
        res.json({ 
            username: username,                
            name: displayName,                 
            email: emails && emails.length > 0 ? emails[0].value : null, 
            avatar: photos && photos.length > 0 ? photos[0].value : null 
        });
    } else {
        res.status(401).json({ user: null });
    }
});

app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.clearCookie('connect.sid'); 
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

  
//DataBase Connection
const mc=require('mongodb').MongoClient

mc.connect(process.env.DB_URL)
    .then(client=>{
        const vnrDB=client.db('vnrDB');
        const vnrApplications=vnrDB.collection('vnrApplications');
        app.set('vnrApplications',vnrApplications);
        console.log('Connected to Database...');
        const port=process.env.PORT;
        app.listen(port,()=>
        {
            console.log(`Server is Running on PORT : ${port}...`);
        })
    })
    .catch(er=>
    {
        console.log(`Error Occured at Database :- ${er}...`);
    }
    )
app.use(exp.json());
app.use('/public',publicApi)
app.use((er,req,res,next)=>
{
    console.log(`Error Occured : ${er.message}`);
    res.send({message:`Error Occured :- ${er.message}`})
})
