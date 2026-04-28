/**
 * JotForm qid mappings and question structure only.
 * All display text lives in src/i18n/translations.json.
 */

export const PHASES = ['Trial', 'Pilot', 'Round I', 'Round II']

// feelings: type 'emoji' | 'checkbox'
// checkboxOptions keyed as checkboxOptions (array of {zh,en})
export const FEELINGS_QUESTIONS = [
  {
    key: 'q1a', qid: '16',
    type: 'emoji',
    followUpKey: 'q1b', followUpQid: '144',
    observationKey: 'q1c', observationQid: '105',
  },
  {
    key: 'q2a', qid: '24',
    type: 'emoji',
    followUpKey: 'q2b', followUpQid: '148',
    observationKey: 'q2c', observationQid: '106',
  },
  {
    key: 'q3a', qid: '25',
    type: 'emoji',
    followUpKey: 'q3b', followUpQid: '149',
    observationKey: 'q3c', observationQid: '112',
  },
  {
    key: 'q4a', qid: '26',
    type: 'emoji',
    followUpKey: 'q4b', followUpQid: '150',
    observationKey: 'q4c', observationQid: '116',
  },
  {
    key: 'q5a', qid: '211',
    type: 'checkbox',
    followUpKey: 'q5b', followUpQid: '151',
    observationKey: 'q5c', observationQid: '120',
  },
  {
    key: 'q6a', qid: '209',
    type: 'checkbox',
    followUpKey: 'q6b', followUpQid: '152',
    observationKey: 'q6c', observationQid: '124',
  },
]

export const MEMORY_QUESTIONS = {
  q7: { qid: '187', type: 'textbox' },
  q8: { qid: '127', type: 'textarea' },
}

// Closing question keys (matched to translations: closing.q1…q5)
export const CLOSING_QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5']

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

// District: CSV stores English names; JotForm dropdown expects Chinese
export const DISTRICT_MAP = {
  'Kowloon City': '九龍城',
  'Shatin':       '沙田',
  'Sham Shui Po': '深水埗',
  'Yuen Long':    '元朗',
  'Tuen Mun':     '屯門',
}

// Image block qid mappings — textbox fields storing image selection result (a–p or 9999)
export const IMAGE_BLOCK_QIDS = {
  //        set:  1      2      3     4     5     6     7     8
  batch1: { 1: '226', 2: '229', 3: null, 4: null, 5: null, 6: null, 7: null, 8: null },
  batch2: { 1: '225', 2: '230', 3: null, 4: null, 5: null, 6: null, 7: null, 8: null },
  batch3: { 1: '227', 2: '231', 3: null, 4: null, 5: null, 6: null, 7: null, 8: null },
  batch4: { 1: '228', 2: '232', 3: null, 4: null, 5: null, 6: null, 7: null, 8: null },
}

// Per-batch follow-up checkbox + observation textarea qids
export const IMAGE_BLOCK_BATCH_QIDS = {
  1: { b1FollowUp: '153', b1Obs: '157', b2FollowUp: '155', b2Obs: '158', b3Obs: '159', b4Obs: '218' },
  2: { b1FollowUp: '202', b1Obs: '163', b2FollowUp: '165', b2Obs: '166', b3Obs: '169', b4Obs: '221' },
  3: null, 4: null, 5: null, 6: null, 7: null, 8: null,
}

// Closing section qid mappings
export const CLOSING_QIDS = {
  followUp:    '160',
  observation: '43',
}
