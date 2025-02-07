from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from flask_cors import CORS

app = FastAPI()


# ✅ Correct CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to your frontend URL for better security
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods: GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Allow client to access custom headers
)

# Define the request model for user registration
class UserRegister(BaseModel):
    username: str
    password: str

# In-memory storage (for demo purposes)
users_db = {}

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/user/reg")
def register_user(user: UserRegister):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Store user (Note: Passwords should be hashed in real-world applications)
    users_db[user.username] = user.password
    return {"message": "User registered successfully", "username": user.username,"success":True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
    CORS(app)
