import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../lib/motion.js';

export default function AutoVideo({ src, poster, label, className = '' }) {
  const ref = useRef(null);
  const reduce = usePrefersReducedMotion();
  const [saveData, setSaveData] = useState(false);
  const [visible, setVisible] = useState(false);

  const manual = reduce || saveData; // visitor starts it themselves

  useEffect(() => {
    setSaveData(navigator.connection?.saveData === true);
  }, []);

  useEffect(() => {
    if (manual) return undefined;
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [manual]);

  useEffect(() => {
    const el = ref.current;
    if (!el || manual) return;
    el.muted = true; // required for autoplay
    if (visible) el.play().catch(() => {});
    else el.pause();
  }, [visible, manual]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      controls={manual}
      preload={manual ? 'none' : 'metadata'}
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}