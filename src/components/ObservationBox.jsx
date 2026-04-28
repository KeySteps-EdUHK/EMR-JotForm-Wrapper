import { useLanguage } from '../i18n/LanguageContext'

/** Optional observation / free-text textarea */
export default function ObservationBox({ label, value, onChange, placeholder }) {
  const { t } = useLanguage()
  const resolvedPlaceholder = placeholder ?? t('observationBox.defaultPlaceholder')

  return (
    <div className="mt-3">
      {label && (
        <p className="text-sm font-bold text-navy mb-1.5">
          {label}
        </p>
      )}
      <textarea
        rows={2}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm resize-none
                   focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange
                   transition-colors placeholder:text-slate-300"
      />
    </div>
  )
}
