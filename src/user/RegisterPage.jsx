import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../baseurl';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  
    const handleSubmit = async () => {
      // Validation
      if (!email || !password || !confirmPassword) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (!agreeTerms) {
        toast.error('Please agree to the Terms of Service and Privacy Policy');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`${BASE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token in localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          toast.success('Registration successful!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Redirect to dashboard after toast is visible
          setTimeout(() => {
            navigate('/dashboard');
          }, 2500);
        } else {
          toast.error(data.error || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        toast.error('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <>
        <ToastContainer />
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Branding */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full"></div>
              </div>
              
              <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-4">Enrichify Data</h1>
                <div className="bg-white bg-opacity-90 rounded-lg p-3 mb-4 inline-block">
    <img
      src="./logo.png"
      alt="Enrichify Data Logo"
      className="h-16 w-auto object-contain"
    />
  </div>
                <p className="text-xl mb-8">The All-In-One Data Enrichment Tool</p>
                
                <div className="space-y-6 mb-12">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold mb-1">30-Day Free Trial</h3>
                      <p className="text-blue-100 text-sm">No credit card required</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold mb-1">Instant Access</h3>
                      <p className="text-blue-100 text-sm">Start enriching data immediately</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold mb-1">Cancel Anytime</h3>
                      <p className="text-blue-100 text-sm">No long-term commitment</p>
                    </div>
                  </div>
                </div>
  
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <p className="text-sm italic">"We doubled our lead generation with better insights. The team was professional and truly delivered!"</p>
                  <p className="text-sm font-semibold mt-2">- John R., Sales Director</p>
                </div>
              </div>
            </div>
  
            {/* Right Side - Register Form */}
            <div className="p-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-600 mb-6">Start your 30-day free trial</p>
  
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
  
                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="register-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
  
                <div>
                  <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="register-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
  
                <label className="flex items-start cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1" 
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Terms of Service</span> and <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Privacy Policy</span>
                  </span>
                </label>
  
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
  
                <p className="text-center text-sm text-gray-600 mt-6">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/')}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  };

export default RegisterPage;