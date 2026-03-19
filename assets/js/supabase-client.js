/**
 * Above & Beyond AI — Supabase Client
 *
 * NOTE: The anon/publishable key is safe to expose in frontend code.
 *       Row Level Security (RLS) in Supabase protects your data.
 */

// ── Configuration ─────────────────────────────────────────
const SUPABASE_URL  = 'https://vyylecrtdmyfhcvxpuij.supabase.co';
const SUPABASE_ANON = 'sb_publishable_Y2VArypEq9WJ_u_Kfvd-5g_W_X0eYMH';

// ── Initialize client (loaded via CDN in HTML) ─────────────
let supabase = null;

function initSupabase() {
  if (typeof window.supabase === 'undefined') {
    console.warn('[Supabase] SDK not loaded — check script tag in HTML.');
    return false;
  }
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  return true;
}

/* ─────────────────────────────────────────────────────────
   AUTH MODULE
   ───────────────────────────────────────────────────────── */

const Auth = {
  /** Register a new user */
  async signUp({ email, password, fullName, company }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company }
      }
    });
    if (error) throw error;
    // Create profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id:         data.user.id,
        email:      data.user.email,
        full_name:  fullName,
        company:    company,
        created_at: new Date().toISOString()
      });
    }
    return data;
  },

  /** Sign in with email & password */
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /** Sign out */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html';
  },

  /** Get current session */
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /** Get current user */
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /** Listen to auth state changes */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  /** Password reset */
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html'
    });
    if (error) throw error;
  }
};

/* ─────────────────────────────────────────────────────────
   READINESS CHECK MODULE
   ───────────────────────────────────────────────────────── */

const ReadinessDB = {
  async save(payload) {
    const { data, error } = await supabase
      .from('readiness_assessments')
      .insert({
        ...payload,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMyAssessments() {
    const user = await Auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('readiness_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('readiness_assessments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getBenchmarkAverages() {
    const { data, error } = await supabase
      .from('readiness_assessments')
      .select('scores, overall_score');
    if (error) throw error;
    if (!data || !data.length) return null;
    const avg = {};
    const dimensions = ['strategy', 'data', 'process', 'tech', 'culture', 'compliance'];
    dimensions.forEach(dim => {
      const vals = data.map(r => r.scores?.[dim] || 0).filter(v => v > 0);
      avg[dim] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    });
    avg.overall = Math.round(
      data.map(r => r.overall_score || 0).reduce((a, b) => a + b, 0) / data.length
    );
    return avg;
  }
};

/* ─────────────────────────────────────────────────────────
   CONTACT MODULE
   ───────────────────────────────────────────────────────── */

const ContactDB = {
  async submit({ name, email, company, topic, message }) {
    const { data, error } = await supabase
      .from('contact_requests')
      .insert({ name, email, company, topic, message, created_at: new Date().toISOString() });
    if (error) throw error;
    return data;
  }
};

/* ─────────────────────────────────────────────────────────
   PROFILE MODULE
   ───────────────────────────────────────────────────────── */

const ProfileDB = {
  async get(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    return data;
  }
};

/* ─────────────────────────────────────────────────────────
   AUTH UI HELPER — updates nav based on session
   ───────────────────────────────────────────────────────── */

async function updateNavAuth() {
  const session = await Auth.getSession();
  const loginBtn  = document.querySelector('.nav-login-btn');
  const logoutBtn = document.querySelector('.nav-logout-btn');
  const dashBtn   = document.querySelector('.nav-dash-btn');

  if (session) {
    loginBtn?.classList.add('hidden');
    logoutBtn?.classList.remove('hidden');
    dashBtn?.classList.remove('hidden');
  } else {
    loginBtn?.classList.remove('hidden');
    logoutBtn?.classList.add('hidden');
    dashBtn?.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (initSupabase()) {
    updateNavAuth();
    Auth.onAuthStateChange(() => updateNavAuth());
  }
});

// Export for use in other scripts
window.SupabaseAuth = Auth;
window.ReadinessDB  = ReadinessDB;
window.ContactDB    = ContactDB;
window.ProfileDB    = ProfileDB;
window.initSupabase = initSupabase;
