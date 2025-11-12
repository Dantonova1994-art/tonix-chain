"use client";

import { ReactNode } from "react";
import AIWidget from "./AIWidget";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#070a12] text-white">
      {children}
      <AIWidget />
    </div>
  );
}

