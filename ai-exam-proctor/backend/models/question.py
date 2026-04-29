from sqlalchemy import Column, String, ForeignKey
from database import Base
import uuid

def gen_uuid():
    return str(uuid.uuid4())

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=gen_uuid)
    exam_id = Column(String, ForeignKey("exams.id"))

    question = Column(String)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    correct_answer = Column(String)