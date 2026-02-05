import { useState } from "react";
import { AlertCircle, Lock, Mail, EyeOffIcon, Eye } from "lucide-react";
import { useAuthQuery } from "../hooks/useAuth";
import { resetPasswordSchema } from "../lib/validation/auth.schema";
import { useForm } from "../hooks/useForm";


export function ResetPassword() {
  const { resetPassword } = useAuthQuery();
  const [showPassword, setShowPassword] = useState(false);


  const form = useForm({
    schema: resetPasswordSchema,
    initialValues: { email: '', token: '', newPassword: '', confirmPassword: '' },
    onSubmit: async (values) => {
      try {
        await resetPassword(values);
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
  });


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form onSubmit={form.handleSubmit} className="space-y-5">

        <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Reset Password</h2>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-6">
              Enter the reset code sent to your email and choose a new password.
            </p>
          </div>
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
                placeholder="you@example.com"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${form.errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
            </div>
            {form.errors.email && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{form.errors.email}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="token"
                name="token"
                value={form.values.token}
                onChange={form.handleChange}
                placeholder="otp code"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${form.errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
            </div>
            {form.errors.token && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{form.errors.token}</span>
              </div>
            )}
          </div>

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
              placeholder="Enter your password"
              className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${form.errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {form.errors.newPassword && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{form.errors.newPassword}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={form.isSubmitting}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {form.isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </form>
    </div >
  );
}
