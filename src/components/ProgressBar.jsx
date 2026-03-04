export default function ProgressBar({ current, total, labels }) {
  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        {labels.map((label, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${i < current  ? 'bg-orange text-white'
                : i === current ? 'bg-navy text-white ring-2 ring-orange ring-offset-1'
                : 'bg-slate-200 text-slate-400'}`}
            >
              {i + 1}
            </div>
            <span className={`mt-1 text-[10px] text-center leading-tight hidden sm:block
              ${i === current ? 'text-navy font-semibold' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
      {/* connector line */}
      <div className="relative -mt-6 mx-3.5 h-0.5 bg-slate-200 -z-10">
        <div
          className="h-full bg-orange transition-all duration-500"
          style={{ width: `${(current / (total - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
