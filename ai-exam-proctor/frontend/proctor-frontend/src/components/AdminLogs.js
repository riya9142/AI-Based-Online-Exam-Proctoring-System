import React, { useEffect, useState } from "react";

function AdminLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/logs")
      .then(res => res.json())
      .then(data => {
        console.log("Logs:", data);
        setLogs(data);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📸 Cheating Logs</h2>

      {logs.map((log) => (
        <div key={log.id} style={{
          border: "1px solid #ccc",
          margin: "10px",
          padding: "10px",
          borderRadius: "10px"
        }}>
          <p><b>Email:</b> {log.email}</p>
          <p><b>Type:</b> {log.type}</p>

          {/* ✅ IMAGE DISPLAY */}
          <img
            src={`http://localhost:8000/${log.image_path}`}
            alt="log"
            width="250"
            style={{ borderRadius: "8px" }}
          />
        </div>
      ))}
    </div>
  );
}

export default AdminLogs;