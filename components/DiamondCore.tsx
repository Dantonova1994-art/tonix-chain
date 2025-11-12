"use client";

import React from "react";
import styles from "./DiamondCore.module.css";

export default function DiamondCore() {
  return (
    <div className={styles.diamondWrapper}>
      <div className={styles.diamond}>
        <div className={styles.diamondGlow}></div>
        <div className={styles.diamondLight}></div>
      </div>
    </div>
  );
}
