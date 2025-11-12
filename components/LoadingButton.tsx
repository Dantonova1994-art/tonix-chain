"use client";

import { useState } from "react";

export default function LoadingButton({ 
  text, 
  icon, 
  onClick 
}: { 
  text: string; 
  icon?: string; 
  onClick?: () => void | Promise<void>; 
}) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onClick?.();
    } finally {
      setTimeout(() => setLoading(false), 700);
    }
  };

  return (
    <>
      <button 
        onClick={handleClick} 
        className={`btn-neon ${loading ? "loading" : ""}`}
        disabled={loading}
      >
        {loading ? (
          <span className="loader" />
        ) : (
          <>
            {icon && <span style={{ marginRight: "6px" }}>{icon}</span>}
            {text}
          </>
        )}
      </button>
      <style jsx>{`
        .loader {
          border: 2px solid rgba(255,255,255,0.2);
          border-top: 2px solid #fff;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

