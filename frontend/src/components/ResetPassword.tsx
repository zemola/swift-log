import { useState } from 'react';
import { Lock, Loader, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid or missing token.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Password reset successfully! You can now log in.');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Glass Card */}
      <div className="max-w-md w-full bg-white/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-xl z-10">
        <div>
          <div className="mx-auto h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-slate-900">
            Set New Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Enter your new password below
          </p>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center border border-green-100">
            {success}
            <div className="mt-4">
              <a href="/" className="text-sm font-medium text-purple-600 hover:text-purple-700">
                Go to Login
              </a>
            </div>
          </div>
        )}

        {!success && (
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="relative">
                <label htmlFor="password" className="text-xs font-medium text-slate-500 block mb-1">New Password</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-6">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none bg-white/50 relative block w-full px-10 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:z-10 text-sm transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center top-6 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <label htmlFor="confirm-password" className="text-xs font-medium text-slate-500 block mb-1">Confirm Password</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-6">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none bg-white/50 relative block w-full px-10 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:z-10 text-sm transition-all"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all shadow-lg hover:shadow-purple-200"
              >
                {loading ? (
                  <Loader className="animate-spin h-5 w-5 text-white" />
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
