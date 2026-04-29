import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    console.log("🔥 Login button clicked");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/users/login",
        form
      );

      console.log("✅ RESPONSE:", res.data);

      // ✅ STORE DATA
      localStorage.setItem("email", res.data.email || form.email);
      localStorage.setItem("role", res.data.role);

      if (res.data.face_data) {
        localStorage.setItem("faceDataFromDB", res.data.face_data);
      }

      alert("✅ Login Success");

      // ✅ REDIRECT FIX (IMPORTANT)
      if (res.data.role === "admin") {
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = "/student";
      }

    } catch (err) {
      console.log("❌ LOGIN ERROR:", err.response?.data);
      alert("❌ Invalid credentials");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f5f5f5"
    }}>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        textAlign: "center",
        width: "300px"
      }}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          style={{ width: "100%", padding: "8px" }}
        /><br /><br />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          style={{ width: "100%", padding: "8px" }}
        /><br /><br />

        <button
          onClick={handleLogin}
          style={{
            padding: "10px 20px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
            width: "100%",
            cursor: "pointer"
          }}
        >
          Login
        </button>

        {/* 🔥 REGISTER LINK */}
        <p style={{ marginTop: "15px" }}>
          New user?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => window.location.href = "/register"}
          >
            Register here
          </span>
        </p>

      </div>
    </div>
  );
};

export default Login;