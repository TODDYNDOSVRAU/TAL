#!/usr/bin/env node
// UserPromptSubmit: detect the kind of task and tell the model which T.A.L. reference to read.
// A domain fires only with evidence: one strong signal (a tool name, a file type, a verb + object),
// or two different weak words. Single loose words ("video", "skill", "tokens") stay silent.
// Silent when nothing fires, so unrelated prompts cost no tokens.
'use strict';

// JavaScript's \b ignores accented letters ("áudio", "código"), so use a Unicode-aware boundary.
const B = '(?:(?<=[\\p{L}\\p{N}_])(?![\\p{L}\\p{N}_])|(?<![\\p{L}\\p{N}_])(?=[\\p{L}\\p{N}_]))';
const W = (s) => new RegExp(s.split('\\b').join(B), 'iu');
// [domain, strong signals (2 points each), weak signals (1 point each)]
const RULES = [
  ['video',
    [W('\\bffmpeg\\b|\\bffprobe\\b'), W('\\.(mp4|mov|mkv|webm|m4a|wav)\\b'), W('\\bb-?roll\\b|color ?grad|\\bloudnorm\\b|\\blufs\\b'),
      W('\\b(cort|edit|render|export|legend|junt|mont|comprim|recort)\\w*\\s+(\\S+\\s+){0,2}v[ií]deos?\\b'),
      W('\\bv[ií]deos?\\s+(\\S+\\s+){0,2}(cort|edit|legend|export|render)'), W('\\b(cut|edit|trim|caption|export|render)\\w*\\s+(\\S+\\s+){0,2}(video|clip|footage)')],
    [W('\\bv[ií]deos?\\b'), W('\\blegendas?\\b|\\bcaptions?\\b|\\bsubtitles?\\b'), W('\\breels?\\b|\\bshorts\\b'), W('\\bfootage\\b|\\bclipes?\\b|\\bclips?\\b'), W('\\bcodec\\b'), W('\\b[aá]udio\\b')]],
  ['motion',
    [W('\\bremotion\\b|\\bmanim\\b|motion canvas|\\blottie\\b|after effects'), W('motion ?graphics?|motion design'), W('lower[- ]third|kinetic typ'), W('anima[cç][aã]o em c[oó]digo')],
    [W('\\banima[cç][aã]o\\b|\\banimation\\b'), W('\\bkeyframes?\\b'), W('title card|\\bvinheta\\b')]],
  ['reverse',
    [W('engenharia reversa|reverse[- ]engineer'), W('decompil|disassembl|desassembl'), W('\\bghidra\\b|\\bbinwalk\\b|\\bjadx\\b|\\bfrida\\b|\\bapktool\\b|\\bradare2?\\b|\\brizin\\b|\\bida pro\\b'),
      W('dump (da|de|do|of the) (flash|nand|firmware|rom)'), W('\\buart\\b|\\bjtag\\b')],
    [W('\\bfirmware\\b'), W('\\bbootloader\\b|u-?boot'), W('\\.apk\\b|\\.elf\\b|\\.bin\\b'), W('\\bnand\\b|\\bmtd\\b|\\bubi(fs)?\\b'), W('bin[aá]rio|binary'), W('protocolo|protocol|formato propriet')]],
  ['ui',
    [W('\\bui\\b|\\bux\\b'), W('jetpack compose|\\bcomposable\\b|tailwind|\\bfigma\\b|\\bcss\\b|swiftui'), W('tipografia|typography'), W('\\b(tela|screen) (de|do|da|of)\\b')],
    [W('\\binterface\\b'), W('\\btelas?\\b|\\bscreens?\\b'), W('\\blayout\\b'), W('\\bdesign\\b'), W('\\bbot[aãõo]es\\b|\\bbot[aã]o\\b|\\bbuttons?\\b'), W('\\btema\\b|\\btheme\\b'),
      W('\\bcor(es)?\\b|\\bcolou?rs?\\b'), W('\\bfontes?\\b|\\bfonts?\\b'), W('\\bgestos?\\b|\\bgestures?\\b|\\bswipe\\b|\\barrast'), W('\\bcomponentes?\\b|\\bcomponents?\\b'), W('\\banima[cç][aã]o\\b|\\banimation\\b|\\bmola\\b|\\bspring\\b')]],
  ['agents',
    [W('\\bsub-?agent'), W('multi-?agent'), W('\\.claude/agents'), W('\\b(cri|fa[zç]|us[aeo]|mont|lanc|lanç|dispar|spawn|create|build|use)\\w*\\s+(\\S+\\s+){0,2}agent(e|es|s)?\\b'),
      W('\\bagent(e|es|s)?\\s+(sonnet|haiku|opus|fable)\\b'), W('qual modelo (usar|para|devo)|which model (to|should)')],
    [W('\\bagent(e|es|s)?\\b'), W('\\bworkflows?\\b|orquestr|orchestrat'), W('\\bparalel|\\bparallel'), W('\\bsonnet\\b|\\bhaiku\\b|\\bopus\\b|\\bfable\\b')]],
  ['tokens',
    [W('janela de contexto|context window'), W('prompt cach'), W('\\b(economi|gast|reduz|cort|sav|cut|spend)\\w*\\s+(\\S+\\s+){0,2}tokens?\\b'), W('\\btokens? (de entrada|de sa[ií]da|input|output)'), W('custo (d[aeo] |por )(api|token|sess|turno)')],
    [W('\\btokens?\\b'), W('\\bcache\\b'), W('\\bcompact'), W('\\bcusto\\b|\\bcost\\b|\\bpre[cç]o\\b|\\bpricing\\b')]],
  ['memory',
    [W('MEMORY\\.md|auto ?memory'), W('mem[oó]ria (do claude|persistente|de longo prazo)|long-term memory'), W('lembr[ae]-?se (de|que)|remember (that|this)'), W('(salv|grav|guard)\\w*\\s+(\\S+\\s+){0,2}mem[oó]ria')],
    [W('\\bmem[oó]rias?\\b|\\bmemory\\b'), W('\\blembr'), W('\\besque[cç]')]],
  ['review',
    [W('autocr[ií]tica|self-?review|self-?critique|autocorre'), W('code review'), W('(revis|confer|verific|review)\\w*\\s+(\\S+\\s+){0,2}(c[oó]digo|trabalho|diff|pr|mudan[cç]|implementa|resposta|work|change)'), W('est[aá] pronto\\?|ficou pronto|is it done')],
    [W('\\brevis|\\breview'), W('\\bverific|\\bverify'), W('\\bconfer[ei]')]],
  ['voice',
    [W('mensage(m|ns) de erro|error messages?'), W('microcopy|ux copy|release notes'), W('texto d[aoe]s? (app|tela|bot[aã]o|interface|aviso|notifica)'), W('nome d[aoe]s? (produto|app|recurso)')],
    [W('\\bslogan\\b|\\bassinatura\\b'), W('\\btextos?\\b|\\bcopy\\b'), W('\\btradu[cz]|\\btranslat'), W('\\bfrases?\\b|\\bwording\\b')]],
  ['brand',
    [W('\\bpaleta\\b|\\bpalette\\b'), W('identidade visual|brand identity'), W('\\blogo(tipo|marca)?\\b'), W('signal lime|#c7ff32|brand-?check')],
    [W('\\bmarca\\b|\\bbrand\\b'), W('\\bcor(es)?\\b|\\bcolou?rs?\\b'), W('\\bfontes?\\b|\\bfonts?\\b'), W('\\bidentidade\\b')]],
  ['authoring',
    [W('SKILL\\.md|skill-creator|plugin\\.json|marketplace\\.json'), W('\\bmcp server|servidor mcp|\\bmcp-builder'),
      W('\\b(cri|fa[zç]|escrev|melhor|ajust|test|avali|cre|writ|build|improv)\\w*\\s+(\\S+\\s+){0,2}(skills?|plugins?|hooks?)\\b'),
      W('\\bevals? (da|de|do|of|for|the)\\b|\\bbenchmark de skill')],
    [W('\\bskills?\\b'), W('\\bplugins?\\b'), W('\\bhooks?\\b'), W('\\bmcp\\b'), W('\\bevals?\\b')]],
  ['code',
    [W('\\.(kt|kts|py|ts|tsx|js|jsx|mjs|java|rs|go|cpp|cc|c|h|cs|swift|rb|php|sql|sh)\\b'), W('\\bgradle\\b|\\bkotlin\\b|typescript|javascript|\\bpython\\b|\\brust\\b|\\bnpm\\b'),
      W('\\bbug\\b|stack ?trace|\\bexception\\b|\\bcrash'), W('refator|refactor'), W('pull request|\\bcommit\\b|\\bmerge\\b'), W('n[aã]o compila|build (fail|quebr)|\\bcompile error|falha no build'),
      W('(test|teste)s? (unit|de unidade|instrumentad)|unit tests?')],
    [W('c[oó]digo|\\bcode\\b'), W('implement'), W('\\berros?\\b|\\berrors?\\b'), W('fun[cç][aãõo]|\\bfunctions?\\b'), W('\\btestes?\\b|\\btests?\\b'), W('\\bbuild\\b'), W('\\bapi\\b'),
      W('\\bcorrig|\\bconsert|\\bfix\\b'), W('\\bdeploy'), W('banco de dados|database'), W('\\bscripts?\\b')]],
];

function classify(prompt) {
  const text = String(prompt || '').trim();
  if (text.length < 4 || text.startsWith('/')) return [];
  const scored = [];
  for (const [domain, strong, weak] of RULES) {
    const s = strong.filter((re) => re.test(text)).length;
    const w = weak.filter((re) => re.test(text)).length;
    const score = 2 * s + w;
    if (score >= 2) scored.push({ domain, score, strong: s });
  }
  // Highest evidence first; ties keep table order. At most three.
  return scored.sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.domain);
}

function message(domains) {
  if (!domains.length) return '';
  const refs = domains.map((k) => `references/${k}.md`).join(', ');
  return `T.A.L.: invoke the \`tal\` skill and read ${refs}. Verify before saying it is done.`;
}

module.exports = { classify, message, RULES };

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let prompt = '';
    try { prompt = String(JSON.parse(raw).prompt || ''); } catch { return; }
    const out = message(classify(prompt));
    if (out) console.log(out);
  });
}
