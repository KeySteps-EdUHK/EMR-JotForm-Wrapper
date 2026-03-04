import { useMemo } from 'react'

/** Fisher-Yates shuffle (deterministic per render via useMemo) */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 2×2 image picker.
 *
 * Props:
 *   images      [{src, isCorrect}] — exactly 4 items, order will be shuffled
 *   selected    string|null        — currently selected src
 *   onSelect    (src, isCorrect) => void
 *   question    string             — question text shown above the grid
 */
export default function ImagePicker({ images, selected, onSelect, question }) {
  // Shuffle once on mount; stable across re-renders unless images array reference changes
  const shuffled = useMemo(() => shuffle(images), [images])

  return (
    <div>
      {question && (
        <p className="text-sm font-medium text-slate-700 mb-3 leading-relaxed">
          {question} <span className="text-pink">*</span>
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {shuffled.map((img, i) => {
          const isSelected = selected === img.src
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(img.src, img.isCorrect)}
              className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all active:scale-95
                ${isSelected
                  ? 'border-orange shadow-lg shadow-orange/20'
                  : 'border-transparent hover:border-orange/30'}`}
            >
              {img.src ? (
                <img
                  src={img.src}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable="false"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-xs">
                  No image
                </div>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orange flex items-center justify-center shadow">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10.28 2.28L4 8.56 1.72 6.28a1 1 0 00-1.44 1.44l3 3a1 1 0 001.44 0l7-7a1 1 0 00-1.44-1.44z" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
