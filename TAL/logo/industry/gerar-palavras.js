// Símbolo de blocos com uma palavra na face da frente de cada bloco:
// TOTALLY no mais alto, ACCURATE no médio, LABS no menor. A palavra corre de baixo para cima,
// na mesma perspectiva isométrica da face.
const fs = require('fs');
const C = { black: '#080808', white: '#F2F2F0', lime: '#C7FF32' };
const u = 60, sw = 5;
const P = (x, y, z) => [(x - y) * 0.8660254 * u, (x + y) * 0.5 * u - z * u];
const poly = pts => pts.map(p => P(...p).map(n => n.toFixed(2)).join(',')).join(' ');
const boxes = [{ x: 0, h: 3, word: 'TOTALLY' }, { x: 1, h: 2, word: 'ACCURATE' }, { x: 2, h: 1, word: 'LABS' }];
const FONT = 28; // em em unidades locais; 100 unidades = largura de um bloco

function symbol({ fg, bg, accent }) {
  let svg = '';
  for (const { x, h, word } of boxes) {
    const y = 0;
    const faces = [
      [[x, y, h], [x + 1, y, h], [x + 1, y + 1, h], [x, y + 1, h]],
      [[x + 1, y, 0], [x + 1, y + 1, 0], [x + 1, y + 1, h], [x + 1, y, h]],
      [[x, y + 1, 0], [x + 1, y + 1, 0], [x + 1, y + 1, h], [x, y + 1, h]],
    ];
    svg += faces.map(f => `<polygon points="${poly(f)}" fill="${bg}" stroke="${fg}" stroke-width="${sw}" stroke-linejoin="miter"/>`).join('');
    // Texto na face y = 1: a linha de base sobe pelo eixo z; o "alto" das letras aponta para -x.
    const k = u / 100;
    const [e, f] = P(x + 0.6, y + 1, 0.1);
    const m = [0, -k, 0.8660254 * k, 0.5 * k, e, f].map(n => n.toFixed(4)).join(' ');
    svg += `<text transform="matrix(${m})" font-family="Space Grotesk" font-weight="700" font-size="${FONT}" letter-spacing="2" fill="${fg}">${word}</text>`;
  }
  if (accent) {
    const c = 0.5, s = 0.17;
    svg += `<polygon points="${poly([[2 + c - s, c - s, 1], [2 + c + s, c - s, 1], [2 + c + s, c + s, 1], [2 + c - s, c + s, 1]])}" fill="${accent}"/>`;
  }
  const all = boxes.flatMap(b => [[b.x, 0, 0], [b.x + 1, 0, 0], [b.x + 1, 1, 0], [b.x, 1, 0], [b.x, 0, b.h], [b.x + 1, 0, b.h], [b.x + 1, 1, b.h], [b.x, 1, b.h]].map(p => P(...p)));
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const minX = Math.min(...xs) - sw, minY = Math.min(...ys) - sw;
  const w = Math.max(...xs) - minX + sw, hh = Math.max(...ys) - minY + sw;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${hh.toFixed(1)}"><g transform="translate(${-minX} ${-minY})">${svg}</g></svg>`;
}

fs.writeFileSync('palavras-negativo.svg', symbol({ fg: C.white, bg: C.black, accent: C.lime }));
fs.writeFileSync('palavras-positivo.svg', symbol({ fg: C.black, bg: C.white }));

const fontFaces = `@font-face{font-family:"Space Grotesk";src:url("file:///C:/dev/tarkas/app/src/main/res/font/space_grotesk.ttf");font-weight:300 700}`;
const page = (svg, bg, ink) => `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces}
html,body{margin:0;width:2000px;height:2000px;overflow:hidden;background:${bg}}
.w{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.w>svg{width:820px;height:auto;display:block}
.n{margin-top:150px;font:500 74px/1 "Space Grotesk";letter-spacing:.34em;margin-right:-.34em;color:${ink};white-space:nowrap}
</style></head><body><div class="w">${svg}<div class="n">TOTALLY ACCURATE LABS</div></div></body></html>`;
fs.writeFileSync('_neg.html', page(fs.readFileSync('palavras-negativo.svg', 'utf8'), C.black, C.white));
fs.writeFileSync('_pos.html', page(fs.readFileSync('palavras-positivo.svg', 'utf8'), C.white, C.black));
const cp = require('child_process');
const CH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const [f, out] of [['_neg.html', 'palavras-2000-escuro.png'], ['_pos.html', 'palavras-2000-claro.png']]) {
  cp.execFileSync(CH, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=2000,2000', '--virtual-time-budget=6000', `--screenshot=C:/dev/TAL/logo/industry/${out}`, `file:///C:/dev/TAL/logo/industry/${f}`], { stdio: 'ignore' });
  fs.unlinkSync(f);
}
console.log('ok');
