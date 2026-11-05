import tokens from '../design/tokens.css';
import shell from './shell.css';

let sheet: CSSStyleSheet | undefined;

/**
 * The one stylesheet every Stronghold shadow root on the page adopts: the design's tokens, then the shell's styles.
 *
 * The design declares its tokens on :root (design/tokens/tokens.css). Inside a shadow root the equivalent is
 * :host, so that one word is swapped here and the token file itself stays a byte-for-byte copy of the design's
 * (src/design/README.md). A constructed stylesheet needs no <style> element, so nothing is inline.
 */
export function shellStyles(): CSSStyleSheet {
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(tokens.replace(/:root\b/g, ':host') + '\n' + shell);
  }
  return sheet;
}
