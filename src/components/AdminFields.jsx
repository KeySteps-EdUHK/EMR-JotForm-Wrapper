import { useStudentLookup } from '../hooks/useStudentLookup'
import { useClassConfig } from '../hooks/useClassConfig'
import { PHASES } from '../constants/questions'
import { useLanguage } from '../i18n/LanguageContext'

/**
 * Admin + student info fields.
 *
 * Props:
 *   student       — from CSV lookup (studentName, schoolName, classId, district, schoolId)
 *   values        — controlled form state
 *   onChange      — (key, value) => void
 *   schoolClasses — string[] of Class ID 25/26 values for the student's school
 *   onClassChange — (newClassId) => void  — triggers config reload in parent
 *   touched       — boolean — when true, highlights empty required fields in pink
 */
export default function AdminFields({ student, values, onChange, schoolClasses = [], onClassChange, touched = false }) {
  const { t } = useLanguage()

  const field = (key) => ({
    value: values[key] ?? '',
    onChange: e => onChange(key, e.target.value),
  })

  // Returns extra className when a required field is empty after a submit attempt
  const err = (key) => touched && !values[key] ? 'ring-2 ring-pink border-pink' : ''

  const activeClassId = values.classIdOverride || student.classId

  function handleClassChange(e) {
    const newId = e.target.value
    onChange('classIdOverride', newId)
    onClassChange?.(newId)
  }

  return (
    <div className="section-card">
      <div className="section-title">
        <span className="w-7 h-7 rounded-full bg-navy text-white text-sm flex items-center justify-center font-bold shrink-0">{t('adminFields.sectionNumber')}</span>
        {t('adminFields.sectionTitle')}
      </div>

      {/* Read-only student info chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <InfoChip label={t('adminFields.chipStudent')} value={student.studentName} color="navy" />
        <InfoChip label={t('adminFields.chipSchool')} value={student.schoolName}  color="orange" />
        <InfoChip label={t('adminFields.chipDistrict')} value={student.district}    color="green" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Class — always a dropdown (pre-selected = student's class); options show "{Class Name} ({Class ID})" */}
        <div className="sm:col-span-2">
          <label className="form-label">
            {schoolClasses.length > 0 ? t('adminFields.classLabelRequired') : t('adminFields.classLabel')}
            {schoolClasses.length > 0 && (
              <span className="text-slate-400 font-normal ml-1">{t('adminFields.classOptionsCount', { count: schoolClasses.length })}</span>
            )}
          </label>
          {schoolClasses.length > 0 ? (
            <select
              className="form-input"
              value={activeClassId}
              onChange={handleClassChange}
            >
              {schoolClasses.map(({ classId, className }) => (
                <option key={classId} value={classId}>
                  {className ? `${className} (${classId})` : classId}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="form-input"
              value={activeClassId}
              onChange={handleClassChange}
            />
          )}
        </div>

        <div>
          <label className="form-label">{t('adminFields.interviewerNameLabel')}</label>
          <input
            type="text"
            className={`form-input ${err('interviewerName')}`}
            placeholder={t('adminFields.interviewerNamePlaceholder')}
            {...field('interviewerName')}
          />
        </div>

        <div>
          <label className="form-label">{t('adminFields.interviewDateLabel')}</label>
          <input
            type="date"
            className={`form-input ${err('interviewDate')}`}
            {...field('interviewDate')}
          />
        </div>

        <div>
          <label className="form-label">{t('adminFields.phaseLabel')}</label>
          <select className={`form-input ${err('phase')}`} {...field('phase')}>
            <option value="">{t('adminFields.phaseOptionDefault')}</option>
            {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="form-label">{t('adminFields.studentNameLabel')} <span className="text-slate-400 font-normal">{t('adminFields.studentNameModifier')}</span></label>
          <input type="text" className="form-input" placeholder={t('adminFields.studentNamePlaceholder')} {...field('studentNameOverride')} />
        </div>

      </div>
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
