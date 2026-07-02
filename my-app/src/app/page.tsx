'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      // In a real app, you'd authenticate here
      router.push('/landing');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col items-center justify-center px-4 py-8">
      {/* Login Container */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            🤖 AI Robotics Trainer
          </h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 shadow-xl">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-white font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className={clsx(
                    'w-full bg-gray-900 border rounded-lg px-4 py-3 text-white placeholder-gray-500',
                    'focus:outline-none focus:ring-1 transition-all',
                    loading ? 'opacity-50 cursor-not-allowed' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                  )}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-white font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={clsx(
                    'w-full bg-gray-900 border rounded-lg px-4 py-3 text-white placeholder-gray-500',
                    'focus:outline-none focus:ring-1 transition-all',
                    loading ? 'opacity-50 cursor-not-allowed' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                  )}
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  'w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300',
                  'flex items-center justify-center gap-2',
                  loading 
                    ? 'bg-blue-600/50 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
                )}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-xs mb-3">Demo Credentials:</p>
              <p className="text-gray-500 text-xs mb-1"><span className="text-gray-400">Email:</span> demo@robotics.com</p>
              <p className="text-gray-500 text-xs"><span className="text-gray-400">Password:</span> password123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Powered by AI robotics coaching system
          </p>
        </div>
      </div>
    </div>
  );
}
