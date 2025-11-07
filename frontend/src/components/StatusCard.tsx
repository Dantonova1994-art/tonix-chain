import React from 'react';

interface StatusCardProps {
  status: 'Active' | 'Drawing' | 'Finished';
  prizePool?: string;
  participants?: number;
  nextDraw?: string;
}

export default function StatusCard({ 
  status, 
  prizePool = '0 TON', 
  participants = 0, 
  nextDraw = '—' 
}: StatusCardProps) {
  const statusColors = {
    Active: 'bg-green-500/20 border-green-500/50 text-green-400',
    Drawing: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    Finished: 'bg-gray-500/20 border-gray-500/50 text-gray-400',
  };

  return (
    <div className="glass-strong rounded-2xl p-6 backdrop-blur-xl border border-cyan-500/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Contract Status</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Prize Pool</span>
          <span className="text-cyan-400 font-bold text-lg">{prizePool}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Participants</span>
          <span className="text-white font-semibold">{participants}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Next Draw</span>
          <span className="text-white font-semibold text-sm">{nextDraw}</span>
        </div>
      </div>
    </div>
  );
}

