import React, { useEffect, useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../feature/auth/authSlice';
import type { RootState, AppDispatch } from '../store/store';

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  autoComplete?: string;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  icon,
  rightSlot,
}: TextFieldProps) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-[0.16em]"
      >
        {label}
      </label>

      <div className="group relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
          {icon}
        </div>

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]
                     text-[15px] text-white placeholder:text-slate-600 outline-none
                     focus:bg-white/[0.06] focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10
                     transition"
        />

        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(registerUser({ email, password, name }));
    if (registerUser.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="min-h-dvh bg-[#060b18] text-white overflow-x-hidden">
      <div className="min-h-dvh flex flex-col lg:grid lg:grid-cols-2">
        {/* LEFT HERO */}
        <aside className="hidden lg:block relative overflow-hidden order-1 lg:order-2">
          <div className="absolute inset-0 bg-gradient-to-bl from-[#180a2b] via-[#090d26] to-[#060b18]" />

          {/* Softer blobs (lighter DOM) */}
          <div className="absolute -top-24 -right-24 w-[520px] h-[520px] bg-purple-600/20 blur-[140px] rounded-full animate-float" />
          <div className="absolute -bottom-24 -left-24 w-[520px] h-[520px] bg-indigo-500/14 blur-[140px] rounded-full animate-float2" />

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.06] hero-grid" />

          <div className="relative z-10 h-full p-14 xl:p-20 flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-400 to-cyan-400 ring-1 ring-white/10 shadow-2xl shadow-indigo-500/30 grid place-items-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white/90">
                LiveTrack
              </span>
            </div>

            {/* Hero copy */}
            <div className="mt-16 max-w-xl">
              <h1 className="text-[4rem] xl:text-[4.6rem] font-black leading-[0.95] tracking-tight">
                <span className="text-white">Join the</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Network.
                </span>
                <br />
              </h1>

              <p className="mt-6 text-slate-400 text-[17px] leading-[1.75] max-w-[460px]">
                Create a free account and start sharing your live location securely with friends and family in real-time.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                {[
                  { text: 'Global Network', tone: 'indigo' },
                  { text: 'Live Radar', tone: 'purple' },
                  { text: '100% Free', tone: 'cyan' },
                ].map((p) => (
                  <span
                    key={p.text}
                    className="px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide
                               bg-white/[0.04] border border-white/[0.08] backdrop-blur"
                  >
                    {p.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer proof */}
            <div className="mt-auto pt-10 text-slate-500 text-sm">
              <div className="flex -space-x-2.5 mb-2">
                {['bg-purple-500', 'bg-indigo-500', 'bg-cyan-500'].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#060b18] ${bg}`} />
                ))}
              </div>
              Join <span className="text-white font-semibold">2,000+</span> others
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL (Form) */}
        <main className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 order-2 lg:order-1 min-h-[100dvh]">
          {/* Ambient */}
          <div className="pointer-events-none absolute top-24 right-10 w-[380px] h-[380px] bg-purple-600/[0.05] blur-[120px] rounded-full" />
          <div className="pointer-events-none absolute bottom-16 left-10 w-[320px] h-[320px] bg-indigo-500/[0.04] blur-[110px] rounded-full" />

          <div className="w-full max-w-[440px] relative z-10 w-full">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-400 to-cyan-400 ring-1 ring-white/10 shadow-2xl shadow-indigo-500/25 grid place-items-center mx-auto mb-5">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                LiveTrack
              </h1>
            </div>

            {/* Card */}
            <section className="bg-[#0d1225]/80 backdrop-blur-2xl border border-white/[0.06] ring-1 ring-white/[0.03] shadow-2xl shadow-black/40 rounded-[28px] p-6 sm:p-8">
              <header className="mb-7">
                <h2 className="text-[26px] font-extrabold tracking-tight">
                  Create Account
                </h2>
                <p className="mt-2 text-slate-500 text-[15px]">
                  Start sharing your location live
                </p>
              </header>

              {success && (
                <div className="mb-6 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.08] px-4 py-4 text-sm text-emerald-300">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-xl bg-emerald-500/15 grid place-items-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-medium leading-6">Registration successful! Redirecting to login...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-2xl border border-red-500/15 bg-red-500/[0.08] px-4 py-4 text-sm text-red-300">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-xl bg-red-500/15 grid place-items-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-medium leading-6">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  icon={
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                <TextField
                  label="Email Address"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  icon={
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />

                <TextField
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
                  icon={
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  }
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  }
                />

                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full mt-2 py-4 rounded-2xl font-bold text-[15px] tracking-wide
                             bg-gradient-to-r from-purple-600 via-indigo-500 to-indigo-500
                             hover:from-purple-500 hover:via-indigo-400 hover:to-indigo-400
                             shadow-2xl shadow-indigo-600/25 hover:shadow-indigo-500/40
                             disabled:opacity-45 disabled:cursor-not-allowed
                             transition"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            </section>

            <p className="text-[14px] text-slate-500 text-center mt-8">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Register;
