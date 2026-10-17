import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { AuthFormData } from '../../services/authService';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  authMode: AuthMode;
  onAuthModeChange: (mode: AuthMode) => void;
  loading: boolean;
  onSubmit: (formData: AuthFormData) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ authMode, onAuthModeChange, loading, onSubmit }) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    role: 'patient',
    phone: '',
    age: '',
    gender: 'male',
    joinFamily: false,
    familyId: '',
    familyName: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    let err = '';
    if (field === 'email') {
      if (!value) err = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(value)) err = 'Please enter a valid email address';
    } else if (field === 'password') {
      if (!value) err = 'Password is required';
      else if (value.length < 6) err = 'Password must be at least 6 characters';
    } else if (field === 'name' && authMode === 'signup') {
      if (!value.trim()) err = 'Full name is required';
    } else if (field === 'age' && authMode === 'signup') {
      if (!value) err = 'Age is required';
      else if (parseInt(value) <= 0 || parseInt(value) > 120) err = 'Please enter a valid age (1-120)';
    }
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    validateField('email', formData.email);
    validateField('password', formData.password);
    if (authMode === 'signup') {
      validateField('name', formData.name);
      validateField('age', formData.age);
    }
    if (errors.email || errors.password || (authMode === 'signup' && (errors.name || errors.age))) {
      return;
    }
    await onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-yellow-50/30 to-blue-50/40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-green-100/30 backdrop-blur-3xl" />
      <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-800 w-full max-w-lg transform transition-all duration-500">
        <div className="text-center mb-8">
          <div className="relative">
            <Shield className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4 drop-shadow-lg animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-emerald-700 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
            Aegis Link
          </h1>
          <p className="text-base text-gray-700 dark:text-gray-300 font-medium">Healthcare Coordination Platform</p>
        </div>

        <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
          <button
            type="button"
            onClick={() => onAuthModeChange('login')}
            className={`flex-1 min-h-[44px] py-3 text-center text-base rounded-xl transition-all duration-300 font-semibold ${
              authMode === 'login'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => onAuthModeChange('signup')}
            className={`flex-1 min-h-[44px] py-3 text-center text-base rounded-xl transition-all duration-300 font-semibold ${
              authMode === 'signup'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className={`w-full min-h-[44px] p-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                    touched.name && errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (touched.name) validateField('name', e.target.value);
                  }}
                  onBlur={(e) => handleBlur('name', e.target.value)}
                  required
                />
                {touched.name && errors.name && (
                  <p className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Age"
                    className={`w-full min-h-[44px] p-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                      touched.age && errors.age ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                    value={formData.age}
                    onChange={(e) => {
                      setFormData({ ...formData, age: e.target.value });
                      if (touched.age) validateField('age', e.target.value);
                    }}
                    onBlur={(e) => handleBlur('age', e.target.value)}
                    required
                  />
                  {touched.age && errors.age && (
                    <p className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.age}</p>
                  )}
                </div>

                <select
                  className="min-h-[44px] p-4 text-base border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <select
                className="w-full min-h-[44px] p-4 text-base border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="patient">Patient</option>
                <option value="caregiver">Caregiver</option>
                <option value="doctor">Doctor</option>
              </select>
            </>
          )}

          <div>
            <input
              type="email"
              placeholder="Email Address"
              className={`w-full min-h-[44px] p-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                touched.email && errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (touched.email) validateField('email', e.target.value);
              }}
              onBlur={(e) => handleBlur('email', e.target.value)}
              required
            />
            {touched.email && errors.email && (
              <p className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className={`w-full min-h-[44px] p-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                touched.password && errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (touched.password) validateField('password', e.target.value);
              }}
              onBlur={(e) => handleBlur('password', e.target.value)}
              required
            />
            {touched.password && errors.password && (
              <p className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 font-bold text-lg shadow-lg transform active:scale-95"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : authMode === 'login' ? (
              'Login'
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-gray-800 p-4 rounded-xl">
          <p className="mb-1 font-semibold">Demo Accounts:</p>
          <p className="text-xs">patient@demo.com | caregiver@demo.com | doctor@demo.com</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
