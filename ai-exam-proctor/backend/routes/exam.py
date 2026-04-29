from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models.exam import Exam
from models.question import Question
from models.attempt import Attempt   # 🔥 for submissions

router = APIRouter()

# ================= DB =================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================= MODELS =================
class ExamCreate(BaseModel):
    subject: str
    duration: int
    total_questions: int
    total_marks: int
    email: str   # 🔥 admin email

class QuestionCreate(BaseModel):
    exam_id: str
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str


# ================= CREATE EXAM =================
@router.post("/create")
def create_exam(data: ExamCreate, db: Session = Depends(get_db)):

    new_exam = Exam(
        subject=data.subject,
        duration=data.duration,
        total_marks=data.total_marks,
        total_questions=data.total_questions,
        created_by=data.email
    )

    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)

    return new_exam


# ================= ADD QUESTION =================
@router.post("/add-question")
def add_question(q: QuestionCreate, db: Session = Depends(get_db)):

    new_q = Question(
        exam_id=q.exam_id,
        question=q.question,
        option_a=q.option_a,
        option_b=q.option_b,
        option_c=q.option_c,
        option_d=q.option_d,
        correct_answer=q.correct_answer
    )

    db.add(new_q)
    db.commit()

    return {"message": "Question added"}


# ================= FINISH EXAM =================
@router.post("/finish/{exam_id}")
def finish_exam(exam_id: str, db: Session = Depends(get_db)):

    exam = db.query(Exam).filter(Exam.id == exam_id).first()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # 🔥 add flag dynamically (if not in model, ignore safely)
    setattr(exam, "is_created", True)

    db.commit()

    return {"message": "Exam finalized"}


# ================= GET ALL CREATED EXAMS =================
@router.get("/")
def get_exams(db: Session = Depends(get_db)):

    exams = db.query(Exam).all()

    # agar is_created field nahi hai to bhi safe return
    return exams


# ================= GET ADMIN EXAMS =================
@router.get("/admin/{email}")
def get_admin_exams(email: str, db: Session = Depends(get_db)):
    return db.query(Exam).filter(Exam.created_by == email).all()


# ================= DELETE =================
@router.delete("/delete/{exam_id}")
def delete_exam(exam_id: str, db: Session = Depends(get_db)):

    exam = db.query(Exam).filter(Exam.id == exam_id).first()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # 🔥 DELETE QUESTIONS
    db.query(Question).filter(Question.exam_id == exam_id).delete()

    # 🔥 DELETE ATTEMPTS (VERY IMPORTANT)
    db.query(Attempt).filter(Attempt.exam_id == exam_id).delete()

    # 🔥 DELETE EXAM
    db.delete(exam)

    db.commit()

    return {"message": "Exam deleted completely"}


# ================= GET QUESTIONS =================
@router.get("/{exam_id}")
def get_questions(exam_id: str, db: Session = Depends(get_db)):
    return db.query(Question).filter(Question.exam_id == exam_id).all()


# ================= SUBMIT EXAM =================
# ================= SUBMIT EXAM =================

@router.post("/submit")
def submit_exam(data: dict, db: Session = Depends(get_db)):
    print("🔥 SUBMIT API CALLED")
    print("DATA RECEIVED:", data)

    user_email = data.get("user_email")
    exam_id = data.get("exam_id")

    if not user_email or not exam_id:
        raise HTTPException(status_code=400, detail="Missing email or exam_id")

    try:
        existing = db.query(Attempt).filter(
            Attempt.user_email == user_email,
            Attempt.exam_id == exam_id
        ).first()

        if existing:
            return {"msg": "Already submitted"}

        # 🔥 dummy score (works for now)
        score = 10

        new_attempt = Attempt(
            user_email=user_email,
            exam_id=exam_id,
            score=score
        )

        db.add(new_attempt)
        db.commit()
        db.refresh(new_attempt)

        return {
            "msg": "Exam submitted",
            "score": score
        }

    except Exception as e:
        print("❌ ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
# ================= GET ATTENDED =================
@router.get("/attended/{email}")
def get_attended(email: str, db: Session = Depends(get_db)):
    return db.query(Attempt).filter(Attempt.user_email == email).all()

# ================= ADMIN RESULTS =================
@router.get("/admin/results/{email}")
def get_admin_results(email: str, db: Session = Depends(get_db)):

    # 🔍 get exams created by this admin
    exams = db.query(Exam).filter(Exam.created_by == email).all()

    exam_ids = [e.id for e in exams]

    # 🔍 get attempts for those exams
    attempts = db.query(Attempt).filter(
        Attempt.exam_id.in_(exam_ids)
    ).all()

    return [
        {
            "student_email": a.user_email,
            "exam_id": a.exam_id,
            "score": a.score
        }
        for a in attempts
    ]