import React, { useState } from 'react';
import { Athlete } from '../types';
import { AppStorage } from '../services/storage';
import { X, Check, Save, Copy, User, Hash, ShieldCheck, Link2, Trash2, AlertTriangle } from 'lucide-react';

interface EditAthleteModalProps {
  athlete: Athlete;
  onClose: () => void;
  onSaved: (updated: Athlete) => void;
  onDeleted?: (athleteId: string) => void;
}

export const EditAthleteModal: React.FC<EditAthleteModalProps> = ({
  athlete,
  onClose,
  onSaved,
  onDeleted,
}) => {
  const [displayName, setDisplayName] = useState(athlete.displayName);
  const [firstName, setFirstName] = useState(athlete.firstName || '');
  const [lastName, setLastName] = useState(athlete.lastName || '');
  const [jerseyNumber, setJerseyNumber] = useState(athlete.jerseyNumber);
  const [active, setActive] = useState(athlete.active);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const baseUrl = window.location.origin + window.location.pathname;
  // Always include sync query parameters so that ANY device/browser that opens this link
  // immediately updates its local storage to the new nickname and number!
  const playerLink = `${baseUrl}?player=${encodeURIComponent(athlete.accessToken)}&name=${encodeURIComponent(
    displayName.trim()
  )}&num=${encodeURIComponent(jerseyNumber.trim())}&fn=${encodeURIComponent(
    firstName.trim()
  )}&ln=${encodeURIComponent(lastName.trim())}&id=${encodeURIComponent(athlete.athleteId)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(playerLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !jerseyNumber.trim()) return;

    const updated = AppStorage.updateAthlete(athlete.athleteId, {
      displayName: displayName.trim(),
      firstName: firstName.trim() || displayName.trim(),
      lastName: lastName.trim(),
      jerseyNumber: jerseyNumber.trim(),
      active,
    });

    if (updated) {
      setSaveSuccess(true);
      setTimeout(() => {
        onSaved(updated);
        onClose();
      }, 400);
    }
  };

  const handleDelete = () => {
    AppStorage.deleteAthlete(athlete.athleteId);
    if (onDeleted) {
      onDeleted(athlete.athleteId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0c1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm">
              #{athlete.jerseyNumber}
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                РЕДАКТИРОВАНИЕ ДАННЫХ
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                {athlete.displayName} ({athlete.athleteId})
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Delete Confirmation View */}
        {showDeleteConfirm ? (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/60 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-900/40 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Удалить игрока из состава?</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Вы собираетесь удалить <strong>{athlete.displayName} (#{athlete.jerseyNumber})</strong>. Персональная ссылка игрока перестанет действовать, а его записи будут удалены из системы.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-900/30 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Да, удалить игрока</span>
              </button>
            </div>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Отображаемое имя (никнэйм на форме / в таблицах) *</span>
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.toUpperCase())}
                placeholder="Например: АДАЙБЕК"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-blue-500 uppercase tracking-wide"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Имя
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Адайбек"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Фамилия
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Кабылбаев"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-blue-400" />
                  <span>Игровой номер (#) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  placeholder="21"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Статус в команде</span>
                </label>
                <select
                  value={active ? 'true' : 'false'}
                  onChange={(e) => setActive(e.target.value === 'true')}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="true">Активен в составе</option>
                  <option value="false">В резерве / лазарете</option>
                </select>
              </div>
            </div>

            {/* Player Personal Link Preview */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Link2 className="w-3.5 h-3.5 text-blue-400" />
                  Постоянная ссылка с новым никнэймом
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Скопировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-[10px] font-mono text-slate-400 bg-[#070b14] p-2 rounded-xl border border-slate-800 break-all select-all">
                {playerLink}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-rose-900/50 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить игрока</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saveSuccess}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all shadow-md ${
                    saveSuccess
                      ? 'bg-emerald-600'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25 active:scale-[0.99]'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Сохранено!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Сохранить</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
