import React, { useState } from 'react';

type TabType = 'bank' | 'about' | 'how';

interface TabsProps {
  prizePool?: string;
  participants?: number;
  nextDraw?: string;
}

export default function Tabs({ prizePool = '0 TON', participants = 0, nextDraw = '—' }: TabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('bank');

  const tabs = [
    { id: 'bank' as TabType, label: '🎰 Текущий банк', icon: '🎰' },
    { id: 'about' as TabType, label: '💡 О проекте', icon: '💡' },
    { id: 'how' as TabType, label: '⚙️ Как это работает', icon: '⚙️' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-neon-gradient text-white neon-glow'
                : 'glass text-gray-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass-strong rounded-2xl p-6 min-h-[300px]">
        {activeTab === 'bank' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">🎰 Текущий банк</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 glass rounded-xl">
                <span className="text-gray-300">Prize Pool</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {prizePool}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 glass rounded-xl">
                <span className="text-gray-300">Участников</span>
                <span className="text-2xl font-bold text-white">{participants}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 glass rounded-xl">
                <span className="text-gray-300">Ближайший розыгрыш</span>
                <span className="text-lg font-semibold text-cyan-400">{nextDraw}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">💡 О проекте</h3>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                <strong className="text-white">Tonix Chain</strong> — это децентрализованная лотерея нового поколения, 
                построенная на блокчейне TON.
              </p>
              
              <p>
                Наша миссия — создать справедливую, прозрачную и безопасную платформу для лотерей, 
                где каждый участник имеет равные шансы на победу.
              </p>
              
              <div className="mt-6 p-4 glass rounded-xl">
                <h4 className="text-white font-semibold mb-2">✨ Ключевые особенности:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Полная децентрализация на смарт-контрактах</li>
                  <li>Прозрачность всех операций</li>
                  <li>Мгновенные выплаты победителям</li>
                  <li>Низкие комиссии</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'how' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">⚙️ Как это работает</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 glass rounded-xl">
                <div className="w-12 h-12 rounded-full bg-neon-gradient flex items-center justify-center font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">User</h4>
                  <p className="text-gray-300 text-sm">
                    Пользователь подключает кошелек через TonConnect и покупает билет
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-400" />
              </div>
              
              <div className="flex items-start gap-4 p-4 glass rounded-xl">
                <div className="w-12 h-12 rounded-full bg-neon-gradient flex items-center justify-center font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Smart Contract</h4>
                  <p className="text-gray-300 text-sm">
                    Смарт-контракт автоматически обрабатывает транзакцию и регистрирует участника
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-400" />
              </div>
              
              <div className="flex items-start gap-4 p-4 glass rounded-xl">
                <div className="w-12 h-12 rounded-full bg-neon-gradient flex items-center justify-center font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">TON Blockchain</h4>
                  <p className="text-gray-300 text-sm">
                    Все данные сохраняются в блокчейне TON, обеспечивая безопасность и прозрачность
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

