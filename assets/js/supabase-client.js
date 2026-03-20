/**
 * Above & Beyond AI — Supabase Client
 * Initialized synchronously so Auth is available immediately on page load.
 */

const SUPABASE_URL  = 'https://vyylecrtdmyfhcvxpuij.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eWxlY3J0ZG15ZmhjdnhwdWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzAwNzgsImV4cCI6MjA4OTUwNjA3OH0.V1DT15ubJYb3Z0fsuK4XckNgbT_21yoZPNMAPOHczDE';

// ── Initialize immediately (SDK must be loaded before this script) ──
let _sb = null;

function getClient() {
  if (_sb) return _sb;
  if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    try {
      _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    } catch (e) {
      console.error('[Supabase] createClient failed:', e);
    }
  }
  return _sb;
}

/* ── AUTH MODULE ─────────────────────────────────────────── */
const Auth = {
  async signUp({ email, password, fullName, company }) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase nicht initialisiert. Bitte Seite neu laden.');
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, company } }
    });
    if (error) throw error;
    if (data.user) {
      await sb.from('profiles').upsert({
        id: data.user.id, email: data.user.email,
        full_name: fullName, company,
        created_at: new Date().toISOString()
      });
    }
    return data;
  },

  async signIn({ email, password }) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase nicht initialisiert. Bitte Seite neu laden.');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const sb = getClient();
    if (sb) await sb.auth.signOut();
    window.location.href = 'index.html';
  },

  async getSession() {
    const sb = getClient();
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    return data.session;
  },

  async getUser() {
    const sb = getClient();
    if (!sb) return null;
    const { data } = await sb.auth.getUser();
    return data.user;
  },

  onAuthStateChange(callback) {
    const sb = getClient();
    if (!sb) return;
    return sb.auth.onAuthStateChange((event, session) => callback(event, session));
  },

  async resetPassword(email) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase nicht initialisiert.');
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html'
    });
    if (error) throw error;
  }
};

/* ── READINESS DB ────────────────────────────────────────── */
const ReadinessDB = {
  async save(payload) {
    const sb = getClient();
    if (!sb) throw new Error('Nicht verbunden.');
    const { data, error } = await sb.from('readiness_assessments')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select().single();
    if (error) throw error;
    return data;
  },

  async getMyAssessments() {
    const sb = getClient();
    if (!sb) return [];
    const user = await Auth.getUser();
    if (!user) return [];
    const { data, error } = await sb.from('readiness_assessments')
      .select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const sb = getClient();
    if (!sb) throw new Error('Nicht verbunden.');
    const { data, error } = await sb.from('readiness_assessments')
      .select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }
};

/* ── CONTACT DB ──────────────────────────────────────────── */
const ContactDB = {
  async submit(payload) {
    const sb = getClient();
    if (!sb) throw new Error('Nicht verbunden.');
    const { error } = await sb.from('contact_requests')
      .insert({ ...payload, created_at: new Date().toISOString() });
    if (error) throw error;
  }
};

/* ── PROFILE DB ──────────────────────────────────────────── */
const ProfileDB = {
  async get(userId) {
    const sb = getClient();
    if (!sb) throw new Error('Nicht verbunden.');
    const { data, error } = await sb.from('profiles')
      .select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  async update(userId, updates) {
    const sb = getClient();
    if (!sb) throw new Error('Nicht verbunden.');
    const { error } = await sb.from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  }
};

/* ── NAV AUTH UI ─────────────────────────────────────────── */
async function updateNavAuth() {
  try {
    const session = await Auth.getSession();
    document.querySelector('.nav-login-btn')?.classList.toggle('hidden', !!session);
    document.querySelector('.nav-logout-btn')?.classList.toggle('hidden', !session);
    document.querySelector('.nav-dash-btn')?.classList.toggle('hidden', !session);
  } catch(e) { /* silent */ }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();
  try {
    Auth.onAuthStateChange(() => updateNavAuth());
  } catch(e) { /* silent */ }
});

// ── Exports ───────────────────────────────────────────────
window.SupabaseAuth = Auth;
window.ReadinessDB  = ReadinessDB;
window.ContactDB    = ContactDB;
window.ProfileDB    = ProfileDB;
window.getSupabaseClient = getClient;
