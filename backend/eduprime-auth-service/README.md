# About it
This service starts SSO using EduPrime Service. 

# One Time commands
cd ~/vj-servers/backend/eduprime-auth-service$
npm install

# How to start

export NODE_OPTIONS="--dns-result-order=ipv4first"

npm start

## Next steps

Run a frontend server that needs SSO

#### Terminal1 : Frontend1
```
cd ~/vj-servers/frontend/frontend-python-flask

python3 app3_eduprime_sso1.py
```
#### Terminal2 : Frontend2
```
python3 app3_eduprime_sso2.py
```

# 🚀 EduPrime SSO Interaction Between Frontend Servers (3001 & 3002)

## 📌 Overview
This document explains how **Single Sign-On (SSO)** works between two frontend applications (`localhost:3001` and `localhost:3002`) using an authentication server (`localhost:5001`). The SSO setup ensures that:

✅ A user logs in once and is authenticated across multiple frontend applications.
✅ Logout from one app logs the user out from all.
✅ JWT tokens and sessions manage authentication across tabs.

---

## 🔗 **Components & Flow**
### **1️⃣ User Logs in From Any Frontend (3001 or 3002)**
1. User enters **username & password** on either `localhost:3001` or `localhost:3002`.
2. The frontend sends credentials to the **SSO server (`localhost:5001`)** via `POST /auth/eduprime`.
3. The SSO server validates the credentials with EduPrime API (`Auth/Validate`).
4. If valid, the SSO server generates a **JWT token** and returns it to the frontend.
5. The frontend stores the **JWT in a Flask session (or cookies)**.

---

### **2️⃣ User Navigates to Another Frontend (Same Browser)**
1. The second frontend (`localhost:3002` if logged in via `3001`, or vice versa) detects the **existing session**.
2. It retrieves the JWT from the session and sends a request to `localhost:5001/auth/profile`.
3. If the JWT is valid, the user is automatically authenticated without needing to log in again.

---

### **3️⃣ User Logs Out (From Any Frontend)**
1. The user clicks **Logout** on `localhost:3001` or `localhost:3002`.
2. The frontend **removes the session token (`session.pop('token', None)`)**.
3. Any new request to `localhost:5001/auth/profile` fails authentication.
4. The second frontend (`3002` or `3001`) detects the missing token and logs the user out.

---

## 🏗 **How SSO Works Across Frontends?**
✅ **Flask session** stores the JWT as a **browser cookie**.
✅ **Same browser session** shares cookies between `localhost:3001` & `localhost:3002`.
✅ **Authentication is checked via JWT token** stored in cookies/session.
✅ **Logout removes the session**, invalidating the JWT across all frontends.

---

## 🔍 **How to Verify This in Chrome?**
1. Open **Developer Tools (`F12`)** → **Application Tab**.
2. Expand **Storage** → **Cookies**.
3. Select `localhost:3001` or `localhost:3002` and check the `session` or `token`.
4. Logout from any frontend → The session cookie disappears.
5. Reload another frontend → It detects missing authentication and logs out.

---

## 🚀 **Future Enhancements**
- 🔹 **Use LocalStorage instead of cookies** for better token control.
- 🔹 **Enable Persistent Login** with refresh tokens.
- 🔹 **Implement Redis-based session storage** for distributed authentication.

This documentation provides a concise explanation of how **EduPrime SSO manages authentication across multiple frontend applications** using JWT and Flask sessions. 🎯

