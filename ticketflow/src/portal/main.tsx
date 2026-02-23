import { createRoot } from 'react-dom/client';
import { App } from './App';
import '../styles.css';

const root = document.getElementById('ticketflow-portal');
if (root) {
    createRoot(root).render(<App />);
}
