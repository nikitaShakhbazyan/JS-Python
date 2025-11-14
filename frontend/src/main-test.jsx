import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TestApp from './TestApp.jsx';

const root = document.getElementById('root');
if (root) {
    createRoot(root).render(
        <StrictMode>
            <TestApp />
        </StrictMode>
    );
} else {
    console.error('Root element not found!');
}
