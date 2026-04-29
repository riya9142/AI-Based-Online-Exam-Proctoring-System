from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.logs import router as logs_router
from database import Base, engine
from routes import users, exam


# ✅ IMPORTANT: import model so table is created
from models.user import User  
from models.exam import Exam
from models.attempt import Attempt

import os
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("logs", exist_ok=True)

from fastapi.staticfiles import StaticFiles
app.mount("/logs", StaticFiles(directory="logs"), name="logs")
os.makedirs("logs", exist_ok=True)

# ✅ Create DB tables (on startup)
@app.on_event("startup")
def startup():
    print("🚀 Starting backend...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database connected & tables created")

# ✅ CORS (frontend connection)


# ✅ Routes
app.include_router(users.router, prefix="/api/users")
app.include_router(exam.router, prefix="/api/exams")
app.include_router(logs_router)



# ✅ Test API
@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}