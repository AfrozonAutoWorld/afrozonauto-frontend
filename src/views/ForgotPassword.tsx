import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Mail, AlertCircle } from 'lucide-react';
import { useForm } from '../hooks/useForm';
import { forgotPasswordSchema } from '../lib/validation/auth.schema';
import { useAuthQuery } from '../hooks/useAuth';

export function ForgotPassword() {
  const router = useRouter();
  const { forgotPassword } = useAuthQuery();

  const form = useForm({
    schema: forgotPasswordSchema,
    initialValues: { email: '' },
    onSubmit: async (values) => {
      try {
        await forgotPassword(values);
        router.push('/login');
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Car className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Afrozon</span>
              <span className="text-2xl font-light text-emerald-400"> AutoGlobal</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Your Password?</h1>
          <p className="text-gray-400">Get a new one!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={form.handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={form.isSubmitting}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {form.isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending code...
                </>
              ) : (
                'Forgot Password'
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Know your password??{' '}
            <Link href="/login" className="text-emerald-600 font-medium hover:text-emerald-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}