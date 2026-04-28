import { useLanguage } from '../i18n/LanguageContext'

const EMOJIS = [
  { emoji: '😭', value: '1', bg: 'bg-pink/10',   ring: 'ring-pink',   text: 'text-pink'   },
  { emoji: '☹️', value: '2', bg: 'bg-pink/5',    ring: 'ring-pink/50', text: 'text-pink/70' },
  { emoji: '😐', value: '3', bg: 'bg-yellow/10', ring: 'ring-yellow', text: 'text-yellow'  },
  { emoji: '🙂', value: '4', bg: 'bg-green/10',  ring: 'ring-green/50', text: 'text-green/70' },
  { emoji: '😃', value: '5', bg: 'bg-green/10',  ring: 'ring-green',  text: 'text-green'   },
]

export default function EmojiRating({ question, value, onChange, required }) {
  const { t } = useLanguage()
  const labels = t('emojiRating.labels', { returnObjects: true })

  return (
    <div>
      <p className="text-sm font-bold text-navy mb-3 leading-relaxed">
        {question}
        {required && <span className="text-pink ml-1">*</span>}
      </p>
      <div className="flex justify-between gap-1">
        {EMOJIS.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border-2 transition-all active:scale-95 touch-manipulation min-h-[64px] sm:min-h-[72px]
              ${value === opt.value
                ? `${opt.bg} border-current ${opt.text} ring-2 ${opt.ring} ring-offset-1 ring-offset-white`
                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              }`}
          >
            <span className="text-3xl leading-none">{opt.emoji}</span>
            <span className={`text-[9px] font-medium leading-tight text-center
              ${value === opt.value ? opt.text : 'text-slate-400'}`}>
              {Array.isArray(labels) ? labels[i] : labels?.[i] ?? ''}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
