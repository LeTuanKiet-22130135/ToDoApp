"use client";

import React, { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { requestSignupOtp, verifySignupOtp, requestPasswordResetOtp, resetPasswordWithOtp, login } from '@/lib/auth-actions';
import { useTasks } from '@/components/TaskProvider';

type AuthModalType = 'login' | 'logout' | 'changePassword' | 'forgotPassword' | 'signup' | 'otpSignup' | 'otpForgot' | 'otpChange' | 'newPassword' | null;

export default function AuthPage() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<AuthModalType>('login');
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { syncLocalToCloud, setAuth } = useTasks();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await requestSignupOtp(name, email, password);
        setActiveModal('otpSignup');
      } catch (err: any) {
        setErrorMsg(err.message);
      }
    });
  };

  const handleSignupOtpComplete = (otp: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await verifySignupOtp(email, otp);
        setAuth(true);
        await syncLocalToCloud();
        router.push('/');
      } catch (err: any) {
        setErrorMsg(err.message);
      }
    });
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await requestPasswordResetOtp(email);
        setActiveModal('otpForgot');
      } catch (err: any) {
        setErrorMsg(err.message);
      }
    });
  };

  const handleForgotOtpComplete = (otp: string) => {
    // For forgot password, we just store the otp temporarily until they enter new password
    // Wait, the API verifies in one go: resetPasswordWithOtp(email, otp, newPassword)
    // So we need to store the OTP in state and move to 'newPassword' modal
    setTempOtp(otp);
    setActiveModal('newPassword');
  };

  const [tempOtp, setTempOtp] = useState('');

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await resetPasswordWithOtp(email, tempOtp, password);
        setActiveModal('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTempOtp('');
      } catch (err: any) {
        setErrorMsg(err.message);
      }
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await login(email, password);
        setAuth(true);
        await syncLocalToCloud();
        router.push('/');
      } catch (err: any) {
        setErrorMsg(err.message);
      }
    });
  };


  const OtpInputs = ({ onComplete }: { onComplete: (otp: string) => void }) => {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleInput = (e: React.FormEvent<HTMLInputElement>, index: number) => {
      const val = e.currentTarget.value;
      if (val.length === 1) {
        if (index < 5) inputsRef.current[index + 1]?.focus();
        
        // Check if all filled
        const allVals = inputsRef.current.map(i => i?.value).join('');
        if (allVals.length === 6) {
          onComplete(allVals);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace' && e.currentTarget.value === '' && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    };

    return (
      <div className="flex gap-2 justify-between mb-6">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            type="text"
            maxLength={1}
            onInput={(e) => handleInput(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={isPending}
            className="flex-1 h-12 text-center rounded-xl border border-slate-200 bg-white text-lg font-bold focus:ring-2 focus:ring-brand-500 outline-none transition min-w-0"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#fafafa]">
      
      {/* Login Modal */}
      <Modal isOpen={activeModal === 'login'} onClose={() => {}} size="sm">
        <div className="p-8">
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-slate-900">Welcome Back</h4>
            <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
          </div>
          <form onSubmit={handleLoginSubmit}>
            {errorMsg && <p className="text-sm text-red-500 mb-3 text-center">{errorMsg}</p>}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" disabled={isPending} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <button type="button" onClick={() => {setErrorMsg(null); setActiveModal('forgotPassword');}} className="text-xs font-medium text-brand-600 hover:text-brand-800">Forgot?</button>
              </div>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" disabled={isPending} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
            </div>
            <button type="submit" disabled={isPending} className="block w-full mt-6 rounded-xl py-2.5 text-sm font-semibold bg-brand-900 hover:bg-brand-800 text-white transition shadow-sm text-center disabled:opacity-50">{isPending ? 'Signing in...' : 'Sign In'}</button>
            <div className="mt-4 text-center text-sm">
              <span className="text-slate-500">Don't have an account? </span>
              <button type="button" onClick={() => {setErrorMsg(null); setActiveModal('signup');}} className="font-semibold text-brand-600 hover:text-brand-800">Sign up</button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Signup Modal */}
      <Modal isOpen={activeModal === 'signup'} onClose={() => {}} size="sm">
        <div className="p-8">
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-slate-900">Create Account</h4>
            <p className="text-sm text-slate-500 mt-1">Sign up to get started</p>
          </div>
          <form onSubmit={handleSignupSubmit}>
            {errorMsg && <p className="text-sm text-red-500 mb-3 text-center">{errorMsg}</p>}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" disabled={isPending} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" disabled={isPending} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" disabled={isPending} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
            </div>
            <button type="submit" disabled={isPending} className="w-full mt-6 rounded-xl py-2.5 text-sm font-semibold bg-brand-900 hover:bg-brand-800 text-white transition shadow-sm disabled:opacity-50">{isPending ? 'Sending OTP...' : 'Sign Up'}</button>
            <div className="mt-4 text-center text-sm">
              <span className="text-slate-500">Already have an account? </span>
              <button type="button" onClick={() => {setErrorMsg(null); setActiveModal('login');}} className="font-semibold text-brand-600 hover:text-brand-800">Sign In</button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal isOpen={activeModal === 'forgotPassword'} onClose={() => {}} size="sm">
        <div className="p-8">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4">
            <i className="fa-regular fa-envelope text-xl"></i>
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-2">Reset Password</h4>
          <p className="text-sm text-slate-500 mb-6">Enter your email address and we'll send you an OTP to reset your password.</p>
          
          <form onSubmit={handleForgotSubmit}>
            {errorMsg && <p className="text-sm text-red-500 mb-3">{errorMsg}</p>}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" disabled={isPending} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
            </div>
            <button type="submit" disabled={isPending} className="w-full rounded-xl py-2.5 text-sm font-semibold bg-brand-900 hover:bg-brand-800 text-white transition shadow-sm mb-3 disabled:opacity-50">{isPending ? 'Sending OTP...' : 'Send OTP'}</button>
            <button type="button" onClick={() => {setErrorMsg(null); setActiveModal('login');}} className="w-full rounded-xl py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Back to Login</button>
          </form>
        </div>
      </Modal>

      {/* OTP Signup Modal */}
      <Modal isOpen={activeModal === 'otpSignup'} onClose={() => {}} size="sm">
        <div className="p-8">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4">
            <i className="fa-solid fa-mobile-screen-button text-xl"></i>
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-2">Verify Account</h4>
          <p className="text-sm text-slate-500 mb-6">Enter the 6-digit code sent to <strong>{email}</strong>.</p>
          
          {errorMsg && <p className="text-sm text-red-500 mb-3">{errorMsg}</p>}
          <OtpInputs onComplete={handleSignupOtpComplete} />
          
          <div className="text-center text-sm">
            <button type="button" className="font-semibold text-brand-600 hover:text-brand-800">Resend Code</button>
          </div>
        </div>
      </Modal>

      {/* OTP Forgot Password Modal */}
      <Modal isOpen={activeModal === 'otpForgot'} onClose={() => {}} size="sm">
        <div className="p-8">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4">
            <i className="fa-solid fa-mobile-screen-button text-xl"></i>
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-2">Check your email</h4>
          <p className="text-sm text-slate-500 mb-6">We've sent a 6-digit code to reset your password. Enter it below.</p>
          
          {errorMsg && <p className="text-sm text-red-500 mb-3">{errorMsg}</p>}
          <OtpInputs onComplete={handleForgotOtpComplete} />
          
          <div className="text-center text-sm">
            <button type="button" className="font-semibold text-brand-600 hover:text-brand-800">Resend Code</button>
          </div>
        </div>
      </Modal>

      {/* New Password Modal */}
      <Modal isOpen={activeModal === 'newPassword'} onClose={() => {}} size="sm">
        <div className="p-8">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4">
            <i className="fa-solid fa-lock text-xl"></i>
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-2">Set new password</h4>
          <p className="text-sm text-slate-500 mb-6">Create a new password for your account.</p>
          
          <form onSubmit={handleNewPasswordSubmit}>
            {errorMsg && <p className="text-sm text-red-500 mb-3">{errorMsg}</p>}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isPending} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
              <p className="text-[11px] text-slate-500 mt-1">Must be at least 8 characters.</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isPending} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
            </div>
            <button type="submit" disabled={isPending} className="w-full rounded-xl py-2.5 text-sm font-semibold bg-brand-900 hover:bg-brand-800 text-white transition shadow-sm mb-3 disabled:opacity-50">{isPending ? 'Updating...' : 'Reset Password'}</button>
            <button type="button" onClick={() => {setErrorMsg(null); setActiveModal('login');}} className="w-full rounded-xl py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Back to Login</button>
          </form>
        </div>
      </Modal>

    </div>
  );
}
