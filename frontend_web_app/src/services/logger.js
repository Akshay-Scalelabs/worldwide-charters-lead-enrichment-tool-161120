import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * logEnrichmentEvent
 * Insert an enrichment action log into Supabase (if configured).
 *
 * @param {'find_email'|'find_phone'} action - The user action performed.
 * @param {object} params - The search parameters used in the request.
 * @param {object} outcome - A summary of the outcome (success/error details).
 * @returns {Promise<{logged: boolean, reason?: string}>} Result of logging attempt.
 */
export async function logEnrichmentEvent(action, params, outcome) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      // Not configured; no-op
      console.debug('[logger] Supabase not configured; skipping log.');
      return { logged: false, reason: 'SUPABASE_NOT_CONFIGURED' };
    }

    const payload = {
      action,
      params: params || null,
      outcome: outcome || null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      app_version: process.env.REACT_APP_APP_VERSION || '0.1.0',
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('enrichment_logs').insert(payload);
    if (error) {
      throw error;
    }
    return { logged: true };
  } catch (err) {
    console.warn('[logger] Failed to insert log:', err?.message || err);
    return { logged: false, reason: err?.message || 'INSERT_FAILED' };
  }
}
