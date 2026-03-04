const fs = require('fs');
const j = JSON.parse(fs.readFileSync('docs/jotform-schema.json', 'utf8'));

const APP = {
  'interviewerName (204)': '204',
  'phase (212)':           '212',
  'interviewDate (207)':   '207',
  'studentId (100)':       '100',
  'studentName (58)':      '58',
  'schoolName (186)':      '186',
  'studentClass (201)':    '201',
  'district (213)':        '213',
  'q1a (16)':  '16',  'q2a (24)': '24',  'q3a (25)': '25',
  'q4a (26)':  '26',  'q5a (211)':'211', 'q6a (209)':'209',
  'q1b (144)': '144', 'q2b (148)':'148', 'q3b (149)':'149',
  'q4b (150)': '150', 'q5b (151)':'151', 'q6b (152)':'152',
  'q1c (105)': '105', 'q2c (106)':'106', 'q3c (112)':'112',
  'q4c (116)': '116', 'q5c (120)':'120', 'q6c (124)':'124',
  'q7 (187)':  '187', 'q8 (127)': '127',
};

const qs = j.content;
console.log('=== ALIGNMENT CHECK ===\n');
let ok = 0, fail = 0;
for (const [label, qid] of Object.entries(APP)) {
  const q = qs[qid];
  if (!q) { console.log('MISSING  ' + qid.padEnd(6) + ' ' + label); fail++; continue; }
  const text = (q.text || '').replace(/\r?\n/g, ' ').slice(0, 65);
  console.log('OK       ' + qid.padEnd(6) + ' [' + q.type.replace('control_', '').padEnd(12) + '] ' + text);
  ok++;
}

console.log('\n=== IMAGE PICKER WIDGETS in schema ===');
Object.values(qs)
  .filter(q => q.type === 'control_widget' && q.widgetType === 'field' && (q.text || '').match(/Q\d/))
  .sort((a, b) => Number(a.order) - Number(b.order))
  .forEach(q => {
    const text = (q.text || '').replace(/\r?\n/g, ' ').slice(0, 65);
    console.log('  qid=' + q.qid.padEnd(6) + ' order=' + String(q.order).padEnd(4) + ' ' + text);
  });

console.log('\n=== IN SCHEMA BUT NOT MAPPED IN APP ===');
const appQids = new Set(Object.values(APP));
const structural = new Set(['control_head', 'control_pagebreak', 'control_button']);
Object.values(qs)
  .filter(q => !appQids.has(q.qid) && !structural.has(q.type))
  .sort((a, b) => Number(a.order) - Number(b.order))
  .forEach(q => {
    const text = (q.text || '').replace(/\r?\n/g, ' ').slice(0, 65);
    console.log('  qid=' + q.qid.padEnd(6) + ' [' + q.type.replace('control_', '').padEnd(12) + '] ' + text);
  });

console.log('\nResult: ' + ok + ' matched, ' + fail + ' missing from schema');
