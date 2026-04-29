from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import base64, os
from datetime import datetime
from models.cheating_log import CheatingLog

router = APIRouter()


# ✅ DELETE API
@router.delete("/api/logs/{log_id}")
def delete_log(log_id: int):
    from database import SessionLocal
    from models.cheating_log import CheatingLog
    import os

    db = SessionLocal()

    log = db.query(CheatingLog).filter(CheatingLog.id == log_id).first()

    if not log:
        return {"error": "Log not found"}

    try:
        file_path = os.path.join(os.getcwd(), log.image_path)

        print("Deleting:", file_path)

        if os.path.exists(file_path):
            os.remove(file_path)

    except Exception as e:
        print("Delete error:", e)

    db.delete(log)
    db.commit()

    return {"msg": "deleted"}
# ================= DB SESSION =================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= CREATE LOG =================
@router.post("/api/logs")
async def create_log(data: dict, db: Session = Depends(get_db)):
    
    print("📥 Incoming data:", data, flush=True)
    os.makedirs("logs", exist_ok=True)

    filepath = "logs/default.jpg"  # fallback default

    try:
        # 📸 extract base64 image
        image_data = data["image"].split(",")[1]

        filename = f"log_{datetime.now().timestamp()}.jpg"
        filepath = f"logs/{filename}"

        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_data))

        print("✅ Image saved:", filepath, flush=True)

    except Exception as e:
        print("❌ Image decode error:", e)

    try:
        # 🧾 save to DB
        log = CheatingLog(
            email=data.get("email"),
            exam_id=data.get("exam_id"),
            type=data.get("type"),
            image_path=filepath
        )

        db.add(log)
        db.commit()

        print("✅ Log saved in DB", flush=True)

    except Exception as e:
        print("❌ DB error:", e, flush=True)
        return {"error": "DB save failed"}

    return {"msg": "log saved successfully"}


# ================= GET LOGS =================
@router.get("/api/logs")
def get_logs(db: Session = Depends(get_db)):
    return db.query(CheatingLog).all()