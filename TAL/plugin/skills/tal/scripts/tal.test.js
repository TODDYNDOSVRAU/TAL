'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { ensure, isTalProject, pluginVersion } = require('./init-claude-md.js');
const { lint } = require('./memory-lint.js');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tal-test-'));
const project = (dir) => { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'package.json'), '{}'); return dir; };
const read = (d) => fs.readFileSync(path.join(d, 'CLAUDE.md'), 'utf8');

test('creates CLAUDE.md in a project, then is idempotent', () => {
  const d = project(tmp());
  assert.strictEqual(ensure(d).action, 'created');
  assert.match(read(d), /tal:begin v/);
  const before = read(d);
  assert.strictEqual(ensure(d).action, 'current');
  assert.strictEqual(read(d), before);
});

test('appends to an existing file without touching its content', () => {
  const d = project(tmp());
  fs.writeFileSync(path.join(d, 'CLAUDE.md'), '# My project\n\nKeep tabs.\n');
  assert.strictEqual(ensure(d).action, 'appended');
  const t = read(d);
  assert.ok(t.startsWith('# My project\n\nKeep tabs.\n'));
  assert.match(t, /tal:end/);
});

test('updates only the block when the version differs', () => {
  const d = project(tmp());
  fs.writeFileSync(path.join(d, 'CLAUDE.md'), 'before\n<!-- tal:begin v0.0.1 -->\nold\n<!-- tal:end -->\nafter\n');
  assert.strictEqual(ensure(d).action, 'updated');
  const t = read(d);
  assert.ok(t.startsWith('before\n'));
  assert.ok(t.trimEnd().endsWith('after'));
  assert.ok(!t.includes('\nold\n'));
  assert.ok(t.includes('tal:begin ' + pluginVersion()));
});

test('skips: not a project, home, .tal-ignore, env switch', () => {
  const plain = tmp();
  assert.match(ensure(plain).reason, /not a project/);
  assert.match(ensure(os.homedir()).reason, /home folder/);
  const ign = project(tmp());
  fs.writeFileSync(path.join(ign, '.tal-ignore'), '');
  assert.match(ensure(ign).reason, /tal-ignore/);
  process.env.TAL_NO_BOOTSTRAP = '1';
  try { assert.match(ensure(project(tmp())).reason, /TAL_NO_BOOTSTRAP/); } finally { delete process.env.TAL_NO_BOOTSTRAP; }
});

test('skips a folder that inherits the block from a parent CLAUDE.md', () => {
  const parent = tmp();
  fs.writeFileSync(path.join(parent, 'CLAUDE.md'), '# T.A.L. — Totally Accurate Labs\nhand written\n');
  const child = project(path.join(parent, 'app'));
  const r = ensure(child);
  assert.strictEqual(r.action, 'skipped');
  assert.match(r.reason, /inherited/);
  assert.strictEqual(isTalProject(child), true);
  assert.strictEqual(ensure(child, { force: true }).action, 'created');
});

test('does not touch a hand-written T.A.L. file; refuses unbalanced markers', () => {
  const d = project(tmp());
  fs.writeFileSync(path.join(d, 'CLAUDE.md'), '# Totally Accurate Labs rules\n');
  assert.match(ensure(d).reason, /hand-written/);
  const u = project(tmp());
  fs.writeFileSync(path.join(u, 'CLAUDE.md'), '<!-- tal:begin v0 -->\nno end\n');
  assert.match(ensure(u).reason, /tal:end/);
});

test('--check writes nothing', () => {
  const d = project(tmp());
  assert.strictEqual(ensure(d, { check: true }).action, 'would-created');
  assert.ok(!fs.existsSync(path.join(d, 'CLAUDE.md')));
});

test('isTalProject is false for unrelated folders', () => {
  assert.strictEqual(isTalProject(project(tmp())), false);
});

const route = (prompt) => execFileSync('node', [path.join(ROOT, 'hooks', 'route.js')], { input: JSON.stringify({ prompt }), encoding: 'utf8' }).trim();

test('router names the right references, and stays silent otherwise', () => {
  assert.match(route('corta esse vídeo e coloca legenda'), /video\.md/);
  assert.match(route('fix the bug in parser.ts'), /code\.md/);
  assert.match(route('faça engenharia reversa desse firmware'), /reverse\.md/);
  assert.match(route('crie um agente que triagem logs'), /agents\.md/);
  assert.match(route('animação com Remotion'), /motion\.md/);
  assert.match(route('muda a cor do botão'), /ui\.md/);
  assert.strictEqual(route('obrigado'), '');
  assert.strictEqual(route('/compact'), '');
  assert.strictEqual(route('oi'), '');
});

const { classify } = require(path.join(ROOT, 'hooks', 'route.js'));

// Real prompts from the session that built this plugin, plus typical tasks. Expected = domains that must fire;
// `not` = domains that must stay silent. Silent prompts expect [].
const CORPUS = [
  ['tem como fazer gurpo de skills? cada uma com seu proposito e ser usada com o assunto que mais se encaixa. (mas nao so dividir , e sim melhorar cada uma delas em um arquivo separado, assim nao gastamos tokens lendo coisas de video numa tarefa de  pesquisa.)', [], ['video', 'agents']],
  // One loose word each: must stay silent.
  ['a skill de video ficou boa?', []],
  ['qual a cor que você prefere?', []],
  ['me explica como funciona o cache do navegador', []],
  ['qual é o melhor agente de viagens?', []],
  ['vou fazer o teste amanhã', []],
  ['isso é um erro meu, desculpa', []],
  ['lembra daquela conversa?', []],
  ['entao mantenha 1 skill , e arrume o nucleo e o roteador', []],
  ['me explique melhor, qual e mais eficiente. uma que tem tudo. ou varias separadas?', []],
  ['Instalar agora', []],
  ['pode editar o settings.json', []],
  ['Sim, pode editar', []],
  ['Depois', []],
  ['com base noque voce sabe sobre a TAL oque falta aki?', []],
  ['o quanto vc acha q essa skill ensina o claude a trabalhar com essas coisas em especifica?', [], ['agents', 'code']],
  ['escolhe as mais eficientes para a ideia DA TAL', []],
  ['use 5 agentes sonnet para pesquisar o principio de cada funcionalidade', ['agents']],
  ['corta esse vídeo e coloca legenda', ['video']],
  ['normaliza o áudio desse clipe para -14 LUFS', ['video']],
  ['converte input.mov para mp4 com ffmpeg', ['video']],
  ['fix the bug in parser.ts', ['code']],
  ['o build quebrou no gradle depois do merge', ['code']],
  ['faça engenharia reversa desse firmware', ['reverse']],
  ['abre esse apk no jadx e acha a chave da API', ['reverse']],
  ['crie um agente que triagem logs', ['agents']],
  ['qual modelo usar para revisar 40 arquivos?', ['agents']],
  ['animação com Remotion', ['motion']],
  ['faz um lower third animado em motion graphics', ['motion']],
  ['muda a cor do botão', ['ui']],
  ['o layout da tela do player quebra em landscape', ['ui']],
  ['como economizar tokens nessa sessão longa?', ['tokens']],
  ['escreve a mensagem de erro quando o disco está cheio', ['voice']],
  ['confere a paleta e o logo do projeto', ['brand']],
  ['salva na memória que o deploy é na sexta', ['memory']],
  ['faz uma autocrítica do que você entregou', ['review']],
  ['cria uma skill nova para revisar PRs', ['authoring']],
  ['melhora o SKILL.md e roda os evals', ['authoring']],
  ['escreve um MCP server para o Notion', ['authoring']],
  ['esse hook não dispara', []],
  ['instala o plugin', []],
  ['qual a diferença entre skill e plugin?', ['authoring']],
  ['obrigado', []],
  ['oi', []],
  ['/compact', []],
];

test('router corpus: fires on evidence, silent on loose words', () => {
  const fails = [];
  for (const [prompt, must, not = []] of CORPUS) {
    const got = classify(prompt);
    if (!must.length && !not.length && got.length) fails.push(`${JSON.stringify(prompt)} should be silent, got ${got}`);
    for (const d of must) if (!got.includes(d)) fails.push(`${JSON.stringify(prompt)} missed ${d}, got [${got}]`);
    for (const d of not) if (got.includes(d)) fails.push(`${JSON.stringify(prompt)} wrongly fired ${d}`);
  }
  assert.deepStrictEqual(fails, []);
});

test('router lists at most three references', () => {
  const out = route('corrige o bug, refatora o código, atualiza a tela, o layout e o vídeo com ffmpeg');
  assert.ok((out.match(/references\//g) || []).length <= 3);
});

test('memory-lint: errors, orphans, duplicates', () => {
  const d = tmp();
  const mem = (n, type, desc, extra = '') => fs.writeFileSync(path.join(d, n + '.md'), `---\nname: ${n}\ndescription: ${desc}\nmetadata:\n  type: ${type}\n---\n\nbody\n${extra}`);
  mem('a-rule', 'feedback', 'never mock the database in tests', '**Why:** a mock hid a bad migration\n');
  mem('b-rule', 'feedback', 'never mock the database in integration tests', '**Why:** same\n');
  mem('orphan', 'user', 'prefers short reports');
  fs.writeFileSync(path.join(d, 'bad.md'), 'no frontmatter');
  fs.writeFileSync(path.join(d, 'MEMORY.md'), '- [A](a-rule.md) — rule\n- [B](b-rule.md) — rule\n- [Gone](gone.md) — missing\n');
  const r = lint(d);
  assert.ok(r.errors.some((e) => /missing file gone\.md/.test(e)));
  assert.ok(r.errors.some((e) => /bad\.md: no frontmatter/.test(e)));
  assert.ok(r.warnings.some((w) => /orphan\.md/.test(w)));
  assert.ok(r.warnings.some((w) => /look alike/.test(w)));
});

test('memory-lint: accents, block scalars, updated date, relative dates, secrets, dead links', () => {
  const d = tmp();
  const w = (n, front, body) => fs.writeFileSync(path.join(d, n + '.md'), `---\n${front}\n---\n\n${body}\n`);
  w('pt-a', 'name: pt-a\ndescription: não usar configuração antiga do roteador\nmetadata:\n  type: user', 'x');
  w('pt-b', 'name: pt-b\ndescription: não usar configuração antiga do roteador novo\nmetadata:\n  type: user', 'x');
  w('block', 'name: block\ndescription: >\nmetadata:\n  type: user', 'x');
  w('old', 'name: old\ndescription: old fact\nmetadata:\n  type: user\n  updated: 2020-01-01\n  valid_until: 2020-02-01', 'merge freeze starts tomorrow, see [[nowhere]]');
  w('leak', 'name: leak\ndescription: has a key\nmetadata:\n  type: reference', 'token ghp_abcdefghijklmnopqrstuvwxyz0123');
  fs.writeFileSync(path.join(d, 'MEMORY.md'), ['pt-a', 'pt-b', 'block', 'old', 'leak'].map((n) => `- [${n}](${n}.md) — hook`).join('\n') + '\n- [bare](pt-a.md)\n');
  const r = lint(d);
  assert.ok(r.warnings.some((x) => /pt-a\.md and pt-b\.md look alike/.test(x)), 'accented words must count');
  assert.ok(r.errors.some((x) => /block\.md: missing description/.test(x)));
  assert.ok(r.info.some((x) => /old\.md: not updated/.test(x)));
  assert.ok(r.warnings.some((x) => /old\.md: valid_until/.test(x)));
  assert.ok(r.warnings.some((x) => /old\.md: relative date/.test(x)));
  assert.ok(r.info.some((x) => /\[\[nowhere\]\]/.test(x)));
  assert.ok(r.warnings.some((x) => /leak\.md: looks like it contains a secret/.test(x)));
  assert.ok(r.warnings.some((x) => /is not "- \[Title\]/.test(x)), 'index line without hook');
});

test('every reference path in SKILL.md exists', () => {
  const skill = path.resolve(__dirname, '..');
  const text = fs.readFileSync(path.join(skill, 'SKILL.md'), 'utf8');
  const paths = [...text.matchAll(/`([\w./-]+\.(?:md|js))`/g)].map((m) => m[1]).filter((p) => p !== 'CLAUDE.md');
  assert.ok(paths.length >= 13, 'router table too short: ' + paths.length);
  for (const r of paths) {
    const found = [path.join(skill, r), path.join(skill, 'references', r), path.join(ROOT, r)].some((p) => fs.existsSync(p));
    assert.ok(found, 'missing ' + r);
  }
});
