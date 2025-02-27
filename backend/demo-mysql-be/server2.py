from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from mysql_db import get_db, Base, engine  # Import MySQL connection

# ✅ Initialize FastAPI app
app = FastAPI()

# ✅ CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Create tables in MySQL if they don't exist
Base.metadata.create_all(bind=engine)

# ✅ User model (Ensure this is the same in database.py)
from sqlalchemy import Column, Integer, String

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # Use hashed passwords in production

# ✅ User Registration Request Model
from pydantic import BaseModel

class UserRegister(BaseModel):
    username: str
    password: str

@app.get("/")
def read_root(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    latest_users = db.query(User).order_by(desc(User.id)).limit(5).all()
    latest_users_list = [{"id": user.id, "username": user.username} for user in latest_users]

    return {
        "total_registered_users": total_users,
        "latest_users": latest_users_list
    }

@app.post("/user/reg")
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(username=user.username, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    total_users = db.query(User).count()
    latest_users = db.query(User).order_by(desc(User.id)).limit(5).all()
    latest_users_list = [{"id": user.id, "username": user.username} for user in latest_users]

    return {
        "message": "User registered successfully",
        "username": user.username,
        "success": True,
        "total_registered_users": total_users,
        "latest_users": latest_users_list
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
