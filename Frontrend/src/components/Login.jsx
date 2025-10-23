import React, { useState } from 'react';
import { useAuthStore } from "../stores/authStore.js";
import { User, Lock, GraduationCap, Eye, EyeOff, Mail } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);
  const { login, isLoggingIn, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password }); // Zustand handles login and sets user
    } catch (err) {
      console.log(err);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    
    setIsSubmittingForgot(true);
    try {
      const result = await forgotPassword(forgotEmail);
      if (result.success) {
        setShowForgotPassword(false);
        setForgotEmail('');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-400 via-blue-200 via-blue-400 to-blue-600 flex items-center justify-center px-4">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to CampusBuzz</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text pointer-events-auto"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text pointer-events-auto"
                  placeholder="Enter your password"
                />
                {showPassword ? (
                  <EyeOff
                    onClick={() => setShowPassword(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                  />
                ) : (
                  <Eye
                    onClick={() => setShowPassword(true)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Forgot your password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reset Password</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForgot || !forgotEmail.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingForgot ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
