export default function ProgressBar({ current, total, labels }) {
  return (
    <div className="w-full px-2 py-2">
      <div className="relative flex items-start">

        {/* Line sits exactly at the vertical centre of the h-7 circles (top-3.5 = 14px = 28px/2) */}
        <div className="absolute top-3.5 left-0 right-0 mx-3.5 h-0.5 bg-slate-200">
          <div
            className="h-full bg-orange transition-all duration-500"
            style={{ width: total > 1 ? `${(current / (total - 1)) * 100}%` : '0%' }}
          />
        </div>

        {/* Circles + labels */}
        {labels.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col items-center relative z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${i < current
                  ? 'bg-orange text-white'
                  : i === current
                    ? 'bg-navy text-white ring-2 ring-orange ring-offset-2 ring-offset-white'
                    : 'bg-white border-2 border-slate-200 text-slate-400'}`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`mt-1 text-[9px] text-center leading-tight
              ${i === current ? 'text-navy font-semibold' : i < current ? 'text-orange' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
        ))}

      </div>
    </div>
  )
}
