import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TonConnectProvider from "../src/components/TonConnectProvider";
import FooterDock from "../src/components/FooterDock";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tonix Chain - Лотерея будущего на TON",
  description: "Играй. Выигрывай. Проверь свою удачу.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen flex flex-col items-center justify-between bg-[#0b0f19] text-white`}
      >
        <TonConnectProvider>
          <div className="w-full flex-grow flex flex-col items-center pb-20">
            {children}
          </div>
          <FooterDock />
        </TonConnectProvider>
      </body>
    </html>
  );
}
