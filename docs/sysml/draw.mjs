// Draws the view proofStructure of stronghold-proof.sysml into stronghold-proof.svg, and into stronghold-proof.html
// between its drawing markers, so the picture and the page always show the same drawing.
//
//   node docs/sysml/draw.mjs
//
// The layout is by hand: three columns 368 wide, 36 apart, and every box placed below. It isn't generated from
// the model, so a change to the model needs the same change here. Each doc line is copied from the model.
// Every box is a <g data-el="..."> named after its model element; that is how the page knows what a note is on.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SVG_FILE = path.join(here, 'stronghold-proof.svg');
const PAGE_FILE = path.join(here, 'stronghold-proof.html');
const START = '<!-- drawing:start -->';
const END = '<!-- drawing:end -->';

const SANS = "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Vertical metrics, in px. A compartment is a rule, an italic heading, then lines on a 15px leading.
const NAME_H = 40;
const HEAD_H = 18;
const LEAD = 15;
const PAD_B = 6;
const compH = (n) => HEAD_H + LEAD * n + PAD_B;
const defH = (comps = [], minH = 0) => Math.max(minH, NAME_H + comps.reduce((sum, c) => sum + compH(c.lines.length), 0));

const STYLE = {
  kw: { ff: SANS, fs: 10.5, op: 0.72 },
  name: { ff: SANS, fs: 13, fw: 600 },
  uname: { ff: SANS, fs: 12.5, fw: 500 },
  head: { ff: SANS, fs: 10.5, fi: true, op: 0.66 },
  mono: { ff: MONO, fs: 11 },
  doc: { ff: SANS, fs: 11, op: 0.86 },
  frameName: { ff: SANS, fs: 12, fw: 600 },
};

const P = 'StrongholdProof';
const W = 1240;
const COL = [32, 436, 840];
const CW = 368;

// variant 'svg': the standalone file, on a white ground. 'page': for stronghold-proof.html, colored by the page.
function draw(variant) {
  const page = variant === 'page';
  const ACCENT = page ? '#2F8C7E' : '#176B61';
  const out = [];
  const push = (s) => out.push(s);

  function text(x, y, str, style, anchor = 'start') {
    const st = STYLE[style];
    let a = `<text x="${x}" y="${y}"`;
    if (anchor !== 'start') a += ` text-anchor="${anchor}"`;
    a += ` font-family="${st.ff}" font-size="${st.fs}"`;
    if (st.fw) a += ` font-weight="${st.fw}"`;
    if (st.fi) a += ' font-style="italic"';
    a += ' fill="currentColor"';
    if (st.op) a += ` fill-opacity="${st.op}"`;
    return `${a}>${esc(str)}</text>`;
  }

  function spans(x, y, parts) {
    let a = `<text x="${x}" y="${y}" fill="currentColor">`;
    for (const [style, str] of parts) {
      const st = STYLE[style];
      a += `<tspan font-family="${st.ff}" font-size="${st.fs}"`;
      if (st.fw) a += ` font-weight="${st.fw}"`;
      if (st.op) a += ` fill-opacity="${st.op}"`;
      a += `>${esc(str)}</tspan>`;
    }
    return a + '</text>';
  }

  const box = (x, y, w, h, r = 0) =>
    `<rect class="outline" x="${x}" y="${y}" width="${w}" height="${h}"${r ? ` rx="${r}"` : ''} fill="none" stroke="currentColor" stroke-width="1.25"/>`;
  const rule = (x1, y, x2) =>
    `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="currentColor" stroke-width="0.75" stroke-opacity="0.45"/>`;
  // An invisible wide stroke along a thin line, so the line is easy to point at on the page.
  const hit = (d) => `<path class="hit" d="${d}" fill="none" stroke="transparent" stroke-width="12"/>`;

  // One model element: everything drawn inside belongs to it, and boxes nested inside are nested here too.
  function element(el, label, kind, body) {
    push(`<g data-el="${esc(el)}" data-label="${esc(label)}" data-kind="${kind}">`);
    body();
    push('</g>');
  }

  // A definition: square corners, «keyword» and name, then compartments.
  function def({ x, y, w, keyword, name, comps = [], minH = 0 }) {
    const h = defH(comps, minH);
    const cx = x + w / 2;
    push(box(x, y, w, h));
    push(text(cx, y + 16, keyword, 'kw', 'middle'));
    push(text(cx, y + 32, name, 'name', 'middle'));
    let cy = y + NAME_H;
    for (const c of comps) {
      push(rule(x, cy, x + w));
      push(text(cx, cy + 13, c.heading, 'head', 'middle'));
      c.lines.forEach((line, i) => push(text(x + 12, cy + HEAD_H + 11 + i * LEAD, line, c.mono ? 'mono' : 'doc')));
      cy += compH(c.lines.length);
    }
    return y + h;
  }

  // A usage: rounded corners, «part» and "name : Type". With a port, the outline leaves a gap where the port sits.
  function usage({ x, y, w, h, name, r = 10, gap }) {
    if (gap) {
      const [g1, g2] = [gap.y - 8, gap.y + 8];
      const d = gap.side === 'right'
        ? `M${x + w},${g2} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r}` +
          ` V${y + r} A${r},${r} 0 0 1 ${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${g1}`
        : `M${x},${g1} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r}` +
          ` V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${g2}`;
      push(`<path class="outline" d="${d}" fill="none" stroke="currentColor" stroke-width="1.25"/>`);
    } else {
      push(box(x, y, w, h, r));
    }
    push(text(x + w / 2, y + 15, '«part»', 'kw', 'middle'));
    push(text(x + w / 2, y + 30, name, 'uname', 'middle'));
  }

  // A port usage on an edge: a small rounded square with ↔, because the port carries both directions.
  function port(px, py) {
    push(`<rect class="outline accent" x="${px - 8}" y="${py - 8}" width="16" height="16" rx="2.5" fill="none" stroke="${ACCENT}" stroke-width="1.5"/>`);
    push(`<path class="accent" d="M${px - 4.5},${py} H${px + 4.5} M${px - 2},${py - 2.5} L${px - 4.5},${py} L${px - 2},${py + 2.5} M${px + 2},${py - 2.5} L${px + 4.5},${py} L${px + 2},${py + 2.5}" fill="none" stroke="${ACCENT}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`);
  }

  // A hollow triangle whose tip touches (x, y), pointing up (dir -1) or down (dir 1). Returns the base's y.
  function triangle(x, y, dir) {
    const base = y - dir * 12;
    push(`<path class="outline" d="M${x},${y} L${x - 7},${base} L${x + 7},${base} Z" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/>`);
    return base;
  }

  // "Defined by" (feature typing): a line from the usage to a hollow triangle with two dots, at the definition.
  function definedBy(x, y1, tipY) {
    const base = triangle(x, tipY, 1);
    push(hit(`M${x},${y1} V${base}`));
    push(`<line class="outline" x1="${x}" y1="${y1}" x2="${x}" y2="${base}" stroke="currentColor" stroke-width="1.25"/>`);
    push(`<circle cx="${x - 4}" cy="${base - 4}" r="1.6" fill="currentColor"/>`);
    push(`<circle cx="${x + 4}" cy="${base - 4}" r="1.6" fill="currentColor"/>`);
  }

  // ---- Where things go. Row 1: Page (columns 1-2) and the package HostFiles (column 3).
  const pageTop = 56;
  const hostsU = { x: 126, y: 116, w: 180, h: 130 };
  const appU = { x: 520, y: 116, w: 200, h: 186 };
  const portY = 172;
  const pageBottom = appU.y + appU.h + 18;

  // Row 2: the two definitions the parts are defined by.
  const row2 = 356;
  const row2H = 187;
  const hostComps = [
    { heading: 'attributes', mono: true, lines: ['toolchain : String', 'ships : String[0..1]'] },
    { heading: 'ports', mono: true, lines: ['api : ~StrongholdApp'] },
    { heading: 'parts', mono: true, lines: ['loader : Loader'] },
  ];
  const appComps = [
    { heading: 'ports', mono: true, lines: ['api : StrongholdApp'] },
    { heading: 'parts', mono: true, lines: ['shell : Shell'] },
    { heading: 'doc', lines: ['app/: Stronghold itself, built once with', 'webpack 5 and TypeScript 5.9. Nothing in it', 'knows about SharePoint.'] },
  ];
  const hostBottom = row2 + defH(hostComps, row2H);

  // The package's members, stacked.
  const pkgX = COL[2];
  const pkgTop = 56;
  const tabH = 24;
  const inX = pkgX + 16;
  const inW = CW - 32;
  const half = (inW - 12) / 2;
  const saComps = [
    { heading: 'directed features', mono: true, lines: ['in item container : HTMLElement', 'in attribute services : HostServices', 'out attribute handle : AppHandle', 'out attribute version : String'] },
    { heading: 'doc', lines: ["What the app's entry file registers on", 'window.Stronghold.'] },
  ];
  const hsComps = [{ heading: 'doc', lines: ['What a host gives the app. Empty until', 'proof step 4 adds the signed-in person', "and SharePoint's REST API."] }];
  const ldComps = [{ heading: 'doc', lines: ['load-app.ts: adds one <script> for the', 'entry file, then waits for window.Stronghold.'] }];
  const pkgDoc = ["app/src/host: the only code every host's", 'toolchain compiles, written for TypeScript 2.4.', 'Each host copies it in with prepare-shared.js.'];
  const saY = pkgTop + tabH + 16;
  const hsY = saY + defH(saComps) + 12;
  const smallY = hsY + defH(hsComps) + 12;
  const ldY = smallY + defH() + 12;
  const pkgDocTop = ldY + defH(ldComps) + 14;
  const pkgBottom = pkgDocTop + compH(pkgDoc.length);

  // Row 3: the three hosts, under a specialization tree.
  const busY = Math.max(hostBottom, pkgBottom) + 17;
  const row3 = busY + 24;
  const hostsRow = [
    { name: 'ServerHost', lines: [':>> toolchain = "SPFx 1.4.1, TypeScript 2.4, Node 8"', ':>> ships = "stronghold-server.sppkg"'], doc: ['hosts/server: the web part for SharePoint Server.'] },
    { name: 'OnlineHost', lines: [':>> toolchain = "SPFx 1.24.1, Heft, Node 22.14+"', ':>> ships = "stronghold-online.sppkg"'], doc: ['hosts/online: the web part for SharePoint', 'Online, which is also the Teams tab.'] },
    { name: 'DevHost', lines: [':>> toolchain = "tsc, Playwright"', ':>> ships[0]'], doc: ['hosts/dev: a plain page that mounts the app', 'the way the SharePoint hosts do. It never ships.'] },
  ];
  const row3H = NAME_H + compH(2) + compH(2);
  const H = row3 + row3H + 32;

  // ---- The drawing. The view is the outermost element; boxes nest the way the model's elements do.
  element(`${P}::proofStructure`, 'the view proofStructure', 'view', () => {
    push(`<rect class="outline" x="8" y="8" width="${W - 16}" height="${H - 16}" rx="12" fill="none" stroke="currentColor" stroke-width="1"/>`);
    push('<path d="M8,34 H252 A8,8 0 0 0 260,26 V8" fill="none" stroke="currentColor" stroke-width="1"/>');
    push(spans(20, 26, [['kw', '«view» '], ['frameName', 'proofStructure'], ['kw', ' : GeneralView']]));
    push(`<path d="M${W - 232},8 V26 A8,8 0 0 0 ${W - 224},34 H${W - 8}" fill="none" stroke="currentColor" stroke-width="1"/>`);
    push(text(W - 20, 26, 'expose StrongholdProof::*::**', 'mono', 'end'));

    element(`${P}::Page`, 'Page', 'part def', () => {
      push(box(COL[0], pageTop, 772, pageBottom - pageTop));
      push(text(COL[0] + 386, pageTop + 16, '«part def»', 'kw', 'middle'));
      push(text(COL[0] + 386, pageTop + 32, 'Page', 'name', 'middle'));
      push(rule(COL[0], pageTop + NAME_H, COL[0] + 772));

      element(`${P}::Page::hosts`, 'hosts, in Page', 'part', () => {
        usage({ ...hostsU, name: 'hosts : Host [1..*]', gap: { side: 'right', y: portY } });
        element(`${P}::Page::hosts.api`, 'hosts.api, in Page', 'port', () => {
          port(hostsU.x + hostsU.w, portY);
          push(text(hostsU.x + hostsU.w - 14, portY + 4, 'api : ~StrongholdApp', 'mono', 'end'));
        });
        element(`${P}::Page::hosts.loader`, 'hosts.loader, in Page', 'part', () => {
          usage({ x: 146, y: 192, w: 140, h: 40, name: 'loader : Loader', r: 8 });
        });
      });

      element(`${P}::Page::app`, 'app, in Page', 'part', () => {
        usage({ ...appU, name: 'app : App [1]', gap: { side: 'left', y: portY } });
        element(`${P}::Page::app.api`, 'app.api, in Page', 'port', () => {
          port(appU.x, portY);
          push(text(appU.x + 14, portY + 4, 'api : StrongholdApp', 'mono'));
        });
        element(`${P}::Page::app.shell`, 'app.shell, in Page', 'part', () => {
          usage({ x: 536, y: 192, w: 168, h: 96, name: 'shell : Shell', r: 8 });
          element(`${P}::Page::app.shell.hello`, 'app.shell.hello, in Page', 'part', () => {
            usage({ x: 552, y: 236, w: 136, h: 40, name: 'hello : Module', r: 7 });
          });
        });
      });

      // The interface mount, from every host's port to the one app's port.
      element(`${P}::Page::mount`, 'mount, in Page', 'interface', () => {
        const left = hostsU.x + hostsU.w + 8;
        const right = appU.x - 8;
        push(hit(`M${left},${portY} H${right}`));
        push(`<line class="outline accent" x1="${left}" y1="${portY}" x2="${right}" y2="${portY}" stroke="${ACCENT}" stroke-width="1.75"/>`);
        const mid = (left + right) / 2;
        push(text(mid, portY - 22, '«interface»', 'kw', 'middle'));
        push(text(mid, portY - 8, 'mount', 'uname', 'middle'));
        push(text(left + 6, portY + 16, '1..*', 'mono'));
        push(text(right - 6, portY + 16, '1', 'mono', 'end'));
      });
    });

    element(`${P}::Host`, 'Host', 'part def', () => {
      def({ x: COL[0], y: row2, w: CW, keyword: '«abstract part def»', name: 'Host', comps: hostComps, minH: row2H });
    });
    element(`${P}::App`, 'App', 'part def', () => {
      def({ x: COL[1], y: row2, w: CW, keyword: '«part def»', name: 'App', comps: appComps, minH: row2H });
    });
    element(`${P}::Page::hosts : Host`, 'hosts, defined by Host', 'relationship', () => {
      definedBy(216, hostsU.y + hostsU.h, row2);
    });
    element(`${P}::Page::app : App`, 'app, defined by App', 'relationship', () => {
      definedBy(620, appU.y + appU.h, row2);
    });

    element(`${P}::HostFiles`, 'HostFiles', 'package', () => {
      push(box(pkgX, pkgTop, 104, tabH));
      push(box(pkgX, pkgTop + tabH, CW, pkgBottom - pkgTop - tabH));
      push(text(pkgX + 12, pkgTop + 17, 'HostFiles', 'name'));
      element(`${P}::HostFiles::StrongholdApp`, 'StrongholdApp', 'port def', () => {
        def({ x: inX, y: saY, w: inW, keyword: '«port def»', name: 'StrongholdApp', comps: saComps });
      });
      element(`${P}::HostFiles::HostServices`, 'HostServices', 'attribute def', () => {
        def({ x: inX, y: hsY, w: inW, keyword: '«attribute def»', name: 'HostServices', comps: hsComps });
      });
      element(`${P}::HostFiles::AppHandle`, 'AppHandle', 'attribute def', () => {
        def({ x: inX, y: smallY, w: half, keyword: '«attribute def»', name: 'AppHandle' });
      });
      element(`${P}::HostFiles::HTMLElement`, 'HTMLElement', 'item def', () => {
        def({ x: inX + half + 12, y: smallY, w: half, keyword: '«item def»', name: 'HTMLElement' });
      });
      element(`${P}::HostFiles::Loader`, 'Loader', 'part def', () => {
        def({ x: inX, y: ldY, w: inW, keyword: '«part def»', name: 'Loader', comps: ldComps });
      });
      push(rule(pkgX, pkgDocTop, pkgX + CW));
      push(text(pkgX + CW / 2, pkgDocTop + 13, 'doc', 'head', 'middle'));
      pkgDoc.forEach((line, i) => push(text(pkgX + 12, pkgDocTop + HEAD_H + 11 + i * LEAD, line, 'doc')));
    });

    hostsRow.forEach((hd, i) => {
      element(`${P}::${hd.name}`, hd.name, 'part def', () => {
        def({
          x: COL[i], y: row3, w: CW, keyword: '«part def»', name: hd.name, minH: row3H,
          comps: [{ heading: 'attributes', mono: true, lines: hd.lines }, { heading: 'doc', lines: hd.doc }],
        });
      });
    });

    // Specialization, drawn as one tree: a hollow triangle at Host, a bus, and a drop to each host.
    element('ServerHost :> Host, OnlineHost :> Host, DevHost :> Host', 'the specializations of Host', 'relationship', () => {
      const base = triangle(216, hostBottom, -1);
      const d = `M216,${base} V${busY} M216,${busY} H1024 M620,${busY} V${row3} M1024,${busY} V${row3} M216,${busY} V${row3}`;
      push(hit(d));
      push(`<path class="outline" d="${d}" fill="none" stroke="currentColor" stroke-width="1.25"/>`);
    });
  });

  const label = 'SysML v2 general view of the Stronghold proof. A Page holds one or more host web parts and exactly one app; ' +
    "every host connects through its conjugated StrongholdApp port to the app's StrongholdApp port, by the interface mount. " +
    'ServerHost, OnlineHost and DevHost specialize Host, so each carries the shared loader and that port. ' +
    'StrongholdApp, HostServices, AppHandle, HTMLElement and Loader sit in the package HostFiles, the code every host compiles.';

  const head = page
    ? `<svg id="drawing" class="sysml" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}" color="#182630">\n` +
      '<title>proofStructure: a SysML v2 general view of the Stronghold proof</title>\n' +
      `<rect width="${W}" height="${H}" fill="#FFFFFF"/>`;
  return `${head}\n${out.join('\n')}\n</svg>\n`;
}

fs.writeFileSync(SVG_FILE, draw('svg'));

const html = fs.readFileSync(PAGE_FILE, 'utf8');
const a = html.indexOf(START);
const b = html.indexOf(END);
if (a < 0 || b < a) {
  console.error(`No ${START} … ${END} in ${PAGE_FILE}.`);
  process.exit(1);
}
fs.writeFileSync(PAGE_FILE, html.slice(0, a + START.length) + '\n' + draw('page') + html.slice(b));
console.log(`Drew ${path.basename(SVG_FILE)} and the drawing in ${path.basename(PAGE_FILE)}.`);
