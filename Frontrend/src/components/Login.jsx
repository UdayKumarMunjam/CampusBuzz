import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from "../stores/authStore.js";
import { User, Lock, GraduationCap, Eye, EyeOff, Mail, Sparkles, Zap, Shield } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);
  const { login, isLoggingIn, forgotPassword } = useAuthStore();

  // Create floating particles
  useEffect(() => {
    const createParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
      setParticles(newParticles);
    };

    createParticles();
    
    // Animate particles
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x + particle.speedX;
        let newY = particle.y + particle.speedY;

        // Wrap around screen edges
        if (newX > window.innerWidth) newX = 0;
        else if (newX < 0) newX = window.innerWidth;

        if (newY > window.innerHeight) newY = 0;
        else if (newY < 0) newY = window.innerHeight;

        return {
          ...particle,
          x: newX,
          y: newY,
        };
      }));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center px-4 relative overflow-hidden"
    >
      <Toaster position="top-right" reverseOrder={false} />

      {/* Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-purple-400 rounded-full animate-pulse"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}
      </div>

      {/* Interactive Background Glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1), transparent 40%)`,
        }}
      />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Animated Header */}
        <div className="text-center transform transition-all duration-1000 hover:scale-105">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/25 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            <GraduationCap className="h-10 w-10 text-white relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-2 animate-pulse">
            Welcome Back
          </h2>
          <p className="text-purple-300 text-lg">Ready to dive into CampusBuzz?</p>
        </div>

        <div className="bg-black/20 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="group">
                <label 
                  htmlFor="email" 
                  className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                    emailFocused ? 'text-purple-300 scale-105' : 'text-purple-200'
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-300 ${
                    emailFocused ? 'text-purple-300 scale-110' : 'text-purple-400'
                  }`} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className={`pl-10 block w-full px-3 py-4 bg-black/30 border rounded-lg placeholder-purple-400 text-white focus:outline-none transition-all duration-300 transform ${
                      emailFocused 
                        ? 'border-purple-400 ring-2 ring-purple-500/50 scale-105 bg-black/40' 
                        : 'border-purple-500/30 hover:border-purple-500/50'
                    }`}
                    placeholder="Enter your email"
                  />
                  {emailFocused && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg pointer-events-none animate-pulse"></div>
                  )}
                </div>
              </div>

            <div className="group">
              <label 
                htmlFor="password" 
                className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                  passwordFocused ? 'text-purple-300 scale-105' : 'text-purple-200'
                }`}
              >
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-300 ${
                  passwordFocused ? 'text-purple-300 scale-110' : 'text-purple-400'
                }`} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`pl-10 pr-12 block w-full px-3 py-4 bg-black/30 border rounded-lg placeholder-purple-400 text-white focus:outline-none transition-all duration-300 transform ${
                    passwordFocused 
                      ? 'border-purple-400 ring-2 ring-purple-500/50 scale-105 bg-black/40' 
                      : 'border-purple-500/30 hover:border-purple-500/50'
                  }`}
                  placeholder="Enter your password"
                />
                {showPassword ? (
                  <EyeOff
                    onClick={() => setShowPassword(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400 cursor-pointer hover:text-purple-300 hover:scale-110 transition-all duration-200"
                  />
                ) : (
                  <Eye
                    onClick={() => setShowPassword(true)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400 cursor-pointer hover:text-purple-300 hover:scale-110 transition-all duration-200"
                  />
                )}
                {passwordFocused && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg pointer-events-none animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              <span className="relative z-10">Forgot  password?</span>
              <div className="absolute inset-0 bg-purple-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-purple-500/40 transform hover:scale-105 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center space-x-2">
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                </>
              )}
            </span>
          </button>
        </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-black/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-purple-500/20 transform animate-slideUp">
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">Reset Password</h3>
              <p className="text-purple-300 text-sm">
                Enter your email address and we'll send you a  link to reset your password.
              </p>
            </div>
            
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-purple-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10 block w-full px-3 py-3 bg-black/30 border border-purple-500/30 rounded-lg placeholder-purple-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
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
                  className="flex-1 px-4 py-3 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-600/70 transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForgot || !forgotEmail.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                >
                  {isSubmittingForgot ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Magic Link'
                  )}
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
