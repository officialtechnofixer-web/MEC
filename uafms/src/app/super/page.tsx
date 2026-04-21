'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LockClosedIcon, EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState<string | null>(null);
  
  const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { 
        email, 
        password,
        role: 'admin'
      });

      if (response.requires2FA) {
        setUserIdFor2FA(response.userId);
        setShow2FA(true);
        setError(''); // Ensure error is explicitly cleared when switching to 2FA
      } else {
        setError(''); // Clear error on success
        login(response, response.token);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const el = document.getElementById(`otp-${index + 1}`);
      if (el) el.focus();
    }
  };

  const submit2FA = async () => {
    const code = otp.join('');
    if (code.length < 6) {
       setError('Please enter the full 6-digit code');
       return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await api.post('/auth/verify-2fa', {
        userId: userIdFor2FA,
        otp: code
      });
      
      setError(''); // Clear error on successful 2FA
      setShow2FA(false);
      login(response, response.token);
      } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex relative items-center justify-center min-h-screen font-sans bg-bg w-full">
      <div className="flex w-full h-screen bg-bg flex-col lg:flex-row">
        {/* Left Brand Panel */}
        <div className="hidden lg:flex w-full lg:w-[55%] bg-[#1A1A2E] text-white flex-col relative justify-center items-start px-12 lg:px-24 py-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 -mr-24 -mt-24 transform rotate-45 pointer-events-none skew-x-12"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary opacity-10 rounded-full blur-3xl pointer-events-none -mb-32 -ml-32"></div>
          <div className="z-10 mb-4">
            <Link href="/" className="text-[28px] font-bold tracking-tight mb-2 text-surface">MEC</Link>
          </div>
          <div className="z-10 mb-8 max-w-lg">
            <h1 className="text-h1 text-white mb-6">Unified Application &<br/>Facility Management System</h1>
            <p className="text-body text-gray-400">
              Replace manual student-consultancy workflows with an efficient, smart, and fully digital platform today.
            </p>
          </div>
          <div className="z-10 flex gap-4 mt-8 opacity-75">
            <div className="flex items-center text-sm font-medium"><div className="w-2 h-2 rounded-full bg-success mr-2" /> Application Tracking</div>
            <div className="flex items-center text-sm font-medium"><div className="w-2 h-2 rounded-full bg-info mr-2" /> Secure Locker</div>
            <div className="flex items-center text-sm font-medium"><div className="w-2 h-2 rounded-full bg-warning mr-2" /> Real-time Analytics</div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-[45%] bg-surface flex flex-col justify-center items-center px-8 sm:px-16 py-12 relative overflow-y-auto min-h-screen lg:min-h-0">
          <div className="w-full max-w-[400px]">
            <div className="flex lg:hidden mb-8 items-center gap-3">
               <img src="/logo.jpeg" alt="MEC Logo" className="w-10 h-10 rounded object-contain" />
               <h2 className="text-[20px] font-bold tracking-tight text-[#1A1A2E]">MEC UAFMS</h2>
            </div>
            <h2 className="text-h2 text-heading mb-2">Admin Login</h2>
            <p className="text-body text-muted mb-8">Access the Global Control Tower.</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
              {error && (
                <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm font-medium border border-danger/20">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-1.5">
                <label className="text-h4">Email Address</label>
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-h4">Password</label>
                  <button onClick={async (e) => {
                    e.preventDefault();
                    if (!email) {
                      setError("Please enter your email address to reset password.");
                      return;
                    }
                    try {
                      await api.post('/auth/forgot-password', { email });
                      alert("If an account exists, a password reset link has been sent to your email.");
                    } catch (e: any) {
                      setError(e.message || "Failed to reset password");
                    }
                  }} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Forgot password?</button>
                </div>
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all" />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full h-10 mt-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-[14px] uppercase tracking-wide flex justify-center items-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-70">
                {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRightIcon className="w-4 h-4" />
              </button>
              
              <div className="mt-5 text-center text-[13px] font-medium text-muted">
                Don&apos;t have an account? <Link href="/super/register" className="text-primary font-bold hover:underline pl-1 transition-all">Create one</Link>
                <div className="mt-1">
                   Looking for student portal? <Link href="/login" className="text-primary font-bold hover:underline">Back to Student Login</Link>
                </div>
              </div>
            </form>

            <div className="flex items-center my-6 gap-4">
              <div className="h-px bg-border flex-1"></div>
              <span className="text-label text-muted">OR CONTINUE WITH</span>
              <div className="h-px bg-border flex-1"></div>
            </div>

            <button onClick={(e) => { e.preventDefault(); alert("Google OAuth integration requires production secrets. Please use email/password for the demo."); }} className="w-full h-10 bg-surface border border-border hover:bg-bg rounded-lg font-semibold text-[14px] text-heading flex justify-center items-center gap-3 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.74 22.37 10.04H12V14.22H17.93C17.67 15.58 16.91 16.73 15.77 17.5V20.21H19.34C21.43 18.28 22.56 15.53 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23.0001C14.97 23.0001 17.47 22.0101 19.34 20.2101L15.77 17.5001C14.76 18.1801 13.49 18.5901 12 18.5901C9.11002 18.5901 6.66002 16.6301 5.78002 14.0101H2.10002V16.8501C3.93002 20.4801 7.66002 23.0001 12 23.0001Z" fill="#34A853"/>
                <path d="M5.78002 14C5.55002 13.32 5.43002 12.61 5.43002 11.88C5.43002 11.15 5.55002 10.44 5.78002 9.75998V6.91998H2.10002C1.35002 8.41998 0.93002 10.11 0.93002 11.88C0.93002 13.65 1.35002 15.34 2.10002 16.84L5.78002 14Z" fill="#FBBC05"/>
                <path d="M12 5.40997C13.62 5.40997 15.06 5.96997 16.2 7.05997L19.41 3.84997C17.46 2.02997 14.96 0.999969 12 0.999969C7.66 0.999969 3.93 3.51997 2.1 7.14997L5.78 9.98997C6.66 7.36997 9.11 5.40997 12 5.40997Z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <div className="mt-12 pb-6">
              <div className="flex flex-col gap-2 items-center text-center">
                <p className="text-[12px] text-muted leading-tight">By continuing, you acknowledge that you have read and agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted bg-[#FDECEC] px-3 py-1 rounded-full text-danger border border-[#FDECEC] justify-center mt-2 font-medium">
                  <LockClosedIcon className="w-3 h-3" /> GDPR &amp; DPDP Act Compliant
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FA && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-heading/60 z-40 backdrop-blur-sm" onClick={() => setShow2FA(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-surface rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] p-8 max-w-sm w-full mx-4">
              <div className="flex flex-col gap-2 mb-6 items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-2">
                  <LockClosedIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-h3 text-heading">Security Verification</h3>
                <p className="text-body text-muted text-sm px-2">Enter the 6-digit code sent to your registered email address.</p>
              </div>



              <div className="flex justify-between gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} className="w-10 h-12 bg-bg border border-border rounded-lg text-center text-h3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all text-heading" />
                ))}
              </div>
              <button disabled={isLoading} className="w-full h-10 mt-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-[14px] flex justify-center items-center transition-all duration-150 active:scale-[0.98] mb-4 disabled:opacity-70" onClick={submit2FA}>
                {isLoading ? 'Verifying...' : 'Verify & Proceed'}
              </button>
              <div className="text-center mt-2">
                <p className="text-[13px] text-muted font-medium mb-1">Didn&apos;t receive the code?</p>
                <button className="text-[13px] font-semibold text-primary hover:text-primary-dark">Resend code in 00:24</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
