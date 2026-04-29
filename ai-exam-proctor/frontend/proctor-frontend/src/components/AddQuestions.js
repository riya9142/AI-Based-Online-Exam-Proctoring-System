import React, { useState } from "react";
import axios from "axios";

const AddQuestions = () => {

  const examId = localStorage.getItem("examId");
  const totalQuestions = parseInt(localStorage.getItem("totalQuestions"));

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState({
    a: "", b: "", c: "", d: ""
  });
  const [answer, setAnswer] = useState("");

  const [questionsList, setQuestionsList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // ================= ADD / EDIT =================
  const addQuestion = () => {

    if (questionsList.length >= totalQuestions && editIndex === null) {
      alert("❌ All questions already added");
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

    // 🔥 EDIT MODE
    if (editIndex !== null) {
      const updated = [...questionsList];
      updated[editIndex] = newQ;

      setQuestionsList(updated);
      setEditIndex(null);
    } 
    // 🔥 ADD MODE
    else {
      setQuestionsList([...questionsList, newQ]);
    }

    // CLEAR FORM
    setQuestion("");
    setOptions({ a: "", b: "", c: "", d: "" });
    setAnswer("");
  };

  // ================= EDIT =================
  const editQuestion = (index) => {
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
  const deleteQuestion = (index) => {
    const updated = questionsList.filter((_, i) => i !== index);
    setQuestionsList(updated);
  };

  // ================= FINISH =================
  const finishExam = async () => {

    try {
      for (let q of questionsList) {
        await axios.post("http://127.0.0.1:8000/api/exams/add-question", {
          exam_id: examId,
          ...q
        });
      }

      await axios.post(`http://127.0.0.1:8000/api/exams/finish/${examId}`);

      alert("✅ Exam Created Successfully!");

      window.location.href = "/admin";

    } catch (err) {
      console.log(err);
      alert("❌ Error creating exam");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Add Questions</h2>

      <p>{questionsList.length} / {totalQuestions} Questions Added</p>

      {/* FORM */}
      <input value={question} placeholder="Question"
        onChange={(e) => setQuestion(e.target.value)} /><br />

      <input value={options.a} placeholder="Option A"
        onChange={(e) => setOptions({ ...options, a: e.target.value })} /><br />

      <input value={options.b} placeholder="Option B"
        onChange={(e) => setOptions({ ...options, b: e.target.value })} /><br />

      <input value={options.c} placeholder="Option C"
        onChange={(e) => setOptions({ ...options, c: e.target.value })} /><br />

      <input value={options.d} placeholder="Option D"
        onChange={(e) => setOptions({ ...options, d: e.target.value })} /><br />

      <input value={answer} placeholder="Correct Answer"
        onChange={(e) => setAnswer(e.target.value)} /><br /><br />

      <button onClick={addQuestion}>
        {editIndex !== null ? "Update Question" : "Add Question"}
      </button>

      <br /><br />

      {/* LIST */}
      <h3>Added Questions</h3>

      {questionsList.map((q, index) => (
        <div key={index} style={{
          border: "1px solid black",
          margin: "10px",
          padding: "10px"
        }}>
          <p><b>Q{index + 1}:</b> {q.question}</p>
          <p>A: {q.option_a}</p>
          <p>B: {q.option_b}</p>
          <p>C: {q.option_c}</p>
          <p>D: {q.option_d}</p>
          <p><b>Answer:</b> {q.correct_answer}</p>

          <button onClick={() => editQuestion(index)}>Edit</button>
          <button onClick={() => deleteQuestion(index)}>Delete</button>
        </div>
      ))}

      {/* FINISH */}
      {questionsList.length === totalQuestions && (
        <button onClick={finishExam}>
          ✅ Finish Exam
        </button>
      )}
    </div>
  );
};

export default AddQuestions;