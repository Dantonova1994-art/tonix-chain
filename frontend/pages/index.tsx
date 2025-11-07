"use client";

import React from "react";
import EnvDebug from "../components/EnvDebug";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #0a0f2c, #000)",
        color: "#fff",
        padding: "40px",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>TONIX CHAIN 🌌</h1>
      <p>Проверка окружения (Environment Variables)</p>
      <EnvDebug />
    </main>
  );
}
