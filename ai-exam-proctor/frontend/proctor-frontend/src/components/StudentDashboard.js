import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentDashboard = () => {

  const [exams, setExams] = useState([]);
  const [attended, setAttended] = useState([]);
 

  const email = localStorage.getItem("email");
  
  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res1 = await axios.get("http://127.0.0.1:8000/api/exams/");
      const res2 = await axios.get(`http://127.0.0.1:8000/api/exams/attended/${email}`);

      setExams(res1.data);
      setAttended(res2.data);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  // ================= AUTO LOAD + REFRESH =================
  useEffect(() => {

    fetchData();

    // 🔥 FIX: refresh after terminate
    const refresh = localStorage.getItem("refreshDashboard");
    if (refresh === "true") {
      fetchData();
      localStorage.removeItem("refreshDashboard");
    }
    
       // 🔥 auto sync
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
    
   
  }, []);

  // ================= START EXAM =================
  const startExam = (exam) => {

    const elem = document.documentElement;

    // 🔥 RESET terminate flag (IMPORTANT)
    localStorage.removeItem("terminated");

    if (elem.requestFullscreen) {
      elem.requestFullscreen()
        .then(() => {

          // 🔥 AFTER FULLSCREEN → NAVIGATE
          setTimeout(() => {
            localStorage.setItem("examId", exam.id);
            localStorage.setItem("duration", exam.duration);

            window.location.href = "/exam";
          }, 500);

        })
        .catch(() => {
          // fallback
          localStorage.setItem("examId", exam.id);
          localStorage.setItem("duration", exam.duration);
          window.location.href = "/exam";
        });

    } else {
      // fallback
      localStorage.setItem("examId", exam.id);
      localStorage.setItem("duration", exam.duration);
      window.location.href = "/exam";
    }
  };


 

  // ================= CHECK ATTEMPT =================
  const isAttempted = (examId) => {
    return attended.some(e => e.exam_id === examId);
  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>Student Dashboard</h2>

      {/* ================= AVAILABLE ================= */}
      <div style={{ border: "2px solid blue", padding: "20px" }}>
        <h3>📝 Available Exams</h3>

        {exams.map((exam) => (
          !isAttempted(exam.id) && (
            <div key={exam.id} style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px"
            }}>
              <p><b>{exam.subject}</b></p>
              <p>Duration: {exam.duration} min</p>
              <p>Marks: {exam.total_marks}</p>

              <button onClick={() => startExam(exam)}>
                Start Exam
              </button>
            </div>
          )
        ))}
      </div>

      {/* ================= ATTENDED ================= */}
      <div style={{
        border: "2px solid green",
        padding: "20px",
        marginTop: "20px"
      }}>
        <h3>✅ Attended Exams</h3>

        {attended.map((e, index) => (
          <div key={index} style={{
            border: "1px solid gray",
            margin: "10px",
            padding: "10px"
          }}>
            <p>Exam ID: {e.exam_id}</p>
          </div>
        ))}
      </div>



    </div>
  );
};

export default StudentDashboard;