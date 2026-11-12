// Símbolo de blocos com a inicial deitada no topo de cada caixa (T, A, L) e o resto da palavra
// descendo pela face da frente: OTALLY, CCURATE, ABS. Letras em Space Grotesk Bold, na
// perspectiva isométrica de cada face.
const fs = require('fs');
const cp = require('child_process');
const C = { black: '#080808', white: '#F2F2F0', lime: '#C7FF32' };
const u = 60, sw = 5, k = u / 100;
const P = (x, y, z) => [(x - y) * 0.8660254 * u, (x + y) * 0.5 * u - z * u];
const pts = list => list.map(p => P(...p).map(n => n.toFixed(2)).join(',')).join(' ');
const boxes = [{ x: 0, h: 3, word: 'TOTALLY' }, { x: 1, h: 2, word: 'ACCURATE' }, { x: 2, h: 1, word: 'LABS' }];
const TOPCAP = 0.6, CAP = 0.2, GAP = 0.06, MARGIN = 0.1;
const sizeOf = cap => ((cap / 0.7) * 100).toFixed(1); // maiúscula da Space Grotesk ≈ 0,7 do corpo

const text = (ch, matrix, size, color) =>
  `<text transform="matrix(${matrix.map(n => n.toFixed(4)).join(' ')})" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="${size}" fill="${color}">${ch}</text>`;

// No topo (z = h): a linha de base corre no sentido -y (sobe para a direita) e o alto da letra aponta para -x.
function onTop(ch, x, h, color) {
  const [e, f] = P(x + 0.5 + TOPCAP / 2, 0.5, h);
  return text(ch, [0.8660254 * k, -0.5 * k, 0.8660254 * k, 0.5 * k, e, f], sizeOf(TOPCAP), color);
}
// Na face da frente (y = 1): a letra fica em pé, centrada na largura da face, com a base em z.
function onFront(ch, x, zBase, color) {
  const [e, f] = P(x + 0.5, 1, zBase);
  return text(ch, [0.8660254 * k, 0.5 * k, 0, k, e, f], sizeOf(CAP), color);
}

function symbol({ fg, bg, accent }) {
  let svg = '';
  for (const { x, h, word } of boxes) {
    const faces = [
      [[x, 0, h], [x + 1, 0, h], [x + 1, 1, h], [x, 1, h]],
      [[x + 1, 0, 0], [x + 1, 1, 0], [x + 1, 1, h], [x + 1, 0, h]],
      [[x, 1, 0], [x + 1, 1, 0], [x + 1, 1, h], [x, 1, h]],
    ];
    svg += faces.map(f => `<polygon points="${pts(f)}" fill="${bg}" stroke="${fg}" stroke-width="${sw}" stroke-linejoin="miter"/>`).join('');
    // O sinal fica sob a inicial do bloco da frente, como no esboço.
    if (accent && x === 2) {
      const c = 0.5, s = 0.17;
      svg += `<polygon points="${pts([[2 + c - s, c - s, h], [2 + c + s, c - s, h], [2 + c + s, c + s, h], [2 + c - s, c + s, h]])}" fill="${accent}"/>`;
    }
    svg += onTop(word[0], x, h, fg);
    [...word.slice(1)].forEach((ch, i) => {
      const zTop = h - MARGIN - i * (CAP + GAP);
      svg += onFront(ch, x, zTop - CAP, fg);
    });
  }
  const all = boxes.flatMap(b => [[b.x, 0, 0], [b.x + 1, 0, 0], [b.x + 1, 1, 0], [b.x, 1, 0], [b.x, 0, b.h], [b.x + 1, 0, b.h], [b.x + 1, 1, b.h], [b.x, 1, b.h]].map(p => P(...p)));
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const minX = Math.min(...xs) - sw, minY = Math.min(...ys) - sw;
  const w = Math.max(...xs) - minX + sw, hh = Math.max(...ys) - minY + sw;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${hh.toFixed(1)}"><g transform="translate(${-minX} ${-minY})">${svg}</g></svg>`;
}

const neg = symbol({ fg: C.white, bg: C.black, accent: C.lime });
const pos = symbol({ fg: C.black, bg: C.white });
fs.writeFileSync('topo-negativo.svg', neg);
fs.writeFileSync('topo-positivo.svg', pos);

const page = (svg, bg, ink) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Space Grotesk";src:url("file:///C:/dev/tarkas/app/src/main/res/font/space_grotesk.ttf");font-weight:300 700}
html,body{margin:0;width:2000px;height:2000px;overflow:hidden;background:${bg}}
.w{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.w>svg{width:820px;height:auto;display:block}
.n{margin-top:150px;font:500 74px/1 "Space Grotesk";letter-spacing:.34em;margin-right:-.34em;color:${ink};white-space:nowrap}
</style></head><body><div class="w">${svg}<div class="n">TOTALLY ACCURATE LABS</div></div></body></html>`;
const CH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const [svg, bg, ink, out] of [[neg, C.black, C.white, 'topo-2000-escuro.png'], [pos, C.white, C.black, 'topo-2000-claro.png']]) {
  fs.writeFileSync('_p.html', page(svg, bg, ink));
  cp.execFileSync(CH, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=2000,2000', '--virtual-time-budget=6000', `--screenshot=C:/dev/TAL/logo/industry/${out}`, 'file:///C:/dev/TAL/logo/industry/_p.html'], { stdio: 'ignore' });
}
fs.unlinkSync('_p.html');
console.log('ok');
