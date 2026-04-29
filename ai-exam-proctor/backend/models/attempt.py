from sqlalchemy import Column, String, Integer
from database import Base
import uuid


def gen_uuid():
    return str(uuid.uuid4())

class Attempt(Base):
    __tablename__ = "attempts"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    user_email = Column(String)
    exam_id = Column(String)
    score = Column(Integer, default=0)   
   