import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

const FaceEnroll = () => {
  const videoRef = useRef();
  const [status, setStatus] = useState("Loading models...");

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";

        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        setStatus("Models loaded ✅ Starting camera...");
        startVideo();

      } catch (err) {
        console.log(err);
        setStatus("Error loading models ❌");
      }
    };

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
          setStatus("Camera started 🎥");
        })
        .catch(() => {
          setStatus("Camera access denied ❌");
        });
    };

    loadModels();
  }, []);

  const captureFace = async () => {
    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("No face detected!");
      return;
    }

    // ✅ Save face
    localStorage.setItem(
      "faceDescriptor",
      JSON.stringify(Array.from(detection.descriptor))
    );

    alert("Face Enrolled Successfully ✅");

    window.location.href = "/"; // back to login
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Face Enrollment</h2>
      <p>{status}</p>

      <video ref={videoRef} autoPlay muted width="400" />

      <br /><br />
      <button onClick={captureFace}>Capture Face</button>
    </div>
  );
};

export default FaceEnroll;