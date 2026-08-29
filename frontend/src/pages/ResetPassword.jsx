import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../store/uiStore';

export const ResetPassword = () => {
  const { resetToken } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword, isLoading } = useAuth();
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '', text: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
      default:
        return { score: 0, label: 'Very Weak', color: 'bg-neutral-300', text: 'text-neutral-400' };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const generateStrongPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let generated = 'Nv@';
    for (let i = 0; i < 9; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generated += '9$';
    setPassword(generated);
    setConfirmPassword(generated);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generated);
      addToast('⚡ Strong password generated & copied to clipboard!', 'success');
    } else {
      addToast('⚡ Strong password generated!', 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!resetToken) {
      setError('Reset token is missing or invalid');
      return;
    }

    try {
      await resetPassword({ token: resetToken, password });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/auth?tab=login');
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to reset password';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-black">
          Nutri<span className="italic text-muted font-normal">Vedic</span>
        </h1>
        <span className="font-mono text-[10px] uppercase text-label tracking-widest block mt-1">
          SECURE PASSWORD RECOVERY
        </span>
      </div>

      {/* Centered White Card 420px */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white border border-border rounded-card p-6 md:p-8 shadow-none"
      >
        {isSuccess ? (
          <div className="text-center py-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mb-3">
              ✓
            </div>
            <h2 className="font-serif text-2xl font-bold text-black mb-2">Password Reset!</h2>
            <p className="font-sans text-xs text-muted mb-6">
              Your password has been successfully updated. Redirecting you to the login page...
            </p>
            <Link
              to="/auth?tab=login"
              className="inline-block bg-black text-white font-mono text-xs uppercase tracking-wider py-2.5 px-6 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold text-black">Set New Password</h2>
              <p className="font-sans text-xs text-muted mt-1">
                Please create a secure password for your NutriVedic account.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Input
                  label="NEW PASSWORD"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5 mt-0.5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="font-mono text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>⚡ Auto-Suggest Strong Password</span>
                    </button>
                    {password && (
                      <span className={`font-mono text-[10px] font-bold ${passwordStrength.text}`}>
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>

                  {/* 4-Segment Strength Bar */}
                  {password && (
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full mt-0.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-full rounded-full transition-colors duration-300 ${
                            level <= passwordStrength.score ? passwordStrength.color : 'bg-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Input
                label="CONFIRM NEW PASSWORD"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="mt-2">
                {isLoading ? 'Updating Password...' : 'Reset Password'}
              </Button>

              <div className="text-center mt-2">
                <Link
                  to="/auth?tab=login"
                  className="font-mono text-[11px] text-muted hover:text-black transition-colors"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};
