import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {

  // ================= STATES =================
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [marks, setMarks] = useState("");

  const [examId, setExamId] = useState("");

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState({
    a: "", b: "", c: "", d: ""
  });
  const [answer, setAnswer] = useState("");

  const [exams, setExams] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState("");
  const [addedCount, setAddedCount] = useState(0);
  const [questionsList, setQuestionsList] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState([]);

  // ================= FETCH =================
  const fetchExams = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/exams/");
    setExams(res.data);
  };


const fetchResults = async () => {
  try {
    const email = localStorage.getItem("email");

    const res = await axios.get(
      `http://127.0.0.1:8000/api/exams/admin/results/${email}`
    );

    setResults(res.data);

  } catch (err) {
    console.log("Error fetching results", err);
  }
};


  useEffect(() => {
    fetchExams();
    fetchResults();
      fetch("http://localhost:8000/api/logs")
    .then(res => res.json())
    .then(data => {
      console.log("Logs:", data);
      setLogs(data);
    });
  }, []);

  // ================= CREATE =================
  const createExam = async () => {
    try {
      const email = localStorage.getItem("email");

      if (
        subject.trim() === "" ||
        duration.trim() === "" ||
        totalQuestions.trim() === "" ||
        marks.trim() === "" ||
        !email
      ) {
        alert("❌ Fill all fields properly");
        return;
      }

      const res = await axios.post(
        "http://127.0.0.1:8000/api/exams/create",
        {
          subject,
          duration: Number(duration),
          total_questions: Number(totalQuestions),
          total_marks: Number(marks),
          email
        }
      );

      setExamId(res.data.id);
      setAddedCount(0);
      setIsCreating(true);

      alert("Exam Created! Now add questions");

    } catch (err) {
      console.log("ERROR:", err.response?.data);
      alert("Error creating exam");
    }
  };

  // ================= ADD / EDIT QUESTION =================
  const addQuestion = () => {

    if (addedCount >= totalQuestions && editIndex === null) {
      alert("❌ All questions added");
      return;
    }

    const newQ = {
      question,
      option_a: options.a,
      option_b: options.b,
      option_c: options.c,
      option_d: options.d,
      correct_answer: answer
    };

    if (editIndex !== null) {
      const updated = [...questionsList];
      updated[editIndex] = newQ;
      setQuestionsList(updated);
      setEditIndex(null);
    } else {
      setQuestionsList([...questionsList, newQ]);
      setAddedCount(addedCount + 1);
    }

    setQuestion("");
    setOptions({ a: "", b: "", c: "", d: "" });
    setAnswer("");
  };

  // ================= FINISH =================
  const finishExam = async () => {

    for (let q of questionsList) {
      await axios.post("http://127.0.0.1:8000/api/exams/add-question", {
        exam_id: examId,
        ...q
      });
    }

    await axios.post(`http://127.0.0.1:8000/api/exams/finish/${examId}`);

    alert("✅ Exam Created Successfully!");

    setQuestionsList([]);
    setIsCreating(false);
    setAddedCount(0);
    setExamId("");

    fetchExams();
  };

  // ================= EDIT =================
  const handleEdit = (index) => {
    const q = questionsList[index];

    setQuestion(q.question);
    setOptions({
      a: q.option_a,
      b: q.option_b,
      c: q.option_c,
      d: q.option_d
    });
    setAnswer(q.correct_answer);

    setEditIndex(index);
  };

  // ================= DELETE =================
  const handleDelete = (index) => {
    const updated = questionsList.filter((_, i) => i !== index);
    setQuestionsList(updated);
    setAddedCount(updated.length);
  };

  // ================= DELETE EXAM =================
  const deleteExam = async (id) => {
    await axios.delete(`http://127.0.0.1:8000/api/exams/delete/${id}`);
    fetchExams();
  };

  const deleteLog = async (id) => {
     console.log("🗑 Delete clicked:", id); 
  try {
    await fetch(`http://127.0.0.1:8000/api/logs/${id}`, {
      method: "DELETE"
    });

    // ✅ UI update after delete
    setLogs(logs.filter(log => log.id !== id));

  } catch (err) {
    console.log("Error deleting log", err);
  }
};

  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{ textAlign: "center" }}>Admin Dashboard</h2>

      {/* ================= SECTION 1 ================= */}
      <div style={{ border: "2px solid green", padding: "20px", marginBottom: "30px" }}>
        <h3>📚 Scheduled Exams</h3>

        {exams.map((exam) => (
          <div key={exam.id} style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px"
          }}>
            <h4>{exam.subject}</h4>
            <p>Duration: {exam.duration}</p>
            <p>Marks: {exam.total_marks}</p>

            <button onClick={() => deleteExam(exam.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* ================= SECTION 2 ================= */}
      <div style={{ border: "2px solid blue", padding: "20px" }}>

        {!isCreating && (
          <>
            <h3>➕ Create Exam</h3>

            <input value={subject} placeholder="Subject" onChange={(e) => setSubject(e.target.value)} /><br />
            <input value={duration} placeholder="Duration" onChange={(e) => setDuration(e.target.value)} /><br />
            <input value={marks} placeholder="Marks" onChange={(e) => setMarks(e.target.value)} /><br />
            <input value={totalQuestions} placeholder="Number of Questions" onChange={(e) => setTotalQuestions(e.target.value)} /><br /><br />

            <button onClick={createExam}>Create Exam</button>
          </>
        )}

        {isCreating && (
          <>
            <hr />
            <h3>Add Questions</h3>

            <p>Questions Added: {addedCount} / {totalQuestions}</p>

            <input value={question} placeholder="Question" onChange={(e) => setQuestion(e.target.value)} /><br />
            <input value={options.a} placeholder="Option A" onChange={(e) => setOptions({ ...options, a: e.target.value })} /><br />
            <input value={options.b} placeholder="Option B" onChange={(e) => setOptions({ ...options, b: e.target.value })} /><br />
            <input value={options.c} placeholder="Option C" onChange={(e) => setOptions({ ...options, c: e.target.value })} /><br />
            <input value={options.d} placeholder="Option D" onChange={(e) => setOptions({ ...options, d: e.target.value })} /><br />
            <input value={answer} placeholder="Correct Answer" onChange={(e) => setAnswer(e.target.value)} /><br /><br />

            <button onClick={addQuestion}>
              {editIndex !== null ? "Update Question" : "Add Question"}
            </button>

            <h3>📋 Added Questions</h3>

            {questionsList.map((q, index) => (
              <div key={index} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
                <p><b>Q{index + 1}:</b> {q.question}</p>

                <button onClick={() => handleEdit(index)}>Edit</button>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </div>
            ))}

            <br />

            <button
              onClick={finishExam}
              disabled={addedCount !== parseInt(totalQuestions)}
            >
              ✅ Finish Exam
            </button>
          </>
        )}

      </div>

     {/* ================= CHEATING LOGS ================= */}
<div style={{ border: "2px solid red", padding: "20px", marginTop: "30px" }}>
  <h3>📸 Cheating Logs</h3>

  {logs.length === 0 ? (
    <p>No logs found</p>
  ) : (
    logs.map((log) => (
<div key={log.id} style={{
  border: "1px solid #ccc",
  margin: "10px",
  padding: "10px",
  borderRadius: "10px"
}}>
  <p><b>Email:</b> {log.email}</p>
  <p><b>Type:</b> {log.type}</p>

  <img
    src={`http://localhost:8000/${log.image_path}`}
    alt="log"
    width="200"
    style={{ borderRadius: "8px" }}
  />

  <br /><br />

  {/* ✅ DELETE BUTTON */}
  <button
    onClick={() => deleteLog(log.id)}
    style={{
      backgroundColor: "red",
      color: "white",
      border: "none",
      padding: "5px 10px",
      borderRadius: "5px",
      cursor: "pointer"
    }}
  >
    🗑 Delete
  </button>
</div>
    ))
  )}
</div> 

<div style={{ border: "2px solid purple", padding: "20px", marginTop: "30px" }}>
  <h3>📊 Exam Results</h3>

  {results.length === 0 ? (
    <p>No results yet</p>
  ) : (
    results.map((r) => (
      <div key={r.id} style={{
        border: "1px solid gray",
        margin: "10px",
        padding: "10px"
      }}>
        <p><b>Student:</b> {r.student_email}</p>
        <p><b>Exam ID:</b> {r.exam_id}</p>
        <p><b>Score:</b> {r.score}</p>
      </div>
    ))
  )}
</div>

    </div>
  );
};

export default AdminDashboard;