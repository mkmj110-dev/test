from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/enrollments", tags=["enrollments"])


@router.get("", response_model=list[schemas.EnrollmentOut])
def list_enrollments(db: Session = Depends(get_db)):
    return db.query(models.Enrollment).order_by(models.Enrollment.id).all()


@router.post("", response_model=schemas.EnrollmentOut, status_code=status.HTTP_201_CREATED)
def create_enrollment(enrollment: schemas.EnrollmentCreate, db: Session = Depends(get_db)):
    # Check student and course exist for clearer error messages
    student = db.get(models.Student, enrollment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    course = db.get(models.Course, enrollment.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    obj = models.Enrollment(**enrollment.model_dump())
    db.add(obj)
    try:
        db.commit()
        db.refresh(obj)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Enrollment already exists")
    return obj


@router.get("/{enrollment_id}", response_model=schemas.EnrollmentOut)
def get_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Enrollment, enrollment_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return obj


@router.put("/{enrollment_id}", response_model=schemas.EnrollmentOut)
def update_enrollment(enrollment_id: int, enrollment: schemas.EnrollmentUpdate, db: Session = Depends(get_db)):
    obj = db.get(models.Enrollment, enrollment_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    for key, value in enrollment.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Enrollment, enrollment_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    db.delete(obj)
    db.commit()
    return None