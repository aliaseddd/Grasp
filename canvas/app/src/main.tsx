// The application's entry: puts the shell's CSS variables on the page, then mounts React into #root.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { App } from './shell/App';
import { cssVariables, theme } from './shell/theme';
import './app.css';

for (const [name, value] of Object.entries(cssVariables)) document.documentElement.style.setProperty(name, value);

const root = document.getElementById('root');
if (!root) throw new Error('The page has no #root to mount into.');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
