import React from 'react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-cosmic-gradient animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-black" />
      
      {/* Stars effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-neon-gradient rounded-lg transform rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.5),0_0_40px_rgba(0,136,255,0.3)]">
              <span className="text-4xl transform -rotate-45">💎</span>
            </div>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            TONIX CHAIN
          </span>
        </h1>

        {/* Main heading */}
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
          Лотерея будущего на TON{' '}
          <span className="text-4xl md:text-6xl">💎</span>
        </h2>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Децентрализованная лотерея нового поколения
        </p>

        {/* CTA Button */}
        <button className="px-8 py-4 bg-neon-gradient rounded-xl font-bold text-lg text-white shadow-[0_0_20px_rgba(0,255,255,0.5),0_0_40px_rgba(0,136,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.8),0_0_60px_rgba(0,136,255,0.5)] transform transition-all duration-300 hover:scale-105">
          Launch dApp
        </button>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle 3s infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}

