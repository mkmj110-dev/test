from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Student
class StudentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: Optional[int] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    age: Optional[int] = None


class StudentOut(StudentBase):
    id: int

    class Config:
        from_attributes = True


# Course
class CourseBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    credits: int = Field(default=3, ge=0, le=30)


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    credits: Optional[int] = Field(None, ge=0, le=30)


class CourseOut(CourseBase):
    id: int

    class Config:
        from_attributes = True


# Enrollment
class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int
    grade: Optional[str] = Field(None, max_length=5)


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    grade: Optional[str] = Field(None, max_length=5)


class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    grade: Optional[str] = None

    class Config:
        from_attributes = True