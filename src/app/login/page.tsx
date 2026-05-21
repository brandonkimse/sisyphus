'use client';

import { useState } from 'react';
import { login } from './actions';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Sparkles className="w-10 h-10 text-white mb-4" />
          <h1 className="text-2xl font-bold text-white">Sisyphus</h1>
          <p className="text-sm text-zinc-400 mt-2">Log in or create an account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
            />
          </div>

          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-zinc-100 text-zinc-900 font-semibold py-2.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50 mt-4"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Authenticating...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
