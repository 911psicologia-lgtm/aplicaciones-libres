interface Props {
  onClose: () => void;
}

export default function WelcomeScreen({ onClose }: Props) {
  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-overlay)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida"
    >
      <div
        class="w-full max-w-sm rounded-2xl p-6 text-center"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" class="mx-auto" aria-hidden="true">
          <circle cx="32" cy="32" r="32" fill="var(--color-accent)" />
          <path d="M24 20v24l20-12-20-12z" fill="white" />
        </svg>
        <h2 class="mt-4 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          Tu música, en tu dispositivo
        </h2>
        <p class="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Selecciona archivos o una carpeta para crear tu biblioteca.
          MUSIC-PLAY-FREE reproduce tus audios localmente y no necesita subirlos a Internet.
        </p>
        <button
          onClick={onClose}
          class="mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: 'var(--color-accent)' }}
          aria-label="Comenzar a usar la aplicación"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}
