import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";


const Register = () => {

  const videoRef = useRef();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const [modelsLoaded, setModelsLoaded] = useState(false);

  // 📦 Load Models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      setModelsLoaded(true);
      startVideo();
    };

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.log("Camera error:", err);
        });
    };

    loadModels();
  }, []);

  // 🎯 REGISTER
  const handleRegister = async () => {

    if (!form.name || !form.email || !form.password) {
      alert("❌ Please fill all fields");
      return;
    }

    if (!modelsLoaded) {
      alert("Models not loaded!");
      return;
    }

    if (!videoRef.current || videoRef.current.readyState !== 4) {
      alert("Camera not ready!");
      return;
    }

    const detection = await faceapi.detectSingleFace(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.3
      })
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

    if (!detection) {
      alert("❌ Face not detected!");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/users/register",
        {
          ...form,
          face_data: JSON.stringify(Array.from(detection.descriptor))
        }
      );

      alert("✅ Registered Successfully!");

     
         window.location.href = "/login";

    } catch (err) {
      console.log("Register error:", err);
      alert("Registration failed");
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

        <h2>Register</h2>

        <input
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        /><br /><br />

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        /><br /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        /><br /><br />

        <select
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <br /><br />

        <video
          ref={videoRef}
          autoPlay
          muted
          width="250"
          style={{ borderRadius: "10px" }}
        />

        <br /><br />

        <button
          onClick={handleRegister}
          style={{
            padding: "10px 20px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Register
        </button>

        {/* 🔥 LOGIN LINK FIXED */}
        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => window.location.href = "/login"}  
          >
            Login here
          </span>
        </p>

      </div>
    </div>
  );
};

export default Register;