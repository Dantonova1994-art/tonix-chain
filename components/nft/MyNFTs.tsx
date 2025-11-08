"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTonWallet } from "@tonconnect/ui-react";
import toast from "react-hot-toast";
import { formatAddressShort } from "../../lib/address";
import { ENV } from "../../lib/env";

interface NFTItem {
  id: string;
  type: "ticket" | "winner";
  address: string;
  metadata?: {
    name: string;
    description: string;
    image: string;
  };
}

export default function MyNFTs() {
  const wallet = useTonWallet();
  const [tickets, setTickets] = useState<NFTItem[]>([]);
  const [winners, setWinners] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet?.account?.address) {
      fetchNFTs();
    }
  }, [wallet?.account?.address]);

  const fetchNFTs = async () => {
    if (!wallet?.account?.address) return;

    setLoading(true);
    try {
      // TODO: В реальной реализации здесь будет запрос к истории транзакций
      // и получение списка NFT itemId для данного кошелька
      // Пока используем mock данные
      const mockTickets: NFTItem[] = [];
      const mockWinners: NFTItem[] = [];

      // Загружаем метаданные для каждого NFT
      for (const ticket of mockTickets) {
        try {
          const response = await fetch(`/api/nft/metadata/ticket/${ticket.id}`);
          if (response.ok) {
            ticket.metadata = await response.json();
          }
        } catch (err) {
          console.warn("Failed to fetch ticket metadata:", err);
        }
      }

      for (const winner of mockWinners) {
        try {
          const response = await fetch(`/api/nft/metadata/winner/${winner.id}`);
          if (response.ok) {
            winner.metadata = await response.json();
          }
        } catch (err) {
          console.warn("Failed to fetch winner metadata:", err);
        }
      }

      setTickets(mockTickets);
      setWinners(mockWinners);
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      toast.error("Ошибка при загрузке NFT");
    } finally {
      setLoading(false);
    }
  };

  if (!wallet?.account?.address) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 text-center"
      >
        <p className="text-gray-400">Подключите кошелёк, чтобы увидеть свои NFT</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
    >
      <h2 className="text-xl font-bold text-purple-400 mb-4 text-center">🎫 Мои NFT</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin text-cyan-400">⏳</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-3">Билеты ({tickets.length})</h3>
            {tickets.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Нет билетов</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {tickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-lg border border-gray-600 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-3xl mb-2">🎫</div>
                    <p className="text-xs font-mono text-cyan-300">{formatAddressShort(ticket.address)}</p>
                    {ticket.metadata && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{ticket.metadata.name}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-300 mb-3">Победители ({winners.length})</h3>
            {winners.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Нет NFT победителей</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {winners.map((winner) => (
                  <motion.div
                    key={winner.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-lg border border-gray-600 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-3xl mb-2">🏆</div>
                    <p className="text-xs font-mono text-cyan-300">{formatAddressShort(winner.address)}</p>
                    {winner.metadata && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{winner.metadata.name}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

