import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { email: 'admin@maira-adhis.com', password: 'admin123', role: 'ADMIN', name: 'System Administrator' },
  { email: 'partner@maira-adhis.com', password: 'partner123', role: 'MANAGING_PARTNER', name: 'Adv. Maira Hassan' },
  { email: 'advocate@maira-adhis.com', password: 'advocate123', role: 'ADVOCATE', name: 'Adv. Adhis Nkrumah' },
  { email: 'secretary@maira-adhis.com', password: 'secretary123', role: 'SECRETARY', name: 'Florence Kamau' },
  { email: 'accounts@maira-adhis.com', password: 'accounts123', role: 'ACCOUNTANT', name: 'Robert Osei' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    );

    if (account) {
      const user: User = {
        id: `user-${account.role.toLowerCase()}`,
        name: account.name,
        email: account.email,
        role: account.role as User['role'],
        createdAt: new Date(),
      };
      setUser(user);
      toast.success(`Welcome back, ${account.name}!`);
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please check your credentials and try again.');
    }
    setIsLoading(false);
  };

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-400" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-300" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500 rounded-2xl shadow-xl mb-4">
            <Scale className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">MAIRA &amp; ADHIS</h1>
          <p className="text-primary-200 text-sm tracking-widest uppercase mt-1">Advocates</p>
          <p className="text-primary-300 text-xs mt-1">Chartered Secretaries &amp; Legal Consultants</p>
          <p className="text-primary-400 text-xs">Dar es Salaam, Tanzania</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Sign in to your account</h2>
            <p className="text-sm text-gray-500 mt-1">Access the Law Firm Management System</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-3 text-center">QUICK ACCESS - DEMO ACCOUNTS</p>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDemoLogin(account)}
                  className="flex items-center justify-between px-3 py-2 text-xs bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-lg transition-colors group"
                >
                  <span className="font-medium text-gray-700 group-hover:text-primary-700">{account.name}</span>
                  <span className="text-gray-400 group-hover:text-primary-500 bg-white px-2 py-0.5 rounded border border-gray-200 group-hover:border-primary-200">
                    {account.role.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-primary-300 text-xs mt-6">
          &copy; {new Date().getFullYear()} MAIRA &amp; ADHIS ADVOCATES. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
