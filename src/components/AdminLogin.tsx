import React, { useState } from 'react';
import { AppStorage } from '../services/storage';
import { Shield, KeyRound, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = AppStorage.getSettings();
    const targetPassword = settings.adminPasswordHash || 'caspiy2026';

    if (password.trim() === targetPassword.trim()) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>К анкете игрока</span>
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            CASPIY FUTSAL CLUB
          </div>
          <h1 className="text-xl font-bold text-white">Вход для медицинского штаба</h1>
          <p className="text-xs text-slate-400">
            Введите пароль доступа к панели мониторинга и отчетам
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Пароль администратора
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono tracking-widest"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
            {error && (
              <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Неверный пароль. Попробуйте еще раз.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all active:scale-[0.99]"
          >
            <span>Войти в Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
