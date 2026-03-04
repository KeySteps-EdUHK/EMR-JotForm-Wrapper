/**
 * Question text and JotForm qid mappings.
 *
 * NOTE: qid values marked TODO will be updated once the new JotForm is published.
 * The form is being redesigned from the Round I schema.
 */

export const PHASES = ['Trial', 'Pilot', 'Round I', 'Round II']

export const FEELINGS_QUESTIONS = [
  {
    key: 'q1a',
    qid: '16',   // TODO: update after new form published
    text: 'Q1a. 你嚟到童亮館嗰陣覺得點呀？',
    followUpKey: 'q1b',
    followUpQid: '144',
    followUpLabel: 'Q1b. 跟進問題',
    followUpOptions: ['係乜嘢令到你開心/唔開心？（根據幼兒上一題的回答提問）'],
    observationKey: 'q1c',
    observationQid: '105',
    observationLabel: 'Q1c. 觀察／補充記錄',
  },
  {
    key: 'q2a',
    qid: '24',
    text: 'Q2a. 你鍾唔鍾意喺童亮館同同學仔一齊玩？',
    followUpKey: 'q2b',
    followUpQid: '148',
    followUpLabel: 'Q2b. 跟進問題（請按次序提問以下兩條問題）',
    followUpOptions: ['同朋友喺呢度玩嘅時候，邊樣嘢最好玩？', '你仲想喺呢度同朋友玩啲咩新遊戲？'],
    observationKey: 'q2c',
    observationQid: '106',
    observationLabel: 'Q2c. 觀察／補充記錄',
  },
  {
    key: 'q3a',
    qid: '25',
    text: 'Q3a. 你鍾唔鍾意童亮館入面啲玩具同設施？',
    followUpKey: 'q3b',
    followUpQid: '149',
    followUpLabel: 'Q3b. 跟進問題（請按次序提問以下兩條問題）',
    followUpOptions: ['點解你鐘意/唔鐘意玩嗰個玩具/設施？', '你希望童亮館有啲咩玩？'],
    observationKey: 'q3c',
    observationQid: '112',
    observationLabel: 'Q3c. 觀察／補充記錄',
  },
  {
    key: 'q4a',
    qid: '26',
    text: 'Q4a. 你鍾唔鍾意參加童亮館嘅活動？',
    followUpKey: 'q4b',
    followUpQid: '150',
    followUpLabel: 'Q4b. 跟進問題（請按次序提問以下兩條問題）',
    followUpOptions: ['點解你鐘意/唔鐘意嗰啲活動？', '你覺得最好玩嘅活動係咩？'],
    observationKey: 'q4c',
    observationQid: '116',
    observationLabel: 'Q4c. 觀察／補充記錄',
  },
  {
    key: 'q5a',
    qid: '211',
    text: 'Q5a. 童亮館令你覺得安全嗎？',
    type: 'checkbox',
    checkboxOptions: ['安全', '不安全'],
    followUpKey: 'q5b',
    followUpQid: '151',
    followUpLabel: 'Q5b. 跟進問題',
    followUpOptions: [
      '（若幼兒回答不安全）點解令你覺得唔安全？',
      '（若幼兒回答安全）有冇啲乜嘢令你感到安全？',
    ],
    observationKey: 'q5c',
    observationQid: '120',
    observationLabel: 'Q5c. 觀察／補充記錄',
  },
  {
    key: 'q6a',
    qid: '209',
    text: 'Q6a. 童亮館嘅姑娘/老師有冇喺你需要幫手嘅時候幫你？',
    type: 'checkbox',
    checkboxOptions: ['有', '沒有'],
    followUpKey: 'q6b',
    followUpQid: '152',
    followUpLabel: 'Q6b. 跟進問題（請按次序提問以下兩條問題）',
    followUpOptions: [
      '（若幼兒回答係否定）係發生乜嘢事？/你嗰陣需要乜嘢幫助？',
      '（若幼兒回答係肯定）佢哋係點樣幫助你架？',
    ],
    observationKey: 'q6c',
    observationQid: '124',
    observationLabel: 'Q6c. 觀察／補充記錄',
  },
]

export const MEMORY_QUESTIONS = {
  q7: { qid: '187', text: 'Q7. 你記唔記得自己K2嚟過童亮館幾多次？', type: 'textbox' },
  q8: { qid: '127', text: 'Q8. 你記得自己喺度做過啲咩？', type: 'textarea' },
}

export const CLOSING_QUESTIONS = [
  '你仲想唔想再嚟童亮館？',
  '點解你想／唔想再嚟？',
  '下次嚟想做啲咩？',
  '如果可以改一樣童亮館入面嘅嘢，你會改邊樣？',
  '仲有冇啲乜嘢想同我哋分享？',
]

// Admin field qid mappings
export const ADMIN_QIDS = {
  interviewerName: '204',
  phase:           '212',
  interviewDate:   '207',
  studentId:       '100',
  studentName:     '58',
  schoolName:      '186',
  studentClass:    '201',
  district:        '213',
}

// Image block qid mappings — image PICKER widgets only (control_widget type)
// Each question set has 4 batches:
//   batch1 = scene (cols a–d, correct=a)     Q{n}.1a  (JotForm Q{n+8}.1a)
//   batch2 = staff (cols e–h, correct=e)     Q{n}.2a  (JotForm Q{n+8}.2a)
//   batch3 = set 3 (cols i–l, correct=i)     Q{n}.3a  (JotForm Q{n+8}.3a)
//   batch4 = set 4 (cols m–p, correct=m)     Q{n}.4a  (JotForm Q{n+8}.4a)
//
// Round I clone schema has 2 sets (Q9, Q10). Sets 3–8 are TODO until Round II form.
//
// Per-batch follow-up / observation qids (from Round I schema — for reference):
//   Set 1: b1 followUp=153 obs=157 | b2 followUp=155 obs=158 | b3 obs=159 | b4 obs=218
//   Set 2: b1 followUp=202 obs=163 | b2 followUp=165 obs=166 | b3 obs=169 | b4 obs=221
export const IMAGE_BLOCK_QIDS = {
  //        set:  1     2     3     4     5     6     7     8
  batch1: { 1: '35',  2: '161', 3: null, 4: null, 5: null, 6: null, 7: null, 8: null },
  batch2: { 1: '38',  2: '164', 3: null, 4: null, 5: null, 6: null, 7: null, 8: null },
  batch3: { 1: '36',  2: '167', 3: null, 4: null, 5: null, 6: null, 7: null, 8: null },
  batch4: { 1: '217', 2: '220', 3: null, 4: null, 5: null, 6: null, 7: null, 8: null },
}

// Closing section qid mappings (confirmed from Round I schema)
// Q11a (160) = closing follow-up checkbox  → maps to closingValues.asked
// Q11b (43)  = closing observation textarea → maps to closingValues.observation
export const CLOSING_QIDS = {
  followUp:    '160',
  observation: '43',
}

export const SECTION_LABELS = ['基本資料', '感受', '記憶', '圖片', '完成']
