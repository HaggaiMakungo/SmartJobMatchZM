'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';

interface LoginFormData {
  email: string;
  password: string;
  trustDevice: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setLoading } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      trustDevice: false,
    },
  });

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
    }
  }, [setValue]);

  const password = watch('password');
  const email = watch('email');

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pass.length >= 6) strength += 33;
    if (pass.length >= 10) strength += 33;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength += 17;
    if (/[0-9]/.test(pass)) strength += 17;
    
    if (strength <= 33) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 66) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Form submission
  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.login({
        username: data.email,
        password: data.password,
      });

      setUser(response.user);

      // Remember email if trust device is checked
      if (data.trustDevice) {
        localStorage.setItem('remembered_email', data.email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setError('Password reset functionality coming soon. Please contact support.');
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Diagonal Background Split */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-gunmetal" 
          style={{
            clipPath: 'polygon(0 0, 60% 0, 40% 100%, 0 100%)'
          }}
        >
          {/* Topography Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23f2d492' fill-opacity='1'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>
        <div 
          className="absolute inset-0 bg-gray-50" 
          style={{
            clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex">
        {/* Left Brand Section */}
        <div className="w-5/12 flex items-center justify-center p-12">
          <div className="max-w-md">
            {/* Tagline */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-peach mb-6 leading-tight">
                Matching you with the best professionals on the market.
              </h1>
              <p className="text-peach/80 text-lg font-medium">
                Recruiter Dashboard
              </p>
            </div>
            
            {/* Description */}
            <div className="mt-8">
              <p className="text-peach/90 text-base leading-relaxed">
                Streamline your recruitment process with intelligent AI-powered matching and comprehensive candidate management.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="w-7/12 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gunmetal mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your recruiter account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-tangerine focus:border-transparent outline-none transition ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="recruiter@company.zm"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-tangerine focus:border-transparent outline-none transition ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && passwordFocused && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password strength</span>
                      <span className="text-xs font-medium text-gray-700">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Trust Device & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('trustDevice')}
                    className="w-4 h-4 text-tangerine border-gray-300 rounded focus:ring-tangerine cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-gray-700">Trust this device for 7 days</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-tangerine hover:text-tangerine/80 font-medium"
                  disabled={isSubmitting}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-tangerine hover:bg-tangerine/90 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
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
}
