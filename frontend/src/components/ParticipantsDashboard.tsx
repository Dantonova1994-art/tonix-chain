import React, { useState, useMemo } from "react";

interface Participant {
  address: string;
  count: number;
}

interface ParticipantsDashboardProps {
  participants: Participant[];
}

const ParticipantsDashboard: React.FC<ParticipantsDashboardProps> = ({ participants }) => {
  const [isExporting, setIsExporting] = useState(false);

  // Агрегаты
  const stats = useMemo(() => {
    const totalTickets = participants.reduce((sum, p) => sum + (p.count || 0), 0);
    const totalParticipants = participants.length;
    return { totalTickets, totalParticipants };
  }, [participants]);

  // Экспорт в CSV
  const exportToCSV = () => {
    if (participants.length === 0) {
      alert('Нет участников для экспорта');
      return;
    }

    setIsExporting(true);
    
    try {
      const header = ["№", "Address", "Tickets"];
      const rows = participants.map((p, i) => [
        i + 1,
        p.address,
        p.count || 0,
      ]);
      
      const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `participants_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setTimeout(() => setIsExporting(false), 1500);
    } catch (err) {
      console.error('Export error:', err);
      alert('Ошибка при экспорте CSV');
      setIsExporting(false);
    }
  };

  return (
    <div style={{
      marginTop: "2rem",
      marginBottom: "1.5rem",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      background: "rgba(255, 255, 255, 0.04)",
      padding: "16px 20px",
      borderRadius: "12px",
      backdropFilter: "blur(6px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    }}>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "4px" }}>👥 Участников</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 600, color: "#00ffaa" }}>{stats.totalParticipants}</div>
        </div>
        <div>
          <div style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "4px" }}>🎟 Всего билетов</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 600, color: "#00bfff" }}>{stats.totalTickets}</div>
        </div>
      </div>
      <button
        onClick={exportToCSV}
        disabled={isExporting || participants.length === 0}
        style={{
          background: participants.length === 0 
            ? "rgba(255, 255, 255, 0.1)" 
            : "linear-gradient(90deg, #00e5ff, #007aff)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "10px 18px",
          fontWeight: 600,
          cursor: participants.length === 0 ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          opacity: isExporting || participants.length === 0 ? 0.6 : 1,
        }}
      >
        {isExporting ? "⏳ Экспорт..." : "⬇️ Экспорт CSV"}
      </button>
    </div>
  );
};

export default ParticipantsDashboard;
