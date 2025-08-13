from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("", response_model=list[schemas.CourseOut])
def list_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).order_by(models.Course.id).all()


@router.post("", response_model=schemas.CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    obj = models.Course(**course.model_dump())
    db.add(obj)
    try:
        db.commit()
        db.refresh(obj)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Course code already exists")
    return obj


@router.get("/{course_id}", response_model=schemas.CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Course, course_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Course not found")
    return obj


@router.put("/{course_id}", response_model=schemas.CourseOut)
def update_course(course_id: int, course: schemas.CourseUpdate, db: Session = Depends(get_db)):
    obj = db.get(models.Course, course_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Course not found")

    for key, value in course.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)

    try:
        db.commit()
        db.refresh(obj)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Course code already exists")

    return obj


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Course, course_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(obj)
    db.commit()
    return None