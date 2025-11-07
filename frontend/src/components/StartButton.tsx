import React from 'react';
import styles from './StartButton.module.css';

interface StartButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function StartButton({ onClick, className }: StartButtonProps) {
  return (
    <button 
      className={`${styles.startButton} ${className || ''}`}
      onClick={onClick}
    >
      <span className={styles.buttonText}>НАЧАТЬ ИГРУ 💎</span>
    </button>
  );
}

