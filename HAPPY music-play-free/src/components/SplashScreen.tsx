import { useState, useEffect } from 'preact/hooks';

interface Props {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: Props) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1500);
    const t2 = setTimeout(onComplete, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      class={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${fade ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: 'var(--color-bg)' }}
      role="alert"
      aria-live="polite"
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="32" fill="var(--color-accent)" />
        <path d="M24 20v24l20-12-20-12z" fill="white" />
      </svg>
      <h1 class="mt-4 text-xl font-bold tracking-wide" style={{ color: 'var(--color-text)' }}>
        MUSIC-PLAY-FREE
      </h1>
      <p class="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Reproductor de audio
      </p>
    </div>
  );
}
