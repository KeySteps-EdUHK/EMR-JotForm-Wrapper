/**
 * Supabase backup client.
 *
 * Stores full form responses as JSON blobs to the `responses` table.
 *
 * Table schema (run in Supabase SQL editor):
 *
 *   create table responses (
 *     id            uuid primary key default gen_random_uuid(),
 *     created_at    timestamptz default now(),
 *     student_id    text,
 *     class_id      text,
 *     session_id    text,
 *     jotform_id    text,           -- submission ID returned by JotForm (if successful)
 *     payload       jsonb not null  -- full form state
 *   );
 *
 * TODO: When the form schema is finalised, migrate `payload` to structured columns.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

let _client = null

function getClient() {
  if (!_client) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase credentials not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
    }
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _client
}

/**
 * Save a form response to Supabase as a backup.
 * @param {Object} params
 * @param {string} params.studentId
 * @param {string} params.classId
 * @param {string} params.sessionId
 * @param {string|null} params.jotformId - JotForm submission ID (null if JotForm failed)
 * @param {Object} params.payload        - full form state object
 */
export async function saveToSupabase({ studentId, classId, sessionId, jotformId, payload }) {
  const supabase = getClient()

  const { error } = await supabase.from('responses').insert({
    student_id: studentId,
    class_id:   classId,
    session_id: sessionId,
    jotform_id: jotformId ?? null,
    payload,
  })

  if (error) throw new Error(`Supabase error: ${error.message}`)
}
