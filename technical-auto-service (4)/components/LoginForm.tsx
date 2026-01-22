
import React, { useState } from 'react';
import { LockIcon, SpinnerIcon } from './Icons';

interface LoginFormProps {
  onLogin: (password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    setTimeout(() => {
      if (password === '12345678') {
        onLogin(password);
      } else {
        setError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        setIsSubmitting(false);
      }
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] border border-slate-100 p-12 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        <div className="bg-slate-950 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-slate-300">
          <LockIcon className="w-12 h-12 text-blue-400" />
        </div>
        
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">เข้าสู่ระบบเจ้าหน้าที่</h3>
          <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">Restricted Admin Area</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Security Access Code</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-8 py-6 bg-slate-50 border-2 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 outline-none transition-all text-2xl text-center font-bold tracking-[0.5em] ${
                error ? 'border-rose-200 text-rose-500 bg-rose-50/30' : 'border-slate-50 focus:border-blue-500 focus:bg-white'
              }`}
              placeholder="••••••••"
              required
              autoFocus
            />
            {error && <p className="text-rose-500 text-xs font-bold text-center animate-shake mt-4">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-6 rounded-[1.5rem] text-white font-bold text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.97] ${
              isSubmitting ? 'bg-slate-400' : 'bg-slate-950 hover:bg-slate-900 shadow-slate-200'
            }`}
          >
            {isSubmitting ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : null}
            {isSubmitting ? 'กำลังตรวจสอบ...' : 'ยืนยันเพื่อเข้าใช้ระบบ'}
          </button>
        </form>
        
        <div className="mt-14 pt-10 border-t border-slate-50 text-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
