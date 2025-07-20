import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="card shadow-lg">
          <div className="card-body p-8">
        <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-700 mb-2">PG Management</h1>
              <p className="text-lg text-gray-600 font-medium">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-2">
                  {error}
            </div>
          )}
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="Enter your email address"
                required
              />
            </div>
          </div>
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pl-10"
                placeholder="Enter your password"
                    required
              />
            </div>
          </div>
          <button
            type="submit"
                className="btn-primary w-full py-3 text-base font-medium"
            disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center"><Loader2 className="animate-spin h-5 w-5 mr-2" /> Signing in...</span>
                ) : (
                  'Sign In'
                )}
          </button>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;