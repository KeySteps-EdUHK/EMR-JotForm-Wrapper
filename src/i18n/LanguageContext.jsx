import { createContext, useContext, useState, useCallback } from 'react'
import translations from './translations.json'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'emr-lang'

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'zh'
  })

  const setLocale = useCallback((lang) => {
    setLocaleState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }, [])

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.')
    let value = translations[locale]
    for (const k of keys) {
      value = value?.[k]
    }
    if (value === undefined) {
      console.warn(`[i18n] Missing translation: "${key}" (locale: ${locale})`)
      return key
    }
    // Arrays returned as-is (no interpolation needed for option arrays)
    if (Array.isArray(value)) return value
    // Interpolate {param} placeholders in strings
    return String(value).replace(/\{(\w+)\}/g, (_, k) => {
      return params[k] !== undefined ? params[k] : `{${k}}`
    })
  }, [locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
