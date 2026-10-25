import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Mail, Loader2 } from 'lucide-react';
import { getSupabaseClient, getSupabaseConfig } from '../../lib/supabaseSync';
import { loadSettingsFromStorage } from '../../lib/storage';

type GateState = 'loading' | 'signed-out' | 'signed-in' | 'local-only';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GateState>('loading');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { url, key } = getSupabaseConfig(loadSettingsFromStorage());
  const client = getSupabaseClient(url, key);

  useEffect(() => {
    if (!client) {
      setState('local-only');
      return;
    }
    const apply = (session: Session | null) => setState(session ? 'signed-in' : 'signed-out');
    client.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = client.auth.onAuthStateChange((_event, session) => apply(session));
    return () => sub.subscription.unsubscribe();
  }, [client]);

  if (state === 'local-only' || state === 'signed-in') return <>{children}</>;

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#09090b]">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !email.trim()) return;
    setBusy(true);
    setError('');
    const { error: err } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-[#09090b]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Yakıt Düellosu</h1>
        {sent ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Giriş linki {email} adresine gönderildi.</p>
        ) : (
          <>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="E-posta"
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-neutral-400"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-2 text-sm font-medium disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Giriş linki gönder
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </>
        )}
      </form>
    </div>
  );
};
