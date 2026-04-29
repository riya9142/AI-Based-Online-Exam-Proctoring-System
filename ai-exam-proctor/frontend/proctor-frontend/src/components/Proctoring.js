import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

const Proctoring = ({ startAudio }) => {

  const videoRef = useRef();
  const noFaceTime = useRef(0);
  const audioStarted = useRef(false);
  const lookingDownTime = useRef(0);
  const noiseTime = useRef(0);
  const warningCount = useRef(0);
  const sideTime = useRef(0);

  const isTerminated = useRef(false); // 🔒 LOCK

  const [status, setStatus] = useState("Loading...");

  const playAlert = () => {
    const audio = new Audio("/alert.mp3");
    audio.play().catch(() => {});
  };

  // ================= 🚨 TERMINATION FUNCTION =================
  const terminateExam = async (type) => {
    if (isTerminated.current) return;
    isTerminated.current = true;

    try {
      const email = localStorage.getItem("email");
      const examId = localStorage.getItem("examId");

      console.log("🚨 Terminating:", type);

      const image = captureImage();

      // ✅ SAVE RESULT
      await axios.post("http://127.0.0.1:8000/api/exams/submit", {
        user_email: email,
        exam_id: examId
      });

      console.log("✅ Result saved");

      // ✅ SAVE LOG
      if (image) {
        await axios.post("http://127.0.0.1:8000/api/logs", {
          email: email,
          exam_id: examId,
          type: type,
          image: image
        });
        console.log("📸 Log saved");
      }

      window.alert(`🚨 Exam terminated: ${type}`);

      localStorage.removeItem("examId");
      localStorage.removeItem("duration");
      localStorage.setItem("refreshDashboard", "true");

      setTimeout(() => {
        window.location.href = "/student";
      }, 1500);

    } catch (err) {
      console.log("🔥 Termination error:", err);
    }
  };

  // ================= LOAD MODELS =================
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      startVideo();
    };

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.log(err));
    };

    loadModels();
  }, []);

  // ================= 🎤 NOISE DETECTION =================
  useEffect(() => {

    if (!startAudio || audioStarted.current) return;

    const startMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await audioContext.resume();

        const analyser = audioContext.createAnalyser();
        const mic = audioContext.createMediaStreamSource(stream);

        mic.connect(analyser);
        analyser.fftSize = 512;

        const dataArray = new Uint8Array(analyser.fftSize);

        audioStarted.current = true;

        setInterval(async () => {

          analyser.getByteTimeDomainData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            let val = (dataArray[i] - 128) / 128;
            sum += val * val;
          }

          const rms = Math.sqrt(sum / dataArray.length);

          if (rms < 0.03) noiseTime.current = 0;
          else if (rms > 0.1) noiseTime.current += 1;
          else noiseTime.current = 0;

          if (noiseTime.current >= 5) {
            setStatus("Noise detected 🚨");
            playAlert();

            await terminateExam("noise");
          }

        }, 1000);

      } catch (err) {
        console.log("Mic error:", err);
      }
    };

    startMic();

  }, [startAudio]);

  // ================= FACE DETECTION =================
  useEffect(() => {

    const interval = setInterval(async () => {

      if (videoRef.current && videoRef.current.readyState === 4) {

        const storedFaceData = localStorage.getItem("faceDataFromDB");

        if (!storedFaceData) {
          setStatus("No enrolled face found!");
          return;
        }

        const storedDescriptor = new Float32Array(JSON.parse(storedFaceData));

        const detections = await faceapi
          .detectAllFaces(videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length === 0) {
          noFaceTime.current += 2;

          if (noFaceTime.current >= 6) {
            setStatus("No face detected!");
            playAlert();

            await terminateExam("no_face");
          }
        }

        else if (detections.length > 1) {
          setStatus("Multiple faces!");
          playAlert();

          await terminateExam("multiple_faces");
        }

        else {
          noFaceTime.current = 0;

          const currentDescriptor = detections[0].descriptor;
          const landmarks = detections[0].landmarks;

          const nose = landmarks.getNose()[3];
          const jaw = landmarks.getJawOutline()[8];

          if (nose.y > jaw.y - 15) {
            lookingDownTime.current += 2;

            if (lookingDownTime.current >= 6) {
              setStatus("Looking down 🚨");
              playAlert();

              await terminateExam("looking_down");
            }

          } else {
            lookingDownTime.current = 0;
          }

          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();

          const eyeDiff = Math.abs(leftEye[0].x - rightEye[3].x);

          if (eyeDiff < 50) {
            sideTime.current += 2;

            if (sideTime.current >= 6) {
              warningCount.current++;
              sideTime.current = 0;

              window.alert(`⚠️ Warning ${warningCount.current}/3`);

              if (warningCount.current >= 3) {
                await terminateExam("side_pose");
              }
            }

          } else {
            sideTime.current = 0;
          }

          const distance = faceapi.euclideanDistance(
            storedDescriptor,
            currentDescriptor
          );

          if (distance > 0.6) {
            setStatus("Face mismatch 🚨");
            playAlert();

            await terminateExam("face_mismatch");
          } else {
            setStatus("Face Verified ✅");
          }
        }
      }

    }, 2000);

    return () => clearInterval(interval);

  }, []);

  // 📸 Capture image
  const captureImage = () => {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg");
  };

  const submitExam = async () => {
  try {
    const email = localStorage.getItem("email");
    const examId = localStorage.getItem("examId");

    console.log("📝 Submitting exam normally");

    await axios.post("http://127.0.0.1:8000/api/exams/submit", {
      user_email: email,
      exam_id: examId
    });

    window.alert("✅ Exam submitted successfully");

    localStorage.removeItem("examId");
    localStorage.removeItem("duration");
    localStorage.setItem("refreshDashboard", "true");

    setTimeout(() => {
      window.location.href = "/student";
    }, 1000);

  } catch (err) {
    console.log("❌ Submit error:", err);
  }
};

  return (
    <div style={{ textAlign: "center", marginTop: "10px" }}>
      <h3>Proctoring Status</h3>
      <p>{status}</p>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="200"
        height="150"
        style={{ border: "2px solid black" }}
      />
    </div>
  );
};

export default Proctoring;