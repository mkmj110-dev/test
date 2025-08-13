from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import students, courses, enrollments

app = FastAPI(title="Student Management System")

# CORS (allow all for simplicity in this demo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(students.router)
app.include_router(courses.router)
app.include_router(enrollments.router)

# Static files (frontend)
app.mount("/", StaticFiles(directory="/workspace/student_mgmt/app/static", html=True), name="static")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)