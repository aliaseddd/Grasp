// Every colour and measure of the shell, in one place: the Material UI theme, and the CSS variables app.css reads
// (main.tsx puts them on :root), so that no stylesheet names a colour. Grasp's own ink and teal, carried over from the
// old page, with its greys; light only until slice 7 (plan/slice-1.md, section 7, Damon's choice 2).

import { createTheme } from '@mui/material';

/** The colours. */
export const INK = '#182630';
export const TEAL = '#176B61';
export const TEAL_SOFT = '#E7F1EF';
export const GROUND = '#EEF2F4';
export const LINE = '#E2E7EB';
export const LINE_STRONG = '#CBD3D9';
export const DOTS = '#B9C3CB';
export const TEXT_SECONDARY = '#5B6973';
export const WHITE = '#FFFFFF';

/** The measures, in px. */
export const BAR_HEIGHT = 40;
export const TAB_BAR_HEIGHT = 32;
export const FONT_SIZE = 13;
export const SMALL_FONT_SIZE = 12;
export const FONT_FAMILY = 'Roboto, Arial, sans-serif';

/** The Material UI theme: light, teal as the primary colour, ink as the text, Roboto at 13 px, dense controls. */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: TEAL },
    text: { primary: INK, secondary: TEXT_SECONDARY },
    background: { default: GROUND, paper: WHITE },
    divider: LINE,
  },
  typography: { fontFamily: FONT_FAMILY, fontSize: FONT_SIZE },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiIconButton: { defaultProps: { size: 'small' } },
    MuiTooltip: { defaultProps: { disableInteractive: true } },
  },
});

/** The CSS variables app.css reads, by name. main.tsx sets each on document.documentElement before the first render. */
export const cssVariables: Readonly<Record<string, string>> = {
  '--grasp-ink': INK,
  '--grasp-teal': TEAL,
  '--grasp-teal-soft': TEAL_SOFT,
  '--grasp-ground': GROUND,
  '--grasp-line': LINE,
  '--grasp-line-strong': LINE_STRONG,
  '--grasp-dots': DOTS,
  '--grasp-text-secondary': TEXT_SECONDARY,
  '--grasp-white': WHITE,
  '--grasp-bar-height': `${BAR_HEIGHT}px`,
  '--grasp-tab-bar-height': `${TAB_BAR_HEIGHT}px`,
  '--grasp-font-size': `${FONT_SIZE}px`,
  '--grasp-small-font-size': `${SMALL_FONT_SIZE}px`,
  '--grasp-font-family': FONT_FAMILY,
};
