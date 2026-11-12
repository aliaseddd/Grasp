// The application's entry: mounts React into #root. Step 2's page only says Grasp; the shell comes in step 5.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './app.css';

const INK = '#182630';
const TEAL = '#176B61';

const theme = createTheme({
  palette: { mode: 'light', primary: { main: TEAL }, text: { primary: INK } },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

const root = document.getElementById('root');
if (!root) throw new Error('The page has no #root to mount into.');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box data-testid="app" sx={{ height: '100%', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 500 }}>
        Grasp
      </Box>
    </ThemeProvider>
  </StrictMode>,
);
