"use client";

import React from "react";

export default function EnvDebug() {
  const env = {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_TONCENTER_API: process.env.NEXT_PUBLIC_TONCENTER_API
  };

  return (
    <div
      style={{
        marginTop: "40px",
        padding: "20px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#0ff",
        fontFamily: "monospace"
      }}
    >
      <h3 style={{ color: "#00e0ff", marginBottom: "12px" }}>🌌 Env Debug</h3>
      {Object.entries(env).map(([key, value]) => (
        <p key={key}>
          <strong>{key}</strong>:{" "}
          <span style={{ color: value ? "#0f0" : "#f44" }}>
            {value || "undefined"}
          </span>
        </p>
      ))}
      <p style={{ marginTop: "10px", color: "#999" }}>
        (Если что-то undefined — переменная не проброшена в Vercel)
      </p>
    </div>
  );
}
