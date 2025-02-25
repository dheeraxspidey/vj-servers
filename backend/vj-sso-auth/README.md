# SSO Authentication Service

This project is a **Single Sign-On (SSO) Authentication Service** built using **Flask and React**. It provides a centralized authentication system that multiple frontend applications can use for user login and session management.

---

## 📌 Features
- 🔐 **Centralized Authentication**: One login system for multiple frontend applications.
- ✅ **Session Management**: Uses Flask-Login and cookies for authentication.
- 🔄 **JWT or Cookie-Based Authentication**: Securely manages user sessions.
- 📡 **Cross-Origin Support**: CORS-enabled to allow access from different frontends.
- 🚀 **Production Ready**: Can be deployed with Gunicorn.

---

## 🛠️ Installation & Setup

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/head-iie/vj-servers.git
cd vj-servers/backend
cd vj-sso-auth
```

### **2️⃣ Create a Virtual Environment**
```sh
python3 -m venv vj_sso
source ~/vj_sso/bin/activate  # On Windows: vj_sso\Scripts\activate
```

### **3️⃣ Install Dependencies**
```sh
pip install -r requirements.txt
```

### **4️⃣ Set Environment Variables**
Create a `.env` file in the root directory:
```sh
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///users.db
DEBUG=True
```

### **5️⃣ Initialize the Database**
```sh
python3 -c 'from database import db, init_db; from app import app; init_db(app)'
```

### **6️⃣ Run the Application (Development Mode)**
```sh
source ~/vj_sso/bin/activate
cd ~/vj-servers/backend/vj-sso-auth
python app.py
```
Access the service at: **`http://127.0.0.1:5000/`**

---

## 🚀 Deployment (Production Mode)

### **Using Gunicorn**
```sh
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
```

### **Using Docker (Optional)**
```sh
docker build -t sso-auth-service .
docker run -p 5000:5000 sso-auth-service
```

---

## 📡 API Endpoints

| Method | Endpoint            | Description                      |
|--------|--------------------|----------------------------------|
| `GET`  | `/api/check-login`  | Check if user is logged in      |
| `POST` | `/api/login`        | Log in a user                   |
| `POST` | `/api/logout`       | Log out a user                  |

---

## 📂 Folder Structure
```
sso-auth-service/
│── backend/                         # Flask Backend (Authentication API)
│   │── app.py                        # Main Flask Application
│   │── auth_routes.py                 # Handles login, logout, session management
│   │── config.py                       # Configuration settings
│   │── database.py                     # User database setup
│   │── requirements.txt                 # Dependencies for Flask
│   └── wsgi.py                         # Production entry point (Gunicorn, etc.)
│
│── frontend/                         # React SSO Login App
│   │── src/
│   │   │── components/
│   │   │── context/
│   │   │── pages/
│   │   │── App.jsx                     # Main Router Setup
│   │   │── main.jsx                     # Entry point (Vite)
│   │── public/
│   │── package.json
│   └── vite.config.js
│
│── .env                                # Environment variables
│── README.md                           # Documentation
```

---

## 👨‍💻 Contributing
Feel free to contribute by submitting issues or pull requests.

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 📞 Contact
For support, contact **your-email@example.com**.

Happy Coding! 🚀

