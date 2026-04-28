import { useState } from 'react'
import { useStudentLookup } from '../hooks/useStudentLookup'
import { useClassConfig } from '../hooks/useClassConfig'
import { useLanguage } from '../i18n/LanguageContext'

export default function StudentLookup({ onResolved }) {
  const [input, setInput]           = useState('')
  const [foundStudent, setFoundStudent] = useState(null)
  const [foundConfig, setFoundConfig]   = useState(null)
  const [configMissing, setConfigMissing] = useState(false)

  const { lookup, loading: lookupLoading, error: lookupError, getSchoolClasses } = useStudentLookup()
  const { getConfig, loading: configLoading }                  = useClassConfig()
  const { t } = useLanguage()

  const loading = lookupLoading || configLoading

  async function handleLookup() {
    setFoundStudent(null)
    setFoundConfig(null)
    setConfigMissing(false)

    const student = await lookup(input)
    if (!student) return

    setFoundStudent(student)

    const config = await getConfig(student.classId)
    if (config) {
      setFoundConfig(config)
    } else {
      setConfigMissing(true)
    }
  }

  function handleConfirm() {
    const schoolClasses = getSchoolClasses(foundStudent.schoolId)
    onResolved({ student: foundStudent, config: foundConfig, schoolClasses })
  }

  return (
    <div className="section-card">
      <div className="section-title">
        <span className="w-7 h-7 rounded-full bg-navy text-white text-sm flex items-center justify-center font-bold shrink-0">{t('studentLookup.sectionNumber')}</span>
        {t('studentLookup.sectionTitle')}
      </div>

      <label className="form-label">{t('studentLookup.studentIdLabel')}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.trim())}
          onKeyDown={e => e.key === 'Enter' && !loading && input && handleLookup()}
          placeholder={t('studentLookup.studentIdPlaceholder')}
          className="form-input flex-1"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <button
          onClick={handleLookup}
          disabled={loading || !input}
          className="btn-primary min-w-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳' : t('studentLookup.lookup')}
        </button>
      </div>

      {lookupError && (
        <p className="mt-2 text-sm text-pink font-medium flex items-center gap-1">
          <span>⚠️</span> {t('studentLookup.errorNotFound')}
        </p>
      )}

      {foundStudent && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap gap-2 mb-4">
            <InfoChip label={t('studentLookup.chipStudent')} value={foundStudent.studentName} color="navy" />
            <InfoChip label={t('studentLookup.chipSchool')} value={foundStudent.schoolName}  color="orange" />
            <InfoChip label={t('studentLookup.chipClass')} value={foundStudent.className ? `${foundStudent.className} (${foundStudent.classId})` : foundStudent.classId} color="yellow" />
            <InfoChip label={t('studentLookup.chipDistrict')} value={foundStudent.district}    color="green" />
          </div>

          {configMissing && (
            <p className="text-xs text-pink mb-3 flex items-center gap-1">
              ⚠️ {t('studentLookup.configMissing', { classId: foundStudent.classId })}
            </p>
          )}

          <button
            onClick={handleConfirm}
            className="btn-primary w-full"
          >
            {t('studentLookup.confirm')}
          </button>
        </div>
      )}
    </div>
  )
}

function InfoChip({ label, value, color }) {
  const colors = {
    navy:   'bg-navy/10 text-navy',
    orange: 'bg-orange/10 text-orange',
    yellow: 'bg-yellow/20 text-slate-700',
    green:  'bg-green/10 text-green',
  }
  return (
    <span className={`badge ${colors[color]} gap-1`}>
      <span className="opacity-60 text-[10px]">{label}</span>
      <span className="font-semibold">{value || '—'}</span>
    </span>
  )
}
