// Roboto regular's widths. Written by canvas/app/test/roboto-widths.mjs from @fontsource/roboto 5.3.0,
// roboto-latin-400-normal.woff2, as Chromium measures it; do not edit. `node canvas/app/test/roboto-widths.mjs --check`
// fails when this file is not what the font gives.
//
// The adapter wraps a compartment's rows by these (core/adapter.ts), so a box's height is known without the DOM, in
// Node as in the page. A row is drawn with kerning and ligatures off (app.css), so its width in the page is the sum
// of its characters' widths.

/** The font's units per em. */
export const ROBOTO_EM = 2048;

// [width in units of 1/2048 em, the characters that wide], 230 characters in all.
const ADVANCES: readonly (readonly [number, string])[] = [
  [128, '\u200a'],
  [254, '\u202f'],
  [341.333, '\u2006'],
  [358, '\'\u2032'],
  [403, ','],
  [408, '\u201a'],
  [410, '\u02bc\u2018\u2019'],
  [418, '\u2009'],
  [433, ';'],
  [455.111, '\u205f'],
  [490, 'j'],
  [492, '\u00a6'],
  [496, ':'],
  [498, 'il'],
  [500, '|\u00a1'],
  [507, '\u00ec\u00ed\u00ee\u00ef\u0131'],
  [508, '\u0020\u00a0\u00b8\u2028\u2029'],
  [512, '\u2005'],
  [528, '!'],
  [535, '\u00b7'],
  [540, '.\u2008'],
  [543, '[]'],
  [557, 'I\u00cc\u00cd\u00ce\u00cf'],
  [566, '-'],
  [615, '\u2039\u203a'],
  [633, '`'],
  [642, '\u00b4'],
  [656, '"\u2033'],
  [670, 't'],
  [682.667, '\u2004'],
  [686, '\u02da'],
  [691, '\u2022'],
  [693, '{}'],
  [694, 'r'],
  [701, '('],
  [706, '\u201e'],
  [712, 'f'],
  [713, ')'],
  [724, '\u201c'],
  [732, '\u201d'],
  [751, '\u00b2\u00b3\u00b9'],
  [765, '\u00b0'],
  [841, '\\'],
  [845, '/'],
  [856, '^'],
  [857, '\u00a8'],
  [882, '*'],
  [916, '\u00aa'],
  [924, '_'],
  [932, '\u00ba'],
  [939, '\u00af'],
  [960, '\u00bb'],
  [961, '\u00ab'],
  [964, '\u02c6'],
  [966, '\u02dc'],
  [968, '?'],
  [969, 'y\u00fd\u00ff'],
  [970, '\u00bf'],
  [992, 'v'],
  [1002, '\u00b6'],
  [1016, 'xz'],
  [1038, 'k'],
  [1041, '<'],
  [1044, '\u2000\u2002'],
  [1057, 's'],
  [1071, '>'],
  [1072, 'c\u00e7'],
  [1076, '\u00a5'],
  [1086, 'e\u00e8\u00e9\u00ea\u00eb'],
  [1093, '\u00d7'],
  [1095, '\u00b1'],
  [1103, 'L'],
  [1114, 'a\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5'],
  [1121, '\u00a2'],
  [1124, '='],
  [1128, 'h'],
  [1129, 'u\u00f9\u00fa\u00fb\u00fc'],
  [1130, 'J'],
  [1131, 'n\u00f1'],
  [1132, 'F'],
  [1134, '\u00ac'],
  [1150, 'bgp'],
  [1151, '$0123456789\u2007\u20ac'],
  [1155, 'd'],
  [1161, '\u00b5\u00f8'],
  [1162, '+'],
  [1164, 'Eq\u00c8\u00c9\u00ca\u00cb'],
  [1168, 'o\u00f2\u00f3\u00f4\u00f5\u00f6'],
  [1170, '\u00f7'],
  [1171, '\u2212'],
  [1180, '\u00fe'],
  [1191, '\u00a3'],
  [1201, '\u00f0'],
  [1210, '\u00de'],
  [1216, 'S'],
  [1218, '\u00df'],
  [1222, 'T'],
  [1227, 'Z'],
  [1230, 'Y\u00dd'],
  [1256, '\u00a7'],
  [1261, '#'],
  [1262, 'R'],
  [1274, '&'],
  [1276, 'B'],
  [1281, '\u2122'],
  [1284, 'X'],
  [1285, 'K'],
  [1292, 'P'],
  [1304, 'V'],
  [1328, 'U\u00d9\u00da\u00db\u00dc'],
  [1333, 'C\u00c7'],
  [1336, 'A\u00c0\u00c1\u00c2\u00c3\u00c4\u00c5'],
  [1344, 'D\u2013'],
  [1370, '\u2026'],
  [1374, '\u00d0'],
  [1393, '~'],
  [1395, 'G'],
  [1409, 'OQ\u00d2\u00d3\u00d4\u00d5\u00d6\u00d8'],
  [1461, 'HN\u00a4\u00d1'],
  [1500, '%\u00bc'],
  [1539, 'w'],
  [1589, '\u00bd'],
  [1593, '\u00be'],
  [1599, '\u2014'],
  [1609, '\u00a9'],
  [1610, '\u00ae'],
  [1730, '\u00e6'],
  [1788, 'M'],
  [1796, 'm'],
  [1817, 'W'],
  [1839, '@'],
  [1860, '\u0153'],
  [1914, '\u00c6'],
  [1953, '\u0152'],
  [2048, '\u2001\u2003'],
  [2101, '\ufffd'],
];

const WIDTHS = new Map<number, number>();
for (const [units, chars] of ADVANCES) for (const ch of chars) WIDTHS.set(ch.codePointAt(0) as number, units);

/**
 * The width of a character the font has no glyph for, in units: one em. Another font draws it, which this file knows
 * nothing of; an em is as wide as the widest letters, so a row with such characters is wrapped early, not late.
 */
export const ROBOTO_UNKNOWN = ROBOTO_EM;

/** Whether Roboto regular's Latin file draws this character itself. */
export function robotoHas(ch: string): boolean {
  return WIDTHS.has(ch.codePointAt(0) as number);
}

/**
 * The width of one line of text in Roboto regular at `px` px, with kerning and ligatures off: the sum of its
 * characters' widths, a character by code point. Not rounded.
 */
export function textWidth(text: string, px: number): number {
  let units = 0;
  for (const ch of text) units += WIDTHS.get(ch.codePointAt(0) as number) ?? ROBOTO_UNKNOWN;
  return (units * px) / ROBOTO_EM;
}
