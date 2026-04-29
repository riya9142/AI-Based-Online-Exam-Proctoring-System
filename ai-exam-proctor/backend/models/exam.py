from sqlalchemy import Column, String, Integer, ForeignKey
from database import Base
import uuid

def gen_uuid():
    return str(uuid.uuid4())

class Exam(Base):
    __tablename__ = "exams"

    id = Column(String, primary_key=True, default=gen_uuid)
    subject = Column(String)
    duration = Column(Integer)
    total_marks = Column(Integer)
    total_questions = Column(Integer)

    # 🔥 IMPORTANT → admin link
    created_by = Column(String, ForeignKey("users.email"))