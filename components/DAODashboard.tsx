"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTonWallet } from "@tonconnect/ui-react";
import { useGame } from "../context/GameContext";
import { useSoundContext } from "./SoundProvider";
import toast from "react-hot-toast";
import { generateSignature, verifySignature } from "../lib/verify";
import { captureEvent } from "../lib/analytics";

interface Proposal {
  id: number;
  title: string;
  description: string;
  options: string[];
  votes: Record<string, number>;
  creator: string;
  deadline: number;
  totalVotes: number;
}

export default function DAODashboard() {
  const wallet = useTonWallet();
  const gameContext = useGame();
  const level = gameContext.levelInfo.level;
  const { play } = useSoundContext();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"proposals" | "create" | "results">("proposals");
  const [newProposal, setNewProposal] = useState({ title: "", description: "", options: ["Yes", "No"] });

  useEffect(() => {
    loadProposals();
    const interval = setInterval(loadProposals, 15000); // Обновление каждые 15 секунд
    return () => clearInterval(interval);
  }, []);

  const loadProposals = async () => {
    try {
      const response = await fetch("/api/dao/proposals");
      if (response.ok) {
        const data = await response.json();
        setProposals(data.proposals || []);
      }
    } catch (err) {
      console.error("❌ Error loading proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: number, option: string) => {
    if (!wallet?.account?.address) {
      toast.error("Подключите кошелек");
      return;
    }

    play("click");

    try {
      const payload = JSON.stringify({ proposalId, option, walletAddress: wallet.account.address });
      const secretKey = process.env.NEXT_PUBLIC_TONIX_SECRET_KEY || "dev-secret-key-change-in-production";
      const signature = generateSignature(payload, secretKey);

      const response = await fetch("/api/dao/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          option,
          walletAddress: wallet.account.address,
          signature,
        }),
      });

      if (response.ok) {
        toast.success(`✅ Голос "${option}" учтён!`);
        play("success");
        captureEvent("dao_vote_casted", { proposalId, option });
        loadProposals();
      } else {
        throw new Error("Vote failed");
      }
    } catch (err) {
      console.error("❌ Error voting:", err);
      toast.error("Ошибка при голосовании");
      play("alert");
    }
  };

  const handleCreateProposal = () => {
    if (level < 5) {
      toast.error("Требуется Level 5+ для создания предложений");
      return;
    }
    toast.success("Создание предложения (в разработке)");
  };

  const activeProposals = proposals.filter((p) => p.deadline * 1000 > Date.now());
  const mostVoted = proposals.reduce((max, p) => 
    p.totalVotes > max.totalVotes ? p : max, 
    proposals[0] || { totalVotes: 0 }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-400 text-glow" style={{
          fontFamily: "'Satoshi', 'Inter', sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>🏛️ TONIX DAO</h2>
        <div className="tab-container">
          <button
            onClick={() => setActiveTab("proposals")}
            className={`tab ${activeTab === "proposals" ? "active" : ""}`}
            style={{
              fontFamily: "'Satoshi', 'Inter', sans-serif",
            }}
          >
            Proposals
          </button>
          {level >= 5 && (
            <button
              onClick={() => setActiveTab("create")}
              className={`tab ${activeTab === "create" ? "active" : ""}`}
              style={{
                fontFamily: "'Satoshi', 'Inter', sans-serif",
              }}
            >
              Create
            </button>
          )}
          <button
            onClick={() => setActiveTab("results")}
            className={`tab ${activeTab === "results" ? "active" : ""}`}
            style={{
              fontFamily: "'Satoshi', 'Inter', sans-serif",
            }}
          >
            Results
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "proposals" && (
          <motion.div
            key="proposals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="tab-content space-y-4"
          >
            {loading ? (
              <div className="text-center text-gray-400">Загрузка...</div>
            ) : activeProposals.length === 0 ? (
              <div className="text-center text-gray-400">Нет активных предложений</div>
            ) : (
              activeProposals.map((proposal) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-white/5 border border-purple-500/20 space-y-3"
                >
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{proposal.title}</h3>
                    <p className="text-sm text-gray-400">{proposal.description}</p>
                  </div>

                  <div className="space-y-2">
                    {proposal.options.map((option) => {
                      const votes = proposal.votes[option] || 0;
                      const percent = proposal.totalVotes > 0 ? (votes / proposal.totalVotes) * 100 : 0;
                      
                      return (
                        <div key={option} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">{option}</span>
                            <span className="text-purple-300">{votes} votes ({percent.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 glow-pulse"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {proposal.options.map((option) => (
                      <motion.button
                        key={option}
                        onClick={() => handleVote(proposal.id, option)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm transition-colors pulsate-border"
                      >
                        Vote {option}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "create" && level >= 5 && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="tab-content space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Title</label>
              <input
                type="text"
                value={newProposal.title}
                onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-purple-500/30 text-white"
                placeholder="Proposal title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Description</label>
              <textarea
                value={newProposal.description}
                onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-purple-500/30 text-white"
                placeholder="Proposal description"
                rows={4}
              />
            </div>
            <motion.button
              onClick={handleCreateProposal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold"
            >
              Create Proposal
            </motion.button>
          </motion.div>
        )}

        {activeTab === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="tab-content space-y-4"
          >
            {mostVoted.totalVotes > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50">
                <p className="text-sm text-yellow-300 mb-1">🔥 Most Voted Proposal</p>
                <p className="text-white font-bold">{mostVoted.title}</p>
                <p className="text-sm text-gray-400 mt-1">{mostVoted.totalVotes} total votes</p>
              </div>
            )}

            {proposals.map((proposal) => (
              <div key={proposal.id} className="p-4 rounded-xl bg-white/5 border border-gray-700">
                <h4 className="text-white font-semibold mb-2">{proposal.title}</h4>
                <div className="space-y-1">
                  {Object.entries(proposal.votes).map(([option, votes]) => (
                    <div key={option} className="flex justify-between text-sm">
                      <span className="text-gray-400">{option}</span>
                      <span className="text-purple-300">{votes} votes</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

