"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTonWallet } from "@tonconnect/ui-react";
import { formatAddressShort } from "../lib/address";
import { ENV } from "../lib/env";

interface NFTTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundId?: number;
  txHash?: string;
}

interface NFTTicket {
  address: string;
  roundId: number;
  timestamp: number;
}

export default function NFTTicketModal({ isOpen, onClose, roundId, txHash }: NFTTicketModalProps) {
  const wallet = useTonWallet();
  const [minting, setMinting] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState<NFTTicket[]>([]);
  const [mintStatus, setMintStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [nftAddress, setNftAddress] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleRequestMint = async () => {
    if (!wallet?.account?.address) {
      toast.error("Подключите кошелёк");
      return;
    }

    if (!roundId || !txHash) {
      toast.error("Недостаточно данных для минта");
      return;
    }

    setMinting(true);
    setMintStatus("minting");

    try {
      console.log("🎫 Requesting NFT mint...", { address: wallet.account.address, roundId, txHash });
      
      // В реальном приложении secretKey должен быть на сервере
      // Здесь используем заглушку
      const response = await fetch("/api/nft/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: wallet.account.address,
          roundId,
          txHash,
          secretKey: "stub-secret", // В проде это должно быть на сервере
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to request mint");
      }

      const data = await response.json();
      setNftAddress(data.nftAddress);
      setMintStatus("success");
      
      // Добавляем в галерею
      setMintedNFTs((prev) => [
        { address: data.nftAddress, roundId: data.roundId, timestamp: data.timestamp },
        ...prev.slice(0, 2), // Последние 3 NFT
      ]);

      toast.success("🎉 NFT Ticket minted!");
      console.log("✅ NFT mint request:", data);
    } catch (err: any) {
      console.error("❌ Error requesting NFT mint:", err);
      setMintStatus("error");
      toast.error("❌ Ошибка при минте NFT");
    } finally {
      setMinting(false);
    }
  };

  const openInTonviewer = (address: string) => {
    const url = `${ENV.TONCENTER?.replace("/api/v2/jsonRPC", "") || "https://tonviewer.com"}/${address}`;
    window.open(url, "_blank");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_40px_rgba(0,255,255,0.5)] max-w-md w-full z-10 max-h-[90vh] overflow-y-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10 rounded-2xl" />
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">NFT Ticket</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              title="Закрыть (Esc)"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Round Info */}
            {roundId && (
              <div className="p-3 rounded-lg border border-cyan-500/50 bg-cyan-500/10">
                <p className="text-sm text-gray-400">Раунд</p>
                <p className="text-lg font-bold text-cyan-300">#{roundId}</p>
              </div>
            )}

            {/* Wallet Info */}
            {wallet?.account?.address && (
              <div className="p-3 rounded-lg border border-cyan-500/50 bg-cyan-500/10">
                <p className="text-sm text-gray-400">Кошелёк</p>
                <p className="text-sm font-mono text-cyan-300">{formatAddressShort(wallet.account.address)}</p>
              </div>
            )}

            {/* TX Hash */}
            {txHash && (
              <div className="p-3 rounded-lg border border-cyan-500/50 bg-cyan-500/10">
                <p className="text-sm text-gray-400">TX Hash</p>
                <p className="text-xs font-mono text-cyan-300 break-all">{txHash.slice(0, 20)}...</p>
              </div>
            )}

            {/* Mint Status */}
            {mintStatus === "minting" && (
              <div className="p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 text-center">
                <p className="text-yellow-300">⏳ Минтится...</p>
              </div>
            )}

            {mintStatus === "success" && nftAddress && (
              <div className="p-4 rounded-lg border border-green-500/50 bg-green-500/10">
                <p className="text-green-300 font-semibold mb-2">✅ NFT создан!</p>
                <button
                  onClick={() => openInTonviewer(nftAddress)}
                  className="text-sm text-cyan-300 hover:text-cyan-200 underline"
                >
                  {formatAddressShort(nftAddress)}
                </button>
              </div>
            )}

            {mintStatus === "error" && (
              <div className="p-4 rounded-lg border border-red-500/50 bg-red-500/10">
                <p className="text-red-300">❌ Ошибка минта</p>
              </div>
            )}

            {/* Mint Button */}
            <button
              onClick={handleRequestMint}
              disabled={minting || !wallet?.account?.address || !roundId || !txHash}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {minting ? "⏳ Минтится..." : "🎫 Mint NFT Ticket"}
            </button>

            {/* NFT Gallery */}
            {mintedNFTs.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Последние NFT:</p>
                <div className="space-y-2">
                  {mintedNFTs.map((nft, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs text-gray-400">Раунд #{nft.roundId}</p>
                        <p className="text-xs font-mono text-cyan-300">{formatAddressShort(nft.address)}</p>
                      </div>
                      <button
                        onClick={() => openInTonviewer(nft.address)}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        Открыть
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              Нажмите Esc для закрытия
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
