import { render } from 'preact';
import App from './app';
import './index.css';

render(<App />, document.getElementById('app')!);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {
      // SW registration failed, app still works
    });
  });
}
