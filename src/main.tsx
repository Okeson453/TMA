import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { telegram } from './shared/lib/telegram';

// Initialize Telegram WebApp SDK viewport and theme
telegram.init();

createRoot(document.getElementById('root')!).render(<App />);
