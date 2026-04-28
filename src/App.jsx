import { useState, useEffect } from 'react'
import ProgressBar from './components/ProgressBar'
import StudentLookup from './components/StudentLookup'
import AdminFields from './components/AdminFields'
import EmojiRating from './components/EmojiRating'
import FollowUpCheckbox from './components/FollowUpCheckbox'
import ObservationBox from './components/ObservationBox'
import ImageBlock from './components/ImageBlock'
import LanguageToggle from './components/LanguageToggle'
import { FEELINGS_QUESTIONS, MEMORY_QUESTIONS, CLOSING_QUESTION_KEYS, ADMIN_QIDS, IMAGE_BLOCK_QIDS, IMAGE_BLOCK_BATCH_QIDS, CLOSING_QIDS, DISTRICT_MAP } from './constants/questions'
import { useClassConfig } from './hooks/useClassConfig'
import { submitToJotform } from './lib/jotform'
import { saveToSupabase } from './lib/supabase'
import { useLanguage } from './i18n/LanguageContext'

// Section indices: 0=student  1=admin(page)  2=feelings  3=memory  4=images  5=done
const DONE = 5
// DOM ids for the three scrollable survey sections (admin is a separate page now)
const SECTION_IDS = ['section-2', 'section-3', 'section-4']

export default function App() {
  const [section, setSection]               = useState(0)
  const [student, setStudent]               = useState(null)
  const [config, setConfig]                 = useState(null)
  const [schoolClasses, setSchoolClasses]   = useState([])
  const [surveyReady, setSurveyReady]       = useState(false)  // false | 'loading' | true
  const [adminTouched, setAdminTouched]     = useState(false)  // triggers red highlights
  const [adminValues, setAdminValues]       = useState({})
  const [feelingsValues, setFeelingsValues] = useState({})
  const [memoryValues, setMemoryValues]     = useState({})
  const [imageValues, setImageValues]       = useState({})
  const [closingValues, setClosingValues]   = useState({ asked: [], observation: '' })
  const [submitState, setSubmitState]       = useState(null) // null | 'loading' | 'success' | 'error'
  const [submitError, setSubmitError]       = useState(null)

  const { getConfig } = useClassConfig()
  const { t } = useLanguage()

  // Derived translated section labels (only used locally — ProgressBar receives them as prop)
  const sectionLabels = [
    t('adminFields.sectionTitle'),
    t('feelings.partTitle'),
    t('memory.partTitle'),
    t('images.partTitle'),
    t('done.title'),
  ]

  // ── Scroll-based progress detection ──────────────────────────────────────
  // Only active once the survey is revealed (surveyReady === true).
  // Starts counting from section 2 to match the new section numbering.
  useEffect(() => {
    if (!student || surveyReady !== true) return

    const onScroll = () => {
      const threshold = window.innerHeight * 0.4
      let active = 2
      for (let i = 0; i < SECTION_IDS.length; i++) {
        const el = document.getElementById(SECTION_IDS[i])
        if (el && el.getBoundingClientRect().top <= threshold) active = i + 2
      }
      setSection(s => s === DONE ? s : active)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [!!student, surveyReady]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleStudentResolved({ student, config, schoolClasses }) {
    setStudent(student)
    setConfig(config)
    setSchoolClasses(schoolClasses ?? [])
    setAdminValues({
      studentNameOverride: student.studentName ?? '',
      interviewDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD for <input type="date">
    })
    setSurveyReady(false)
    setAdminTouched(false)
    setSection(1)
  }

  async function handleClassChange(newClassId) {
    const newConfig = await getConfig(newClassId)
    setConfig(newConfig)
  }

  async function handleContinue() {
    if (!adminReady) {
      setAdminTouched(true)
      return
    }

    setSurveyReady('loading')

    // Re-fetch config for the active class (handles dropdown override)
    const activeClassId = adminValues.classIdOverride || student.classId
    const freshConfig = await getConfig(activeClassId)
    if (freshConfig) setConfig(freshConfig)

    // Minimum 1-second loading screen so the transition feels intentional
    await new Promise(r => setTimeout(r, 1000))

    setSurveyReady(true)
    setSection(2)
    // Scroll to top after the survey renders
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  function setImageBlockValue(blockIndex, key, value) {
    setImageValues(prev => ({
      ...prev,
      [blockIndex]: { ...(prev[blockIndex] ?? {}), [key]: value },
    }))
  }

  async function handleSubmit() {
    setSubmitState('loading')
    setSubmitError(null)

    const answers = {}

    answers[ADMIN_QIDS.interviewerName] = adminValues.interviewerName ?? ''
    answers[ADMIN_QIDS.phase]           = adminValues.phase ?? ''
    answers[ADMIN_QIDS.interviewDate]   = adminValues.interviewDate ?? ''
    answers[ADMIN_QIDS.studentId]       = student.studentId
    answers[ADMIN_QIDS.studentName]     = adminValues.studentNameOverride || student.studentName
    answers[ADMIN_QIDS.schoolName]      = student.schoolName
    answers[ADMIN_QIDS.studentClass]    = adminValues.classIdOverride || student.classId
    answers[ADMIN_QIDS.district]        = DISTRICT_MAP[student.district] ?? student.district

    // Helpers for JotForm field types:
    //   val()  → string  (radio, textbox, textarea, image widget)
    //   arr()  → Array   (control_checkbox — must use indexed submission[qid][i] notation)
    const val = (v)  => v && v !== 'N/A' ? v : '9999'
    const arr = (a)  => a?.length ? [...a]  : []
    // Image picker: extract the filename letter (a–p) from the selected src.
    // src is now a bare stem (no extension), e.g. "/base/assets/images/KC-01_Q1a"
    // Extension suffix tolerated for safety. N/A or unselected → '9999'.
    const imageChar = (sel) => {
      if (!sel || sel === 'N/A') return '9999'
      const m = sel.match(/_Q\d+([a-p])(?:\.[^./]*)?$/i)
      return m ? m[1] : '9999'
    }

    for (const q of FEELINGS_QUESTIONS) {
      // Q5a/Q6a are control_checkbox (single-select); Q1–Q4 are control_radio
      if (q.type === 'checkbox') {
        answers[q.qid] = [val(feelingsValues[q.key])]
      } else {
        answers[q.qid] = val(feelingsValues[q.key])
      }
      answers[q.followUpQid]    = arr(feelingsValues[q.followUpKey])   // always Array
      answers[q.observationQid] = val(feelingsValues[q.observationKey])
    }

    answers[MEMORY_QUESTIONS.q7.qid] = val(memoryValues.q7)
    answers[MEMORY_QUESTIONS.q8.qid] = val(memoryValues.q8)

    for (const block of config?.blocks ?? []) {
      const v     = imageValues[block.index] ?? {}
      const b1qid = IMAGE_BLOCK_QIDS.batch1[block.index]
      const b2qid = IMAGE_BLOCK_QIDS.batch2[block.index]
      const b3qid = IMAGE_BLOCK_QIDS.batch3[block.index]
      const b4qid = IMAGE_BLOCK_QIDS.batch4[block.index]
      if (b1qid) answers[b1qid] = imageChar(v.batch1Selected)
      if (b2qid) answers[b2qid] = imageChar(v.batch2Selected)
      if (b3qid) answers[b3qid] = imageChar(v.batch3Selected)
      if (b4qid) answers[b4qid] = imageChar(v.batch4Selected)

      // Per-batch follow-up checkboxes + observation textareas
      const bqids = IMAGE_BLOCK_BATCH_QIDS[block.index]
      if (bqids) {
        if (bqids.b1FollowUp) answers[bqids.b1FollowUp] = arr(v.b1FollowUp)
        if (bqids.b1Obs)      answers[bqids.b1Obs]       = val(v.b1Obs)
        if (bqids.b2FollowUp) answers[bqids.b2FollowUp] = arr(v.b2FollowUp)
        if (bqids.b2Obs)      answers[bqids.b2Obs]       = val(v.b2Obs)
        if (bqids.b3Obs)      answers[bqids.b3Obs]       = val(v.b3Obs)
        if (bqids.b4Obs)      answers[bqids.b4Obs]       = val(v.b4Obs)
      }
    }

    answers[CLOSING_QIDS.followUp]    = arr(closingValues.asked)   // control_checkbox
    answers[CLOSING_QIDS.observation] = val(closingValues.observation)

    const payload = {
      student, config: { classId: config?.classId, sessionId: config?.sessionId },
      admin: adminValues, feelings: feelingsValues, memory: memoryValues,
      images: imageValues, closing: closingValues,
      submittedAt: new Date().toISOString(),
    }

    let jotformId = null
    let jotformError = null

    try {
      const result = await submitToJotform(answers)
      jotformId = result.submissionId
    } catch (err) {
      jotformError = err.message
    }

    try {
      await saveToSupabase({
        studentId: student.studentId,
        classId:   adminValues.classIdOverride || student.classId,
        sessionId: config?.sessionId,
        jotformId,
        payload,
      })
    } catch (err) {
      if (jotformError) {
        setSubmitState('error')
        setSubmitError(`JotForm: ${jotformError}\nSupabase: ${err.message}`)
        return
      }
      console.warn('Supabase backup failed:', err.message)
    }

    if (jotformError && !jotformId) {
      setSubmitState('error')
      setSubmitError(jotformError)
      return
    }

    setSubmitState('success')
    setSection(DONE)
  }

  const adminReady = adminValues.interviewerName && adminValues.interviewDate && adminValues.phase

  // ── Progress bar mapping ──────────────────────────────────────────────────
  // section 1 (admin page) → current 0 → adminFields.sectionTitle
  // section 2 (feelings)   → current 1 → feelings.partTitle
  // section 3 (memory)    → current 2 → memory.partTitle
  // section 4 (images)    → current 3 → images.partTitle
  // DONE                   → bar hidden, show done card
  const progressCurrent = section - 1

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-100 px-4 pt-safe-top pb-2 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-2">

          <img
            src={import.meta.env.BASE_URL + 'assets/logos/KS.png'}
            alt="KeySteps"
            className="h-12 w-12 object-contain shrink-0"
          />

          {/* Title — hides subtitle on small screens to reclaim space */}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-xs sm:text-sm leading-tight text-navy">
              {t('app.title', { phase: adminValues.phase ? t(`phases.${adminValues.phase}`) : t('phases.Round II') })}
            </h1>
            <p className="hidden sm:block text-slate-400 text-xs">
              {t('app.subtitle')}{adminValues.phase ? ` · ${t(`phases.${adminValues.phase}`)}` : ''}
            </p>
          </div>

          <LanguageToggle />

          {/* Student info pill — compact: name / classId·sessionId / district */}
          {student && (
            <div className="text-right shrink-0 max-w-[140px]">
              <p className="text-xs font-bold text-navy leading-tight truncate">
                {student.studentName || student.studentId}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight truncate">
                {adminValues.classIdOverride || student.classId}
                {config?.sessionId && (
                  <span className="text-orange"> · {config.sessionId}</span>
                )}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight truncate">{student.district}</p>
            </div>
          )}
        </div>

        {/* Progress bar — shown during admin page and scroll survey, not on done */}
        {section > 0 && section < DONE && (
          <div className="max-w-3xl mx-auto mt-1">
            <ProgressBar current={progressCurrent} total={sectionLabels.length} labels={sectionLabels} />
          </div>
        )}
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 py-4 pb-24 space-y-4">

        {/* Section 0: Student lookup */}
        {section === 0 && (
          <StudentLookup onResolved={handleStudentResolved} />
        )}

        {/* Section 1: Admin — shown alone as its own "page" */}
        {section === 1 && student && surveyReady !== true && (
          <>
            {surveyReady === 'loading' ? (
              /* ── Loading screen ── */
              <div className="section-card text-center py-16">
                <div className="text-4xl mb-4 animate-spin inline-block">⏳</div>
                <p className="text-navy font-semibold text-sm">{t('loading.loadingClass')}</p>
                <p className="text-slate-400 text-xs mt-1">{t('loading.loadingClassDetail', { classId: adminValues.classIdOverride || student.classId })}</p>
              </div>
            ) : (
              <>
                <AdminFields
                  student={student}
                  values={adminValues}
                  onChange={(k, v) => setAdminValues(p => ({ ...p, [k]: v }))}
                  schoolClasses={schoolClasses}
                  onClassChange={handleClassChange}
                  touched={adminTouched}
                />
                <button
                  onClick={handleContinue}
                  className="btn-primary w-full mt-3"
                >
                  {t('adminFields.continue')}
                </button>
                {adminTouched && !adminReady && (
                  <p className="text-center text-xs text-pink mt-2">{t('adminFields.requiredFieldsWarning')}</p>
                )}
              </>
            )}
          </>
        )}

        {/* Sections 2–4: scroll-driven survey — revealed after 繼續填寫 */}
        {surveyReady === true && section >= 2 && section < DONE && student && (
          <>
            {/* ── Section 2: Feelings Q1–Q6 ── */}
            <div id="section-2">
              <div className="section-card">
                <div className="section-title">
                  <span className="badge bg-pink/10 text-pink">{t('feelings.partBadge')}</span>
                  {t('feelings.partTitle')}
                </div>
                <div className="space-y-4">
                  {FEELINGS_QUESTIONS.map(q => {
                    const mainText = t('feelings.' + q.key)
                    const followUpLabel = t('feelings.' + q.followUpKey)
                    const followUpOptions = t('feelings.' + q.followUpKey + 'Options')
                    const obsLabel = t('feelings.' + q.observationKey)
                    return (
                      <div key={q.key} className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3">
                        {q.type === 'checkbox' ? (
                          <div>
                            <p className="text-sm font-bold text-navy mb-3">{mainText} <span className="text-pink">*</span></p>
                            <FollowUpCheckbox
                              label=""
                              options={t('feelings.' + q.key + 'Options')}
                              values={feelingsValues[q.key] ? [feelingsValues[q.key]] : []}
                              onChange={v => setFeelingsValues(p => ({ ...p, [q.key]: v[v.length - 1] ?? '' }))}
                            />
                          </div>
                        ) : (
                          <EmojiRating
                            question={mainText}
                            value={feelingsValues[q.key]}
                            onChange={v => setFeelingsValues(p => ({ ...p, [q.key]: v }))}
                            required
                          />
                        )}
                        <FollowUpCheckbox
                          label={followUpLabel}
                          options={followUpOptions}
                          values={feelingsValues[q.followUpKey] ?? []}
                          onChange={v => setFeelingsValues(p => ({ ...p, [q.followUpKey]: v }))}
                        />
                        <ObservationBox
                          label={obsLabel}
                          value={feelingsValues[q.observationKey]}
                          onChange={v => setFeelingsValues(p => ({ ...p, [q.observationKey]: v }))}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Section 3: Memory Q7–Q8 ── */}
            <div id="section-3">
              <div className="section-card">
                <div className="section-title">
                  <span className="badge bg-yellow/20 text-slate-700">{t('memory.partBadge')}</span>
                  {t('memory.partTitle')}
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="form-label">{t('memory.q7')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={memoryValues.q7 ?? ''}
                      onChange={e => setMemoryValues(p => ({ ...p, q7: e.target.value }))}
                      placeholder={t('memory.q7Placeholder')}
                    />
                  </div>
                  <div>
                    <label className="form-label">{t('memory.q8')}</label>
                    <textarea
                      rows={4}
                      className="form-input resize-none"
                      value={memoryValues.q8 ?? ''}
                      onChange={e => setMemoryValues(p => ({ ...p, q8: e.target.value }))}
                      placeholder={t('memory.q8Placeholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 4: Image question sets + closing + submit ── */}
            <div id="section-4">
              <div className="section-card">
                <div className="section-title">
                  <span className="badge bg-green/10 text-green">{t('images.partBadge')}</span>
                  {t('images.partTitle')}
                </div>

                {config?.blocks?.length ? (
                  <>
                    <p className="text-xs text-slate-400 mb-5">{t('images.totalTopics', { count: config.blocks.length })}</p>
                    <div className="space-y-4">
                      {config.blocks.map(block => (
                        <div key={block.index} className="bg-white rounded-2xl border border-slate-200 shadow-md p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="w-7 h-7 rounded-full bg-navy text-white text-sm flex items-center justify-center font-bold shrink-0">
                              {block.index}
                            </span>
                            <span className="text-sm font-bold text-navy">{t('images.topicLabel', { index: block.index })}</span>
                          </div>
                          <ImageBlock
                            block={block}
                            values={imageValues[block.index] ?? {}}
                            onChange={(k, v) => setImageBlockValue(block.index, k, v)}
                            showBatch4={student?.district === 'Tuen Mun'}
                            t={t}
                            batch1FollowUpOptions={t('images.batch1FollowUpOptions')}
                            batch2FollowUpOptions={t('images.batch2FollowUpOptions')}
                            batch4FollowUpOptions={t('images.batch4FollowUpOptions')}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 py-4">
                    {t('images.configIncomplete')}
                  </p>
                )}

                {/* Closing questions */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="section-title">
                    <span className="badge bg-navy/10 text-navy">{t('closing.partBadge')}</span>
                    {t('closing.partTitle')}
                  </div>
                  <FollowUpCheckbox
                    label={t('closing.intro')}
                    options={CLOSING_QUESTION_KEYS.map(k => t('closing.' + k))}
                    values={closingValues.asked}
                    onChange={v => setClosingValues(p => ({ ...p, asked: v }))}
                  />
                  <ObservationBox
                    label={t('closing.observationLabel')}
                    value={closingValues.observation}
                    onChange={v => setClosingValues(p => ({ ...p, observation: v }))}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="mt-4">
                {submitState === 'error' && (
                  <div className="mb-4 p-4 rounded-xl bg-pink/10 border border-pink/20 text-sm text-pink whitespace-pre-wrap">
                    {t('submit.errorPrefix')}{'\n'}{submitError}
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitState === 'loading'}
                  className="btn-primary w-full text-base py-4 disabled:opacity-50"
                >
                  {submitState === 'loading' ? t('submit.submitting') : t('submit.submit')}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Section 5: Done ── */}
        {section === DONE && (
          <div className="section-card text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-navy mb-2">{t('done.title')}</h2>
            <p className="text-slate-500 text-sm mb-6">
              {t('done.message', { studentId: student?.studentId })}
            </p>
            <button
              onClick={() => {
                setSection(0); setStudent(null); setConfig(null)
                setSchoolClasses([]); setSurveyReady(false); setAdminTouched(false)
                setAdminValues({}); setFeelingsValues({}); setMemoryValues({})
                setImageValues({}); setClosingValues({ asked: [], observation: '' })
                setSubmitState(null)
              }}
              className="btn-secondary"
            >
              {t('done.nextStudent')}
            </button>
          </div>
        )}
      </main>

    </div>
  )
}
