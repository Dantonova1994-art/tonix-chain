import React from 'react';
import styles from './Roadmap.module.css';

interface RoadmapItem {
  id: number;
  icon: string;
  title: string;
  features: string[];
}

const roadmapItems: RoadmapItem[] = [
  {
    id: 1,
    icon: '🚀',
    title: 'Telegram UX Upgrade',
    features: [
      'Улучшение навигации Mini App',
      'Несколько активных лотерей',
      'Автообновление статуса'
    ]
  },
  {
    id: 2,
    icon: '💎',
    title: 'NFT Tickets',
    features: [
      'NFT-билеты на TON',
      'Перепродажа и коллекционирование',
      'Интеграция с TON NFT Marketplace'
    ]
  },
  {
    id: 3,
    icon: '🧩',
    title: 'TON Open League Integration',
    features: [
      'Подключение к Open Platform / Open League',
      'Поддержка токена $TONIX',
      'Рейтинг игроков и бонусы'
    ]
  },
  {
    id: 4,
    icon: '🔒',
    title: 'Smart Contract Enhancements',
    features: [
      'Оптимизация draw/claim',
      'Мульти-сессии',
      'Проверка выигрыша без транзакции'
    ]
  }
];

const Roadmap: React.FC = () => {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>🗺️ Roadmap v1.1 — Q4 2025</h1>
      <p className={styles.subtitle}>Bridging TON to the future of Web3 💠</p>
      
      <div className={styles.grid}>
        {roadmapItems.map((item, index) => (
          <div 
            key={item.id} 
            className={styles.card}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.icon}>{item.icon}</div>
            <h2 className={styles.cardTitle}>{item.title}</h2>
            <ul className={styles.cardList}>
              {item.features.map((feature, idx) => (
                <li key={idx} className={styles.cardText}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Roadmap;

