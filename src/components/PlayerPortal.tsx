import React, { useState } from 'react';
import { AppStorage } from '../services/storage';
import { Athlete } from '../types';
import { Shield, KeyRound, ArrowRight, AlertCircle, HeartPulse, CheckCircle2 } from 'lucide-react';

interface PlayerPortalProps {
  onAthleteResolved: (token: string) => void;
  onOpenAdmin: () => void;
}

export const PlayerPortal: React.FC<PlayerPortalProps> = ({
  onAthleteResolved,
  onOpenAdmin,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const code = inputCode.trim();
    if (!code) {
      setErrorMsg('Пожалуйста, введите ваш токен доступа или код');
      return;
    }

    const athlete = AppStorage.findAthleteByToken(code);
    if (athlete) {
      onAthleteResolved(athlete.accessToken);
    } else {
      setErrorMsg(
        'Код доступа не найден. Пожалуйста, проверьте правильность или перейдите по персональной ссылке от врача.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-xs">
            CF
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-wide uppercase block">
              МФК «КАСПИЙ»
            </span>
            <span className="text-[10px] text-slate-400">г. Актау · Wellness & Recovery</span>
          </div>
        </div>

        <button
          onClick={onOpenAdmin}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>Штаб / Врач</span>
        </button>
      </header>

      {/* Main Center Card */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 mx-auto flex items-center justify-center text-blue-400 mb-3 shadow-inner">
              <HeartPulse className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
              ПЕРСОНАЛЬНЫЙ ДОСТУП ИГРОКА
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ежедневный Wellness Мониторинг
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Каждый игрок команды имеет постоянную ссылку. Если вы перешли по ссылке из мессенджера, анкета откроется автоматически.
            </p>
          </div>

          {/* Token input fallback form */}
          <form onSubmit={handleEnter} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>Введите ваш персональный код доступа:</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Например: token123 или код из ссылки"
                  className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono tracking-wide"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>Открыть мою анкету</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy Note */}
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Конфиденциальность данных</span>
            </div>
            <p className="leading-relaxed">
              Ваши показатели самочувствия, мышечного состояния и сна доступны только медицинскому штабу и тренеру по физической подготовке. Другие игроки не имеют доступа к вашей анкете.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-slate-400">
        МФК «Каспий» Актау · Медицинский департамент · Часовой пояс: Asia/Aqtau (UTC+5)
      </footer>
    </div>
  );
};
