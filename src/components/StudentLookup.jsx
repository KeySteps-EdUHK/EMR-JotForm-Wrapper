import { useState } from 'react'
import { useStudentLookup } from '../hooks/useStudentLookup'
import { useClassConfig } from '../hooks/useClassConfig'

export default function StudentLookup({ onResolved }) {
  const [input, setInput] = useState('')
  const { lookup, loading: lookupLoading, error: lookupError } = useStudentLookup()
  const { getConfig, loading: configLoading, error: configError } = useClassConfig()

  const loading = lookupLoading || configLoading
  const error   = lookupError || configError

  async function handleLookup() {
    const student = await lookup(input)
    if (!student) return

    const config = await getConfig(student.classId)
    if (!config) return

    onResolved({ student, config })
  }

  return (
    <div className="section-card">
      <div className="section-title">
        <span className="w-7 h-7 rounded-full bg-navy text-white text-sm flex items-center justify-center font-bold">1</span>
        學生資料
      </div>

      <label className="form-label">學生編號</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.trim())}
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
          placeholder="例：St10001"
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
          {loading ? '⏳' : '查詢'}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-pink font-medium flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  )
}
