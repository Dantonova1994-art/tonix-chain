import { useEffect, useState } from "react";

export default function useFadeIn(delay = 200) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return visible ? "fade-in" : "fade-hidden";
}

