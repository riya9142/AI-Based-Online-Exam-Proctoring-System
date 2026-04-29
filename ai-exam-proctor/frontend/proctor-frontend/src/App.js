import React from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import AddQuestions from "./components/AddQuestions";
import StudentDashboard from "./components/StudentDashboard";
import ExamPage from "./components/ExamPage";
import FaceEnroll from "./components/FaceEnroll";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogs from "./components/AdminLogs";

function App() {
  const path = window.location.pathname;

  // ✅ ADD THESE TWO (VERY IMPORTANT)
  if (path === "/login") return <Login />;
  if (path === "/register") return <Register />;

  if (path === "/admin-dashboard") return <AdminDashboard />;
  if (path === "/add-questions") return <AddQuestions />;
  if (path === "/student") return <StudentDashboard />;
  if (path === "/exam") return <ExamPage />;
  if (path === "/face-enroll") return <FaceEnroll />;
  if (path === "/admin/logs") return <AdminLogs />;

  // ✅ DEFAULT PAGE
  return <Register />;
}

export default App;