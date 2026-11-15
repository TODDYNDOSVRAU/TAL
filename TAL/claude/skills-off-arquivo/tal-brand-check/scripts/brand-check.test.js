'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { scanText, normalize } = require('./brand-check.js');

const kinds = (t, f = 'a.kt') => scanText(t, f).map((x) => `${x.kind}:${x.color || x.font}`);

test('palette colours pass', () => {
  assert.deepStrictEqual(kinds('val a = Color(0xFF080808)\nval b = Color(0xFF7EE3EA)'), []);
});
test('retired Signal Lime is an error, in every notation', () => {
  assert.deepStrictEqual(kinds('Color(0xFFC7FF32)'), ['error:C7FF32']);
  assert.deepStrictEqual(kinds('color: #c7ff32;', 'a.css'), ['error:C7FF32']);
  assert.deepStrictEqual(kinds('<color>#FFC7FF32</color>', 'a.xml'), ['error:C7FF32']);
});
test('colour outside the palette is a warning', () => {
  assert.deepStrictEqual(kinds('Color(0xFFFF0000)'), ['warn:FF0000']);
});
test('alpha is opacity of a base colour, not a new colour', () => {
  assert.deepStrictEqual(kinds('Color(0x33080808)'), []);
  assert.deepStrictEqual(kinds('color: #F2F2F029;', 'a.css'), []);
});
test('3-digit hex expands', () => {
  assert.strictEqual(normalize('abc', 'rgba'), 'AABBCC');
});
test('font outside the three is a warning; generic and var() are ignored', () => {
  assert.deepStrictEqual(kinds("font-family: 'Roboto', sans-serif;", 'a.css'), ['warn:roboto']);
  assert.deepStrictEqual(kinds("font-family: 'Space Grotesk', Inter, sans-serif;", 'a.css'), []);
  assert.deepStrictEqual(kinds('font-family: var(--f);', 'a.css'), []);
});
