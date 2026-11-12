// Símbolo em escada: em cada caixa, a inicial grande no topo e o resto da palavra descendo,
// em Space Grotesk Bold, na perspectiva isométrica da face da frente.
const fs = require('fs');
const cp = require('child_process');
const C = { black: '#080808', white: '#F2F2F0', lime: '#C7FF32' };
const u = 60, sw = 5;
const P = (x, y, z) => [(x - y) * 0.8660254 * u, (x + y) * 0.5 * u - z * u];
const pts = list => list.map(p => P(...p).map(n => n.toFixed(2)).join(',')).join(' ');

const boxes = [{ x: 0, h: 4, word: 'TOTALLY' }, { x: 1, h: 3, word: 'ACCURATE' }, { x: 2, h: 2, word: 'LABS' }];
const TOP = 0.14, BIG = 0.5, GAP1 = 0.12, S = 0.24, G2 = 0.08;

// Uma letra em pé na face da frente (plano y = 1), centrada em a = 0.5, com a base em z.
// cap: altura da maiúscula em unidades de bloco (Space Grotesk: maiúscula ≈ 0,7 do corpo).
function letter(ch, x, zBase, cap, color) {
  const k = u / 100, size = (cap / 0.7) * 100;
  const [e, f] = P(x + 0.5, 1, zBase);
  const m = [0.8660254 * k, 0.5 * k, 0, k, e, f].map(n => n.toFixed(4)).join(' ');
  return `<text transform="matrix(${m})" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="${size.toFixed(1)}" fill="${color}">${ch}</text>`;
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
    // Inicial grande no topo da face.
    const zBig = h - TOP - BIG;
    svg += letter(word[0], x, zBig, BIG, fg);
    // O resto da palavra desce logo abaixo, em letras menores.
    [...word.slice(1)].forEach((ch, i) => {
      const zTop = zBig - GAP1 - i * (S + G2);
      svg += letter(ch, x, zTop - S, S, fg);
    });
  }
  if (accent) {
    const c = 0.5, s = 0.17, z = boxes[2].h;
    svg += `<polygon points="${pts([[2 + c - s, c - s, z], [2 + c + s, c - s, z], [2 + c + s, c + s, z], [2 + c - s, c + s, z]])}" fill="${accent}"/>`;
  }
  const all = boxes.flatMap(b => [[b.x, 0, 0], [b.x + 1, 0, 0], [b.x + 1, 1, 0], [b.x, 1, 0], [b.x, 0, b.h], [b.x + 1, 0, b.h], [b.x + 1, 1, b.h], [b.x, 1, b.h]].map(p => P(...p)));
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const minX = Math.min(...xs) - sw, minY = Math.min(...ys) - sw;
  const w = Math.max(...xs) - minX + sw, hh = Math.max(...ys) - minY + sw;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${hh.toFixed(1)}"><g transform="translate(${-minX} ${-minY})">${svg}</g></svg>`;
}

const neg = symbol({ fg: C.white, bg: C.black, accent: C.lime });
const pos = symbol({ fg: C.black, bg: C.white });
fs.writeFileSync('escada-negativo.svg', neg);
fs.writeFileSync('escada-positivo.svg', pos);

const CH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const [svg, bg, out] of [[neg, C.black, 'escada-1080-escuro.png'], [pos, C.white, 'escada-1080-claro.png']]) {
  fs.writeFileSync('_p.html', `<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:"Space Grotesk";src:url("file:///C:/dev/tarkas/app/src/main/res/font/space_grotesk.ttf");font-weight:300 700}html,body{margin:0;width:1080px;height:1080px;overflow:hidden;background:${bg}}.w{width:1080px;height:1080px;display:flex;align-items:center;justify-content:center}.w>svg{height:860px;width:auto}</style></head><body><div class="w">${svg}</div></body></html>`);
  cp.execFileSync(CH, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1080,1080', '--virtual-time-budget=4000', `--screenshot=C:/dev/TAL/logo/escada/${out}`, 'file:///C:/dev/TAL/logo/escada/_p.html'], { stdio: 'ignore' });
}
fs.unlinkSync('_p.html');
console.log('ok');
