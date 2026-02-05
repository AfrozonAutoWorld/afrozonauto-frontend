import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Mail, Lock, Eye, EyeOff, AlertCircle, Key } from 'lucide-react';

import { useForm } from '../hooks/useForm';
import { useAuthQuery } from '../hooks/useAuth';
import {
  resetPasswordSchema
} from '../lib/validation/auth.schema';

export function ResetPassword() {
  const router = useRouter();
  const { resetPassword } = useAuthQuery();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    schema: resetPasswordSchema,
    initialValues: {
      email: '',
      token: '',
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: async (values) => {
      if (values.newPassword !== values.confirmPassword) {
        form.setFieldError('confirmPassword', "Passwords don't match");
        return;
      }

      try {
        await resetPassword(values);
        router.push('/login');
      } catch (error) {
        console.error('Reset password failed:', error);
      }
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Car className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Afrozon</span>
              <span className="text-2xl font-light text-emerald-400">
                {' '}
                AutoGlobal
              </span>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">
            Reset Password
          </h1>
          <p className="text-gray-400">
            Enter the details sent to your email
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={form.handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.values.email}
                  onChange={form.handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${form.errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
              </div>
              {form.errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {form.errors.email}
                </p>
              )}
            </div>

            {/* Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reset Token
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="token"
                  value={form.values.token}
                  onChange={form.handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${form.errors.token ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
              </div>
              {form.errors.token && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {form.errors.token}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={form.values.newPassword}
                  onChange={form.handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${form.errors.newPassword
                    ? 'border-red-300'
                    : 'border-gray-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {form.errors.newPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {form.errors.newPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {form.isSubmitting ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-emerald-600 font-medium hover:text-emerald-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
