import React, { useState } from 'react';
import { ReportSettings } from '../types';
import { AppStorage } from '../services/storage';
import { Save, RotateCcw, Shield, Link2, Sliders, Check, RefreshCw, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  settings: ReportSettings;
  onUpdateSettings: (newSettings: ReportSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<ReportSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [syncingAll, setSyncingAll] = useState(false);
  const [syncAllResult, setSyncAllResult] = useState<{ success: boolean; message: string } | null>(null);

  const [syncingAthletes, setSyncingAthletes] = useState(false);
  const [syncAthletesMsg, setSyncAthletesMsg] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    AppStorage.updateSettings(formData);
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSyncAthletesOnly = async () => {
    const url = formData.appsScriptUrl?.trim();
    if (!url) {
      setSyncAthletesMsg({ success: false, message: 'Сначала укажите URL скрипта' });
      return;
    }
    setSyncingAthletes(true);
    setSyncAthletesMsg(null);

    // Save settings first
    AppStorage.updateSettings(formData);
    onUpdateSettings(formData);

    try {
      const res = await AppStorage.syncAthletesToGoogleSheets();
      if (res.success) {
        setSyncAthletesMsg({
          success: true,
          message:
            (res.result && typeof res.result === 'object' && res.result.message) ||
            'Отредактированный состав игроков успешно передан в Google Таблицу (лист ATHLETES)!',
        });
      } else {
        setSyncAthletesMsg({
          success: false,
          message: res.error || 'Не удалось синхронизировать состав игроков.',
        });
      }
    } catch (err: any) {
      setSyncAthletesMsg({
        success: false,
        message: 'Ошибка при отправке состава: ' + (err?.message || String(err)),
      });
    } finally {
      setSyncingAthletes(false);
    }
  };

  const handleTestConnection = async () => {
    const url = formData.appsScriptUrl?.trim();
    if (!url) {
      setTestResult({ success: false, message: 'Сначала введите URL Google Apps Script Web App' });
      return;
    }
    setTestingConnection(true);
    setTestResult(null);

    // Save settings first
    AppStorage.updateSettings(formData);
    onUpdateSettings(formData);

    try {
      const res = await AppStorage.testGoogleAppsScript(url);
      if (res.success && res.reachable) {
        setTestResult({
          success: true,
          message: 'Подключение успешно! Google Apps Script отвечает и готов к автоматическому приему данных.',
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Скрипт не ответил. Проверьте: в Apps Script при развертывании должно быть выбрано "У кого есть доступ: Все (Anyone)".',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Ошибка при проверке соединения: ' + (err?.message || String(err)),
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncAll = async () => {
    const url = formData.appsScriptUrl?.trim();
    if (!url) {
      setSyncAllResult({ success: false, message: 'Сначала укажите URL скрипта' });
      return;
    }
    setSyncingAll(true);
    setSyncAllResult(null);

    // Save settings first
    AppStorage.updateSettings(formData);
    onUpdateSettings(formData);

    try {
      const res = await AppStorage.syncAllToGoogleSheets();
      if (res.success) {
        setSyncAllResult({
          success: true,
          message: (res.result && typeof res.result === 'object' && res.result.message) || 'Все игроки и записи wellness успешно переданы в Google Таблицу!',
        });
      } else {
        setSyncAllResult({
          success: false,
          message: res.error || 'Не удалось передать данные. Проверьте URL.',
        });
      }
    } catch (err: any) {
      setSyncAllResult({
        success: false,
        message: 'Ошибка: ' + (err?.message || String(err)),
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleResetData = () => {
    AppStorage.resetToDefaultData();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-[#0c1322] border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
            КОНФИГУРАЦИЯ СИСТЕМЫ
          </span>
          <h2 className="text-xl font-bold text-white">Параметры и пороги мониторинга</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Настройки команды, пороговые значения Wellness и интеграция с Google Apps Script
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Настройки сохранены!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Google Sheets Integration URL */}
        <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Link2 className="w-4 h-4 text-emerald-400" />
              <span>Интеграция с вашей Google Таблицей (Google Apps Script)</span>
            </div>
            {formData.appsScriptUrl ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-700/50 text-emerald-400">
                URL указан
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400">
                Локальный режим
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Вставьте URL развернутого Web App из вашего скрипта Apps Script (например, <code className="text-blue-400 font-mono">https://script.google.com/macros/s/AKfycb.../exec</code>).
            Благодаря серверному прокси, каждый новый check-in с любого телефона игрока автоматически и мгновенно поступает прямо в вашу Google Таблицу и на этот сайт!
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Google Apps Script Web App URL:
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={formData.appsScriptUrl || ''}
              onChange={(e) => setFormData({ ...formData, appsScriptUrl: e.target.value })}
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Action buttons: Test connection & Sync All */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              disabled={testingConnection || !formData.appsScriptUrl}
              onClick={handleTestConnection}
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Проверка соединения...' : 'Проверить подключение'}</span>
            </button>

            <button
              type="button"
              disabled={syncingAthletes || !formData.appsScriptUrl}
              onClick={handleSyncAthletesOnly}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingAthletes ? 'animate-spin' : ''}`} />
              <span>{syncingAthletes ? 'Синхронизация...' : 'Синхронизировать состав (имена игроков)'}</span>
            </button>

            <button
              type="button"
              disabled={syncingAll || !formData.appsScriptUrl}
              onClick={handleSyncAll}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
              <span>{syncingAll ? 'Отправка данных...' : 'Экспорт / Синхронизация всех данных в Таблицу'}</span>
            </button>
          </div>

          {/* Sync athletes result message */}
          {syncAthletesMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
                syncAthletesMsg.success
                  ? 'bg-purple-950/50 border-purple-700 text-purple-200'
                  : 'bg-rose-950/50 border-rose-700 text-rose-200'
              }`}
            >
              {syncAthletesMsg.success ? (
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{syncAthletesMsg.message}</div>
            </div>
          )}

          {/* Test connection result message */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
                testResult.success
                  ? 'bg-emerald-950/50 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-700 text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* Sync all result message */}
          {syncAllResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
                syncAllResult.success
                  ? 'bg-emerald-950/50 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-700 text-rose-200'
              }`}
            >
              {syncAllResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{syncAllResult.message}</div>
            </div>
          )}

          {/* Important Deploy Note */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-200/90 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Важное требование при развертывании в Google Apps Script:</span>
            </div>
            <p>
              В окне <strong>«Новое развертывание» (New deployment)</strong> выберите:
            </p>
            <ul className="list-disc pl-5 space-y-0.5 text-amber-300/90 font-mono text-[10px]">
              <li>Запуск от имени: <strong>Меня (Execute as: Me)</strong></li>
              <li>У кого есть доступ: <strong>Все (Who has access: Anyone)</strong></li>
            </ul>
            <p className="text-[10px] text-amber-400/80">
              Если в «У кого есть доступ» оставить «Только я», Google будет отклонять автоматические запросы от игроков.
            </p>
          </div>
        </div>

        {/* 2. Team & Timezone Settings */}
        <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Данные команды и часовой пояс</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Название команды (Team Name):
              </label>
              <input
                type="text"
                required
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Часовой пояс (Timezone):
              </label>
              <input
                type="text"
                disabled
                value={formData.timezone}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Фиксировано для Казахстана: Asia/Almaty (UTC+5)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Monitoring Thresholds */}
        <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Пороговые значения статусов мониторинга</span>
          </div>
          <p className="text-xs text-slate-400">
            Изменение порогов сразу пересчитывает цветовую индикацию на Dashboard и в отчете для тренера.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-400 mb-1">
                Порог GREEN (в %):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={95}
                  value={formData.wellnessThresholdGreen}
                  onChange={(e) => setFormData({ ...formData, wellnessThresholdGreen: parseInt(e.target.value, 10) || 80 })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">По умолчанию: 80%</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-yellow-400 mb-1">
                Порог YELLOW (в %):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={40}
                  max={90}
                  value={formData.wellnessThresholdYellow}
                  onChange={(e) => setFormData({ ...formData, wellnessThresholdYellow: parseInt(e.target.value, 10) || 70 })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">По умолчанию: 70%</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-400 mb-1">
                Порог ORANGE (в %):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={30}
                  max={80}
                  value={formData.wellnessThresholdOrange}
                  onChange={(e) => setFormData({ ...formData, wellnessThresholdOrange: parseInt(e.target.value, 10) || 60 })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">По умолчанию: 60%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-amber-400 mb-1">
                Порог боли для внимания (Warning Pain):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={formData.painWarningThreshold}
                  onChange={(e) => setFormData({ ...formData, painWarningThreshold: parseInt(e.target.value, 10) || 4 })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none font-mono"
                />
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Боль $\ge$ 4 переводит статус в ORANGE</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-rose-400 mb-1">
                Порог сильной боли (Severe Pain / Review):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={4}
                  max={10}
                  value={formData.painSevereThreshold}
                  onChange={(e) => setFormData({ ...formData, painSevereThreshold: parseInt(e.target.value, 10) || 7 })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none font-mono"
                />
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Боль $\ge$ 7 требует обязательного осмотра (RED)</span>
            </div>
          </div>
        </div>

        {/* 4. Password */}
        <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Пароль администратора (Admin Dashboard)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Пароль для входа медштаба:
            </label>
            <input
              type="text"
              value={formData.adminPasswordHash || 'caspiy2026'}
              onChange={(e) => setFormData({ ...formData, adminPasswordHash: e.target.value })}
              className="w-full max-w-xs px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить настройки</span>
          </button>

          {!resetConfirm ? (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="px-4 py-2 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              Сбросить демо-данные к исходным
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400 font-semibold">Сбросить всю базу?</span>
              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold"
              >
                Да, сбросить
              </button>
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
