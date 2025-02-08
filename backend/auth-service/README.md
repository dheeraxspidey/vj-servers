# About it

This service starts SSO using GCP API Service. 

# One Time commands

npm install

# How to start

export NODE_OPTIONS="--dns-result-order=ipv4first"

npm start

## Next steps

Run a frontend server that needs SSO

## Explanation on the seqence of steps

1️⃣ The user visits http://localhost:3001/ 
 User clicks "Login with Google" in Flask frontend 
2️⃣	Flask redirects to Auth-Service (localhost:5000/auth/google)
3️⃣	Auth-Service redirects to Google Login
4️⃣	Google redirects back to Auth-Service (localhost:5000/auth/google/callback?code=...)
5️⃣	Auth-Service exchanges code for access token
6️⃣	Auth-Service fetches user profile from Google
7️⃣	Auth-Service creates a JWT token
8️⃣	Auth-Service redirects user back to Flask with token=JWT_TOKEN
9️⃣	Flask validates the token (/auth/profile) and stores user info
🔟 Flask displays the user profile (/dashboard)


## How to test

curl -H "Authorization: Bearer JWT_TOKEN" http://localhost:5000/auth/profile

