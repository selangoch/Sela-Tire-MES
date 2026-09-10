import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { authService, UserSession } from '../services/authService';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  User,
  Globe,
  Activity,
  ArrowRight,
  AlertCircle,
  UserPlus,
  LogIn,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';

interface LoginPageProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentLang,
  onLanguageChange,
  onLoginSuccess,
}) => {
  const t = translations[currentLang] || translations.zh;

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginId, setLoginId] = useState<string>('733445');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Register form state
  const [regId, setRegId] = useState<string>('');
  const [regName, setRegName] = useState<string>('');
  const [regRole, setRegRole] = useState<'Operator' | 'Admin'>('Operator');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await authService.login(loginId, loginPassword);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMsg(res.error || (currentLang === 'km' ? 'ID ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!' : '账号或密码错误！'));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(currentLang === 'km' ? 'ការចូលប្រព័ន្ធបរាជ័យ សូមព្យាយាមម្តងទៀត' : '登录失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg(t.passwordsMismatch || 'ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ!');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authService.register(regId, regName, regPassword, regRole);
      if (res.success && res.session) {
        setSuccessMsg(t.registerSuccessMsg || 'ចុះឈ្មោះគណនីបានជោគជ័យ!');
        setTimeout(() => {
          onLoginSuccess(res.session!);
        }, 1000);
      } else {
        setErrorMsg(res.error || (currentLang === 'km' ? 'ការចុះឈ្មោះបរាជ័យ!' : '注册失败！'));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(currentLang === 'km' ? 'មានបញ្ហាក្នុងការចុះឈ្មោះ' : '注册发生错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-between items-center relative overflow-hidden select-none font-sans">
      {/* Background Subtle Tech Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Language Toggle & System Status */}
      <header className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0e3a6b] border border-blue-400/30 flex items-center justify-center text-white font-extrabold text-base shadow-md">
            ST
          </div>
          <div>
            <h1 className="text-white font-bold text-sm sm:text-base tracking-wide flex items-center gap-2">
              Sela Tire MES
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono font-medium">
                v2.5 Enterprise
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {currentLang === 'km'
                ? 'ប្រព័ន្ធគ្រប់គ្រងផលិតកម្មកង់ឡាន Sela Tire MES'
                : currentLang === 'en'
                ? 'Sela Tire Manufacturing Execution System'
                : '赛拉轮胎 MES 智能生产制造管理系统'}
            </p>
          </div>
        </div>

        {/* Language Selection Buttons */}
        <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 p-1 rounded-lg backdrop-blur-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          <button
            type="button"
            onClick={() => onLanguageChange('zh')}
            className={`px-2 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
              currentLang === 'zh'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            中文
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
              currentLang === 'en'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('km')}
            className={`px-2 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
              currentLang === 'km'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            ខ្មែរ
          </button>
        </div>
      </header>

      {/* Center Main Card */}
      <main className="w-full max-w-md px-4 py-6 z-10 my-auto">
        <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden transition-all">
          {/* Card Header Banner */}
          <div className="bg-gradient-to-r from-[#0e3a6b] via-blue-900 to-[#0e3a6b] p-5 text-white text-center relative border-b border-blue-500/20">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 mx-auto mb-2.5 flex items-center justify-center text-amber-300 shadow-inner">
              {mode === 'login' ? <ShieldCheck className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {mode === 'login'
                ? currentLang === 'km'
                  ? 'ការផ្ទៀងផ្ទាត់ការចូល MES'
                  : currentLang === 'en'
                  ? 'Sela Tire MES Login'
                  : 'Sela Tire MES 登录'
                : currentLang === 'km'
                ? 'ការចុះឈ្មោះគណនីថ្មី MES'
                : currentLang === 'en'
                ? 'Register New MES Account'
                : '注册新 MES 账号'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {mode === 'login'
                ? currentLang === 'km'
                  ? 'សូមបញ្ចូល ID និងពាក្យសម្ងាត់ដើម្បីចូលប្រើប្រាស់'
                  : currentLang === 'en'
                  ? 'Enter User ID and Password to access MES'
                  : '请输入用户 ID 和密码登录 MES 系统'
                : currentLang === 'km'
                ? 'បង្កើតគណនីថ្មីសម្រាប់ប្រតិបត្តិការផលិតកម្ម'
                : currentLang === 'en'
                ? 'Create a new account for production operations'
                : '创建新账户以访问生产管理系统'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Login vs Register) */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-900/90 border-b border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.loginTab || (currentLang === 'km' ? 'ចូលប្រើប្រាស់' : '登录系统')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.registerTab || (currentLang === 'km' ? 'ចុះឈ្មោះថ្មី' : '注册新账号')}</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Feedback Notifications */}
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs rounded-xl p-3 mb-4 flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl p-3 mb-4 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{successMsg}</span>
              </div>
            )}

            {mode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* User ID Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {currentLang === 'km'
                        ? 'ID / ឈ្មោះអ្នកប្រើ'
                        : currentLang === 'en'
                        ? 'User ID'
                        : 'ID / 用户ID'}
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="733445"
                    className="w-full bg-slate-900/90 border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Password Input (Masked) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {currentLang === 'km'
                        ? 'ពាក្យសម្ងាត់'
                        : currentLang === 'en'
                        ? 'Password'
                        : '密码'}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="•••••••••"
                      className="w-full bg-slate-900/90 border border-slate-600 rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group text-sm mt-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isSubmitting
                      ? currentLang === 'km'
                        ? 'កំពុងផ្ទៀងផ្ទាត់...'
                        : 'Authenticating...'
                      : currentLang === 'km'
                      ? 'ចូលប្រើប្រាស់ MES'
                      : currentLang === 'en'
                      ? 'Login to MES'
                      : '登录 MES 系统'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Switch to Register link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg(null);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-medium"
                  >
                    {t.noAccountYet || (currentLang === 'km' ? 'មិនទាន់មានគណនី? ចុះឈ្មោះថ្មី' : '没有账号？立即注册')} →
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTER FORM (ចុះឈ្មោះថ្មី) */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* User ID / Account ID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {currentLang === 'km'
                        ? 'ID / ឈ្មោះគណនី'
                        : currentLang === 'en'
                        ? 'User ID'
                        : 'ID / 账户ID'}
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    placeholder="e.g. sela01, 733446"
                    className="w-full bg-slate-900/90 border border-slate-600 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Display Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.fullName || (currentLang === 'km' ? 'ឈ្មោះពេញ / ឈ្មោះបង្ហាញ' : '姓名 / 显示名称')}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Sela Sok"
                    className="w-full bg-slate-900/90 border border-slate-600 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.roleLabel || (currentLang === 'km' ? 'តួនាទីអ្នកប្រើប្រាស់' : '用户角色')}</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as 'Operator' | 'Admin')}
                    className="w-full bg-slate-900/90 border border-slate-600 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Operator">{t.roleOperator || 'បុគ្គលិកប្រតិបត្តិការ (Operator)'}</option>
                    <option value="Admin">{t.roleAdmin || 'អ្នកគ្រប់គ្រង (Admin)'}</option>
                  </select>
                </div>

                {/* Password (Masked) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t.password || (currentLang === 'km' ? 'ពាក្យសម្ងាត់' : '密码')}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/90 border border-slate-600 rounded-xl pl-3.5 pr-10 py-2 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      title={showRegPassword ? 'Hide' : 'Show'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Masked) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t.confirmPassword || (currentLang === 'km' ? 'ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់' : '确认密码')}</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-600 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group text-sm mt-3 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>
                    {isSubmitting
                      ? currentLang === 'km'
                        ? 'កំពុងចុះឈ្មោះ...'
                        : 'Registering...'
                      : t.registerBtn || (currentLang === 'km' ? 'បង្កើតគណនីថ្មី' : '立即注册账号')}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Switch to Login link */}
                <div className="text-center pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer font-medium"
                  >
                    {t.alreadyHaveAccount || (currentLang === 'km' ? 'មានគណនីរួចហើយ? ចូលប្រើប្រាស់' : '已有账号？立即登录')} →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer System Info */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Sela Tire MES Server: Online & Protected</span>
        </div>
        <p>© 2026 Sela Tire Co., Ltd. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

