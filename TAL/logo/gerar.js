// Gera os SVGs dos conceitos de logo T.A.L. (geometria pura, sem dependência de fonte nos conceitos B e C).
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
const C = { black: '#080808', white: '#F2F2F0', gray: '#6B6B6B', grayDark: '#8C8C8C', lime: '#C7FF32' };

// ---------- Conceito C · Matriz de pontos: as letras são feitas do mesmo ponto que separa a sigla ----------
const GLYPH = {
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
};
function dotMatrix({ fg, accent, ghost, pitch = 10, r = 3.6 }) {
  const cols = []; // [{type:'glyph',g}|{type:'period'}|{type:'gap'}]
  for (const ch of 'TAL') cols.push({ g: ch }, { gap: 1 }, { period: 1 }, { gap: 1 });
  cols.pop(); // sem espaço depois do último ponto
  let x = 0; const dots = [];
  for (const c of cols) {
    if (c.g) { GLYPH[c.g].forEach((row, j) => [...row].forEach((b, i) => dots.push({ x: x + i, y: j, on: b === '1' }))); x += 5; }
    else if (c.gap) { for (let j = 0; j < 7; j++) dots.push({ x, y: j, on: false }); x += 1; }
    else { for (let j = 0; j < 7; j++) dots.push({ x, y: j, on: j === 6, accent: j === 6 }); x += 1; }
  }
  const w = x * pitch, h = 7 * pitch;
  const body = dots.map(d => {
    const cx = (d.x + .5) * pitch, cy = (d.y + .5) * pitch;
    if (!d.on) return ghost ? `<circle cx="${cx}" cy="${cy}" r="${r * .55}" fill="${ghost}"/>` : '';
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${d.accent ? accent : fg}"/>`;
  }).join('');
  return { w, h, body };
}

// ---------- Conceito B · Camadas isométricas: ESSENTIAL, ADVANCED, ENGINEERING ----------
// Letras monolineares desenhadas na face frontal de cada bloco (coordenadas u,v de 0 a 1 dentro da face).
// A + B: a coluna de iniciais de Gerstner (T, A, L) vira a parede da frente da escada.
const LETTER = {
  T: [[[0.22, 0.78], [0.78, 0.78]], [[0.5, 0.78], [0.5, 0.2]]],
  A: [[[0.24, 0.2], [0.5, 0.8], [0.76, 0.2]], [[0.35, 0.44], [0.65, 0.44]]],
  L: [[[0.3, 0.8], [0.3, 0.2], [0.74, 0.2]]],
};

// letters: false, true (na face da frente) ou 'top' (deitadas no topo de cada bloco).
// join 'round' tira as pontas que a junção em quina cria nos cantos de 60°.
function iso({ fg, bg, accent, u = 60, sw = 5, letters = false, lw, join = 'miter', letterColor }) {
  const P = (x, y, z) => [(x - y) * 0.8660254 * u, (x + y) * 0.5 * u - z * u];
  const poly = pts => pts.map(p => P(...p).map(n => n.toFixed(2)).join(',')).join(' ');
  // caixas da mais funda (alta, ENGINEERING) para a da frente (baixa, ESSENTIAL)
  const boxes = [{ x: 0, y: 0, h: 3 }, { x: 1, y: 0, h: 2 }, { x: 2, y: 0, h: 1 }];
  let svg = '';
  for (const b of boxes) {
    const { x, y, h } = b;
    const faces = [
      [[x, y, h], [x + 1, y, h], [x + 1, y + 1, h], [x, y + 1, h]],
      [[x + 1, y, 0], [x + 1, y + 1, 0], [x + 1, y + 1, h], [x + 1, y, h]],
      [[x, y + 1, 0], [x + 1, y + 1, 0], [x + 1, y + 1, h], [x, y + 1, h]],
    ];
    svg += faces.map(f => `<polygon points="${poly(f)}" fill="${bg}" stroke="${fg}" stroke-width="${sw}" stroke-linejoin="${join}"/>`).join('');
    if (letters === 'top') {
      // Deitada no topo (z = h): a leitura corre no sentido -y e o alto da letra aponta para -x,
      // numa caixa de 0,84 × 0,84 centrada no topo.
      const ch = 'TAL'[x];
      const toTop = ([a, v]) => [x + 0.92 - v * 0.84, y + 0.92 - a * 0.84, h];
      svg += LETTER[ch].map(stroke => `<polyline points="${poly(stroke.map(toTop))}" fill="none" stroke="${letterColor || fg}" stroke-width="${lw || sw}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    } else if (letters) {
      // cada letra ocupa a unidade de cima da face frontal: T no alto, A no meio, L embaixo — a escada lê T·A·L
      const ch = 'TAL'[x];
      const zoff = h - 1;
      svg += LETTER[ch].map(stroke => `<polyline points="${poly(stroke.map(([a, v]) => [x + a, y + 1, zoff + v]))}" fill="none" stroke="${fg}" stroke-width="${lw || sw}" stroke-linecap="square" stroke-linejoin="miter"/>`).join('');
    }
  }
  // sinal: pequeno quadrado no topo da caixa da frente
  if (accent) {
    const c = 0.5, s = 0.17, z = 1;
    svg += `<polygon points="${poly([[2 + c - s, c - s, z], [2 + c + s, c - s, z], [2 + c + s, c + s, z], [2 + c - s, c + s, z]])}" fill="${accent}"/>`;
  }
  // caixa delimitadora
  const all = boxes.flatMap(b => [[b.x, b.y, 0], [b.x + 1, b.y, 0], [b.x + 1, b.y + 1, 0], [b.x, b.y + 1, 0], [b.x, b.y, b.h], [b.x + 1, b.y, b.h], [b.x + 1, b.y + 1, b.h], [b.x, b.y + 1, b.h]].map(p => P(...p)));
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const m = sw;
  const minX = Math.min(...xs) - m, minY = Math.min(...ys) - m;
  return { w: Math.max(...xs) - minX + m, h: Math.max(...ys) - minY + m, body: `<g transform="translate(${-minX} ${-minY})">${svg}</g>` };
}

const wrap = (g, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.w.toFixed(1)} ${g.h.toFixed(1)}" width="${g.w.toFixed(0)}" height="${g.h.toFixed(0)}">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}${g.body}</svg>`;

const files = {
  'C-matriz-negativo.svg': wrap(dotMatrix({ fg: C.white, accent: C.lime, ghost: 'rgba(242,242,240,.10)' })),
  'C-matriz-positivo.svg': wrap(dotMatrix({ fg: C.black, accent: C.black, ghost: 'rgba(8,8,8,.08)' })),
  'C-matriz-limpo-negativo.svg': wrap(dotMatrix({ fg: C.white, accent: C.lime })),
  'B-camadas-negativo.svg': wrap(iso({ fg: C.white, bg: C.black, accent: C.lime })),
  'B-camadas-positivo.svg': wrap(iso({ fg: C.black, bg: C.white })),
  'AB-simbolo-negativo.svg': wrap(iso({ fg: C.white, bg: C.black, accent: C.lime, letters: true, lw: 4.5 })),
  'AB-simbolo-positivo.svg': wrap(iso({ fg: C.black, bg: C.white, letters: true, lw: 4.5 })),
  'AB-simbolo-mono.svg': wrap(iso({ fg: C.gray, bg: C.white, letters: true, lw: 4.5 })),
  // Versão com as iniciais deitadas no topo, quinas arredondadas e sem o sinal lime.
  'AB-topo-negativo.svg': wrap(iso({ fg: C.white, bg: C.black, letters: 'top', lw: 4.5, join: 'round' })),
  'AB-topo-positivo.svg': wrap(iso({ fg: C.black, bg: C.white, letters: 'top', lw: 4.5, join: 'round' })),
  'AB-topo-mono.svg': wrap(iso({ fg: C.gray, bg: C.white, letters: 'top', lw: 4.5, join: 'round' })),
  // Iniciais no azul do T.A.R.K.A.S.: gelo no escuro, verde-água escuro no claro (4,5:1 ou mais).
  'AB-topo-azul-negativo.svg': wrap(iso({ fg: C.white, bg: C.black, letters: 'top', lw: 4.5, join: 'round', letterColor: '#7EE3EA' })),
  'AB-topo-azul-positivo.svg': wrap(iso({ fg: C.black, bg: C.white, letters: 'top', lw: 4.5, join: 'round', letterColor: '#0D6C74' })),
};
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(OUT, n), s);
console.log(Object.keys(files).join('\n'));
