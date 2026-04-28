import ImagePicker from './ImagePicker'
import FollowUpCheckbox from './FollowUpCheckbox'
import ObservationBox from './ObservationBox'

/**
 * One image memory block — 4 batches of 2×2 image pickers, each with its own
 * follow-up checkbox (batch1+batch2) and observation textarea (all 4 batches).
 *
 * Props:
 *   block    { index, batch1, batch2, batch3, batch4 }  each [{src,isCorrect}×4]
 *   values   {
 *     batch1Selected, batch1Correct,
 *     batch2Selected, batch2Correct,
 *     batch3Selected, batch3Correct,
 *     batch4Selected, batch4Correct,
 *     b1FollowUp: [], b1Obs,
 *     b2FollowUp: [], b2Obs,
 *     b3Obs, b4Obs,
 *   }
 *   onChange (key, value) => void
 *   showBatch4 bool
 *   t        translation function
 *   batch1FollowUpOptions string[]
 *   batch2FollowUpOptions string[]
 *   batch4FollowUpOptions string[]
 */
export default function ImageBlock({
  block, values = {}, onChange, showBatch4 = true, t,
  batch1FollowUpOptions = [],
  batch2FollowUpOptions = [],
  batch4FollowUpOptions = [],
}) {
  const n = block.index

  return (
    <div className="space-y-6">

      {/* ── Batch 1 — Scene ─────────────────────────────────────────────── */}
      <ImagePicker
        images={block.batch1}
        selected={values.batch1Selected ?? null}
        onSelect={(src, isCorrect) => {
          onChange('batch1Selected', src)
          onChange('batch1Correct', isCorrect)
        }}
        question={t('images.batch1Question', { index: n })}
      />
      <FollowUpCheckbox
        label={t('images.batch1FollowUp', { index: n })}
        options={batch1FollowUpOptions}
        values={values.b1FollowUp ?? []}
        onChange={v => onChange('b1FollowUp', v)}
      />
      <ObservationBox
        label={t('images.batch1Obs', { index: n })}
        value={values.b1Obs}
        onChange={v => onChange('b1Obs', v)}
      />

      {/* ── Batch 2 — Staff ─────────────────────────────────────────────── */}
      <ImagePicker
        images={block.batch2}
        selected={values.batch2Selected ?? null}
        onSelect={(src, isCorrect) => {
          onChange('batch2Selected', src)
          onChange('batch2Correct', isCorrect)
        }}
        question={t('images.batch2Question', { index: n })}
      />
      <FollowUpCheckbox
        label={t('images.batch2FollowUp', { index: n })}
        options={batch2FollowUpOptions}
        values={values.b2FollowUp ?? []}
        onChange={v => onChange('b2FollowUp', v)}
      />
      <ObservationBox
        label={t('images.batch2Obs', { index: n })}
        value={values.b2Obs}
        onChange={v => onChange('b2Obs', v)}
      />

      {/* ── Batch 3 ─────────────────────────────────────────────────────── */}
      <ImagePicker
        images={block.batch3}
        selected={values.batch3Selected ?? null}
        onSelect={(src, isCorrect) => {
          onChange('batch3Selected', src)
          onChange('batch3Correct', isCorrect)
        }}
        question={t('images.batch3Question', { index: n })}
      />
      <ObservationBox
        label={t('images.batch3Obs', { index: n })}
        value={values.b3Obs}
        onChange={v => onChange('b3Obs', v)}
      />

      {/* ── Batch 4 — Tuen Mun only ──────────────────────────────────────── */}
      {showBatch4 && (
        <>
          <ImagePicker
            images={block.batch4}
            selected={values.batch4Selected ?? null}
            onSelect={(src, isCorrect) => {
              onChange('batch4Selected', src)
              onChange('batch4Correct', isCorrect)
            }}
            question={t('images.batch4Question', { index: n })}
          />
          <FollowUpCheckbox
            label={t('images.batch4FollowUp', { index: n })}
            options={batch4FollowUpOptions}
            values={values.b4FollowUp ?? []}
            onChange={v => onChange('b4FollowUp', v)}
          />
          <ObservationBox
            label={t('images.batch4Obs', { index: n })}
            value={values.b4Obs}
            onChange={v => onChange('b4Obs', v)}
          />
        </>
      )}

    </div>
  )
}
