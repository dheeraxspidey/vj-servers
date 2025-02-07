from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base

# Initialize FastAPI app
app = FastAPI()

# ✅ Proper CORS setup for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (Change to frontend URL in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Database Configuration
DATABASE_URL = "sqlite:///./users.db"  # SQLite Database file
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ✅ User Model for Database
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # Store hashed passwords in real applications

# ✅ Create the database tables
Base.metadata.create_all(bind=engine)

# ✅ Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Request Model for User Registration
class UserRegister(BaseModel):
    username: str
    password: str

@app.get("/")
def read_root(db: Session = Depends(get_db)):
    # ✅ Count total users
    total_users = db.query(User).count()

    # ✅ Get latest 5 registered users (ordered by ID in descending order)
    latest_users = db.query(User).order_by(desc(User.id)).limit(5).all()

    # ✅ Convert to JSON response
    latest_users_list = [{"id": user.id, "username": user.username} for user in latest_users]

    return {
        "total_registered_users": total_users,
        "latest_users": latest_users_list
}

@app.post("/user/reg")
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    # ✅ Check if username already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    # ✅ Create new user (store hashed password in real-world apps)
    new_user = User(username=user.username, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # ✅ Get total number of registered users
    total_users = db.query(User).count()

    # ✅ Get latest 5 registered users
    latest_users = db.query(User).order_by(desc(User.id)).limit(5).all()

    # ✅ Prepare latest users for response
    latest_users_list = [{"id": user.id, "username": user.username} for user in latest_users]

    # ✅ Return response
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
