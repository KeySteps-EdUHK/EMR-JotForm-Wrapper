import { useLanguage } from '../i18n/LanguageContext'

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-navy transition-colors shrink-0"
      title={t('langToggle.title')}
    >
      <span className={locale === 'zh' ? 'text-navy font-bold' : 'opacity-60'}>{t('langToggle.zhLabel')}</span>
      <span className="text-slate-300">|</span>
      <span className={locale === 'en' ? 'text-navy font-bold' : 'opacity-60'}>EN</span>
    </button>
  )
}
