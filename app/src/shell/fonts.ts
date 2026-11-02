import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff2';
import inter500 from '@fontsource/inter/files/inter-latin-500-normal.woff2';
import inter600 from '@fontsource/inter/files/inter-latin-600-normal.woff2';

/** Inter in the three weights the design uses (design/components/stronghold.css). Latin letters only, for now. */
const faces: ReadonlyArray<readonly [weight: string, url: string]> = [
  ['400', inter400],
  ['500', inter500],
  ['600', inter600],
];

let added = false;

/**
 * Adds the design's font to the page once, from the package's own files.
 *
 * Fonts belong to the page, not the shadow root: Chrome doesn't load an @font-face declared inside a shadow root,
 * but text inside one can use any font the page has. The CSS Font Loading API registers the faces straight from
 * script, so there is no <style> element and nothing inline. IBM Plex Mono joins when the first screen shows a
 * number.
 */
export function ensureFonts(): void {
  if (added) {
    return;
  }
  added = true;
  for (const [weight, url] of faces) {
    // Quoted, because a package path can contain parentheses or an apostrophe, which end an unquoted url().
    const face = new FontFace('Inter', `url("${url}") format("woff2")`, { weight, style: 'normal', display: 'swap' });
    document.fonts.add(face);
    face.load().catch(() => {
      // The page falls back to the system font (tokens.css, --sh-font-sans). Nothing else to do.
    });
  }
}
