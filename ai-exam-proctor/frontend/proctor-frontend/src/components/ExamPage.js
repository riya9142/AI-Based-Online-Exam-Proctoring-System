import React, { useEffect, useState } from "react";
import axios from "axios";
import Proctoring from "./Proctoring";

const ExamPage = () => {

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [fullscreenStarted, setFullscreenStarted] = useState(false);

  const examId = localStorage.getItem("examId");
  const email = localStorage.getItem("email");

  const [submitted, setSubmitted] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/exams/${examId}`
      );

      setQuestions(res.data);

      const duration = parseInt(localStorage.getItem("duration"));
      if (duration) setTimeLeft(duration * 60);
    };

    fetchQuestions();
  }, []);

  // ================= TIMER =================
  useEffect(() => {

    if (timeLeft === null || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);

  }, [timeLeft, submitted]);

  // ================= TAB SWITCH =================
  useEffect(() => {

    const handleVisibilityChange = () => {
      if (document.hidden) {
        terminateExam();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };

  }, []);

  // ================= FULLSCREEN EXIT =================
 useEffect(() => {
  const elem = document.documentElement;

  if (!document.fullscreenElement) {
    elem.requestFullscreen()
      .then(() => {
        setFullscreenStarted(true); // ✅ mark started
      })
      .catch(() => {});
  }
}, []);

  // ================= TERMINATE =================
 const terminateExam = async () => {

  // 🔥 prevent multiple calls
  if (localStorage.getItem("terminated") === "true") return;
  localStorage.setItem("terminated", "true");

 const terminateExam = async () => {

  if (localStorage.getItem("terminated") === "true") return;
  localStorage.setItem("terminated", "true");

  const email = localStorage.getItem("email");
  const examId = localStorage.getItem("examId");

  try {
    await axios.post("http://127.0.0.1:8000/api/exams/submit", {
      user_email: email,
      exam_id: examId
    });
    console.log("✅ Result saved (terminate)");
  } catch (err) {
    console.log("❌ Terminate submit error:", err);
  }

  localStorage.setItem("refreshDashboard", "true");

  localStorage.removeItem("examId");
  localStorage.removeItem("duration");

  window.location.href = "/student";
};

  // 🔥 EXIT FULLSCREEN SAFELY
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch (e) {}

  // 🔥 trigger dashboard refresh
  localStorage.setItem("refreshDashboard", "true");

  // 🔥 clean only exam-related data (NOT full clear)
  localStorage.removeItem("examId");
  localStorage.removeItem("duration");

  // 🔁 redirect
  window.location.href = "/student";
};
  // ================= SUBMIT =================
  const handleSubmit = async () => {

    if (submitted) return;
    setSubmitted(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/exams/submit",
        {
          user_email: email,
          exam_id: examId
        }
      );

      // 🔥 EXIT FULLSCREEN AFTER SUBMIT
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }

      window.location.href = "/student";

    } catch (err) {
      console.log(err);
    }
  };


  useEffect(() => {

  const forceFullscreen = () => {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {});
    }
  };

  // 🔥 run every second
  const interval = setInterval(forceFullscreen, 1000);

  return () => clearInterval(interval);

}, []);

  useEffect(() => {
  const handleBlur = () => {
    terminateExam(); // 🔥 instant terminate
  };

  window.addEventListener("blur", handleBlur);

  return () => {
    window.removeEventListener("blur", handleBlur);
  };
}, []);

  // ================= ANSWER =================
  const handleAnswer = (qId, value) => {
    setAnswers({
      ...answers,
      [qId]: value
    });
  };

  // ================= FORMAT TIME =================
  const formatTime = () => {
    if (timeLeft === null) return "Loading...";

    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;

    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // ================= UI =================
  return (
    <div style={{ padding: "20px" }}>

      <h2>Exam</h2>

      {/* 🔥 PROCTORING STICKY */}
      <div style={{
        position: "sticky",
        top: 0,
        background: "white",
        zIndex: 1000,
        padding: "10px",
        borderBottom: "2px solid black"
      }}>
        <Proctoring startAudio={true} />
      </div>

      <h3>⏰ Time Left: {formatTime()}</h3>

      {questions.map((q, index) => (
        <div key={q.id} style={{
          border: "1px solid black",
          margin: "10px",
          padding: "10px"
        }}>
          <p><b>Q{index + 1}:</b> {q.question}</p>

          <input type="radio" name={q.id} onChange={() => handleAnswer(q.id, "A")} /> {q.option_a} <br />
          <input type="radio" name={q.id} onChange={() => handleAnswer(q.id, "B")} /> {q.option_b} <br />
          <input type="radio" name={q.id} onChange={() => handleAnswer(q.id, "C")} /> {q.option_c} <br />
          <input type="radio" name={q.id} onChange={() => handleAnswer(q.id, "D")} /> {q.option_d} <br />
        </div>
      ))}

      <button onClick={handleSubmit}>
        ✅ Finish Exam
      </button>

    </div>
  );
};

export default ExamPage;