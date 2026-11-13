// Every colour and measure of the shell, in one place: the Material UI theme, and the CSS variables app.css reads
// (main.tsx puts them on :root), so that no stylesheet names a colour. Grasp's own ink and teal, carried over from the
// old page, with its greys; light only until slice 7 (plan/slice-1.md, section 7, Damon's choice 2).

import { createTheme } from '@mui/material';

/** The colours. */
export const INK = '#182630';
export const TEAL = '#176B61';
export const TEAL_SOFT = '#E7F1EF';
export const GROUND = '#EEF2F4';
/** The ground of the two strips: a tone darker than GROUND, so they read as bars of their own, and light enough for TEXT_SECONDARY on it. */
export const STRIP = '#E3E8EC';
export const LINE = '#E2E7EB';
/** The lines that part the window: the sashes, and the strips' edges. Darker than the old page's, to be seen at a glance. */
export const LINE_STRONG = '#B4BFC8';
export const DOTS = '#B9C3CB';
export const TEXT_SECONDARY = '#5B6973';
export const WHITE = '#FFFFFF';
/** What a plane's minimap lays over the part of its picture that is outside the plane's window: the ground, let through. */
export const MINIMAP_MASK = 'rgba(238, 242, 244, 0.7)';
/** A disabled icon on the ink bar. */
export const BAR_DISABLED = 'rgba(255, 255, 255, 0.35)';

/** The measures, in px. */
export const BAR_HEIGHT = 40;
export const TAB_BAR_HEIGHT = 32;
export const FONT_SIZE = 13;
export const SMALL_FONT_SIZE = 12;
export const FONT_FAMILY = 'Roboto, Arial, sans-serif';
/** The ring that shows where the keyboard's focus is: its width, and how far it stands off what it rings. */
export const FOCUS_WIDTH = 2;
export const FOCUS_OFFSET = 2;

/** A size in px as Material UI's type takes it, in rem of the browser's 16 px, so it follows the browser's own text size. */
const rem = (px: number): string => `${px / 16}rem`;

/**
 * The Material UI theme: light, teal as the primary colour, ink as the text, Roboto at 13 px, dense controls.
 *
 * The sizes are given per variant. Material UI's `typography.fontSize` is not the size of the text: it scales the
 * whole type scale by fontSize / 14, which made the body 14.86 px and every other size a fraction of a pixel.
 *
 * The buttons have no ripple, which is also what Material UI shows the keyboard's focus with, so the focus gets a
 * ring of its own: teal, standing off the control. A control on the ink bar draws it in white (TopBar.tsx).
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: TEAL },
    text: { primary: INK, secondary: TEXT_SECONDARY },
    background: { default: GROUND, paper: WHITE },
    divider: LINE,
  },
  typography: {
    fontFamily: FONT_FAMILY,
    body1: { fontSize: rem(FONT_SIZE) },
    body2: { fontSize: rem(FONT_SIZE) },
    button: { fontSize: rem(FONT_SIZE) },
    caption: { fontSize: rem(SMALL_FONT_SIZE) },
  },
  components: {
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: { root: { '&.Mui-focusVisible': { outline: `${FOCUS_WIDTH}px solid ${TEAL}`, outlineOffset: FOCUS_OFFSET } } },
    },
    MuiIconButton: { defaultProps: { size: 'small' } },
    MuiTooltip: { defaultProps: { disableInteractive: true }, styleOverrides: { tooltip: { fontSize: rem(SMALL_FONT_SIZE) } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none' }, sizeSmall: { fontSize: rem(FONT_SIZE) } } },
  },
});

/** The CSS variables app.css reads, by name. main.tsx sets each on document.documentElement before the first render. */
export const cssVariables: Readonly<Record<string, string>> = {
  '--grasp-ink': INK,
  '--grasp-teal': TEAL,
  '--grasp-teal-soft': TEAL_SOFT,
  '--grasp-ground': GROUND,
  '--grasp-strip': STRIP,
  '--grasp-line': LINE,
  '--grasp-line-strong': LINE_STRONG,
  '--grasp-dots': DOTS,
  '--grasp-text-secondary': TEXT_SECONDARY,
  '--grasp-white': WHITE,
  '--grasp-minimap-mask': MINIMAP_MASK,
  '--grasp-bar-height': `${BAR_HEIGHT}px`,
  '--grasp-tab-bar-height': `${TAB_BAR_HEIGHT}px`,
  '--grasp-font-size': `${FONT_SIZE}px`,
  '--grasp-small-font-size': `${SMALL_FONT_SIZE}px`,
  '--grasp-font-family': FONT_FAMILY,
  '--grasp-focus-width': `${FOCUS_WIDTH}px`,
};
