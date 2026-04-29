import React, { useState } from "react";
import axios from "axios";

const CreateExam = () => {
  const [form, setForm] = useState({
    subject: "",
    duration: "",
    total_marks: "",
    total_questions: ""
  });

  const handleCreate = async () => {
    // ✅ Validation (VERY IMPORTANT)
    if (
      !form.subject ||
      !form.duration ||
      !form.total_marks ||
      !form.total_questions
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/exams/create",
        {
          subject: form.subject,
          duration: Number(form.duration),          // ✅ safer than parseInt
          total_marks: Number(form.total_marks),
          total_questions: Number(form.total_questions)
        }
      );

      // ✅ Save in localStorage
      localStorage.setItem("examId", res.data.id);
      localStorage.setItem("totalQuestions", form.total_questions);

      alert("Exam Created!");
      window.location.href = "/add-questions";

    } catch (err) {
      console.log("ERROR:", err.response?.data);
      alert("Error creating exam");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Create Exam</h2>

      {/* Subject */}
      <input
        placeholder="Subject"
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
      /><br /><br />

      {/* Duration (FIX ADDED) */}
      <input
        type="number"
        placeholder="Duration (minutes)"
        onChange={(e) => setForm({ ...form, duration: e.target.value })}
      /><br /><br />

      {/* Total Questions */}
      <input
        type="number"
        placeholder="Number of Questions"
        onChange={(e) =>
          setForm({ ...form, total_questions: e.target.value })
        }
      /><br /><br />

      {/* Total Marks */}
      <input
        type="number"
        placeholder="Total Marks"
        onChange={(e) =>
          setForm({ ...form, total_marks: e.target.value })
        }
      /><br /><br />

      <button onClick={handleCreate}>Create Exam</button>
    </div>
  );
};

export default CreateExam;