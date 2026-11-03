import React, { useState, useEffect } from 'react';
import { Athlete } from '../types';
import { AppStorage } from '../services/storage';
import { EditAthleteModal } from './EditAthleteModal';
import { Copy, Check, ExternalLink, UserPlus, Edit3, Link2, Trash2, AlertTriangle, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface AthleteLinksViewProps {
  onOpenPlayerView: (token: string) => void;
  appsScriptUrl?: string;
}

export const AthleteLinksView: React.FC<AthleteLinksViewProps> = ({
  onOpenPlayerView,
}) => {
  const [athletes, setAthletes] = useState<Athlete[]>(AppStorage.getAthletes());
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [deletingAthlete, setDeletingAthlete] = useState<Athlete | null>(null);

  const [syncingAthletes, setSyncingAthletes] = useState(false);
  const [syncAthletesResult, setSyncAthletesResult] = useState<{ success: boolean; message: string } | null>(null);

  // New athlete form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');

  // The link sent to players points to this Web App interface
  const webAppBase = window.location.origin + window.location.pathname;

  const refreshAthletes = () => {
    setAthletes(AppStorage.getAthletes());
  };

  useEffect(() => {
    const handleUpdate = () => refreshAthletes();
    window.addEventListener('caspiy_athlete_updated', handleUpdate);
    window.addEventListener('caspiy_athlete_deleted', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('caspiy_athlete_updated', handleUpdate);
      window.removeEventListener('caspiy_athlete_deleted', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const generatePlayerLink = (a: Athlete) => {
    return `${webAppBase}?player=${encodeURIComponent(a.accessToken)}&name=${encodeURIComponent(
      a.displayName
    )}&num=${encodeURIComponent(a.jerseyNumber)}&fn=${encodeURIComponent(
      a.firstName || ''
    )}&ln=${encodeURIComponent(a.lastName || '')}&id=${encodeURIComponent(a.athleteId)}`;
  };

  const handleCopyLink = (a: Athlete) => {
    const link = generatePlayerLink(a);
    navigator.clipboard.writeText(link);
    setCopiedToken(a.accessToken);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleAddAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !jerseyNumber) return;

    AppStorage.addAthlete({
      firstName: firstName || displayName,
      lastName: lastName || '',
      displayName,
      jerseyNumber,
    });

    refreshAthletes();
    setFirstName('');
    setLastName('');
    setDisplayName('');
    setJerseyNumber('');
    setShowAddModal(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingAthlete) return;
    AppStorage.deleteAthlete(deletingAthlete.athleteId);
    refreshAthletes();
    setDeletingAthlete(null);
  };

  const handleSyncAthletesToSheets = async () => {
    setSyncingAthletes(true);
    setSyncAthletesResult(null);
    try {
      const res = await AppStorage.syncAthletesToGoogleSheets();
      if (res.success) {
        setSyncAthletesResult({
          success: true,
          message:
            (res.result && typeof res.result === 'object' && res.result.message) ||
            `Состав команды (${athletes.length} игроков) успешно синхронизирован с Google Таблицей!`,
        });
      } else {
        setSyncAthletesResult({
          success: false,
          message: res.error || 'Не удалось синхронизировать состав. Проверьте URL в разделе «Настройки».',
        });
      }
    } catch (err: any) {
      setSyncAthletesResult({
        success: false,
        message: 'Ошибка при отправке: ' + (err?.message || String(err)),
      });
    } finally {
      setSyncingAthletes(false);
      setTimeout(() => setSyncAthletesResult(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
            УПРАВЛЕНИЕ ДОСТУПОМ И СОСТАВОМ
          </span>
          <h2 className="text-xl font-bold text-white">
            Постоянные персональные ссылки игроков
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Каждый игрок команды имеет одну постоянную ссылку. Любые изменения имени или номера автоматически синхронизируются с Google Таблицей и устройствами игроков.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncAthletesToSheets}
            disabled={syncingAthletes}
            title="Передать весь отредактированный состав игроков в Google Таблицу"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingAthletes ? 'animate-spin' : ''}`} />
            <span>{syncingAthletes ? 'Синхронизация...' : 'Синхронизировать состав с Таблицей'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Добавить игрока в состав</span>
          </button>
        </div>
      </div>

      {/* Sync Result Banner */}
      {syncAthletesResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 animate-fadeIn ${
            syncAthletesResult.success
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/60 border-rose-800 text-rose-200'
          }`}
        >
          {syncAthletesResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{syncAthletesResult.message}</span>
        </div>
      )}

      {/* Athletes Links Table */}
      <div className="rounded-3xl bg-[#0c1322] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090f1b] text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Игрок (Никнэйм / ФИО)</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Постоянная ссылка</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {athletes.map((a) => {
                const fullLink = generatePlayerLink(a);
                const isCopied = copiedToken === a.accessToken;

                return (
                  <tr key={a.athleteId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-400 text-sm">
                      #{a.jerseyNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-sans text-xs">
                      {a.displayName}
                      <span className="block text-[11px] text-slate-500 font-normal">
                        {a.firstName} {a.lastName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {a.athleteId}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate">
                      <span className="select-all text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        {fullLink}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 font-sans whitespace-nowrap">
                      <button
                        onClick={() => handleCopyLink(a)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Скопировано!' : 'COPY LINK'}</span>
                      </button>

                      <button
                        onClick={() => setEditingAthlete(a)}
                        title="Редактировать имя, фамилию, номер"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 inline-flex items-center transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      </button>

                      <button
                        onClick={() => onOpenPlayerView(a.accessToken)}
                        title="Открыть анкету от лица игрока"
                        className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 inline-flex items-center transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingAthlete(a)}
                        title="Удалить игрока из состава"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 inline-flex items-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0c1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Удалить игрока?</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Вы собираетесь удалить игрока <strong>{deletingAthlete.displayName} (#{deletingAthlete.jerseyNumber})</strong>. Персональная ссылка перестанет действовать, а история мониторинга будет удалена.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingAthlete(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-900/30 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Да, удалить</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Athlete */}
      {editingAthlete && (
        <EditAthleteModal
          athlete={editingAthlete}
          onClose={() => setEditingAthlete(null)}
          onSaved={() => {
            refreshAthletes();
            setEditingAthlete(null);
          }}
          onDeleted={() => {
            refreshAthletes();
            setEditingAthlete(null);
          }}
        />
      )}

      {/* Modal: Add Athlete */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                  НОВЫЙ ИГРОК В КОМАНДУ
                </span>
                <h3 className="text-base font-bold text-white">Добавить атлета</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAthlete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Отображаемое имя (Никнэйм на форме) *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value.toUpperCase())}
                  placeholder="Например: САРСЕНГАЛИЕВ"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white font-bold uppercase focus:outline-none focus:border-blue-500"
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
                    placeholder="Аман"
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
                    placeholder="Сарсенгалиев"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Игровой номер (#) *
                </label>
                <input
                  type="text"
                  required
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  placeholder="77"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Создать и получить ссылку</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
