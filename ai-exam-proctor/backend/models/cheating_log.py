from sqlalchemy import Column, Integer, String
from database import Base

class CheatingLog(Base):
    __tablename__ = "cheating_logs"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False)
    exam_id = Column(String, nullable=False)
    type = Column(String, nullable=False)
    image_path = Column(String, nullable=False)