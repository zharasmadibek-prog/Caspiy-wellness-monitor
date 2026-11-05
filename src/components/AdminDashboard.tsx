import React, { useState, useEffect } from 'react';
import { Athlete, DailyWellness, ReportSettings } from '../types';
import { AppStorage } from '../services/storage';
import { formatRussianDate, getAlmatyDate, formatShortDate } from '../utils/date';
import { AthleteProfileModal } from './AthleteProfileModal';
import { DailyReportView } from './DailyReportView';
import { AthleteLinksView } from './AthleteLinksView';
import { MedicalRehabView } from './MedicalRehabView';
import { GasSetupModal } from './GasSetupModal';
import { SettingsModal } from './SettingsModal';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  TrendingUp,
  Copy,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileSpreadsheet,
  Link2,
  Activity,
  Sliders,
  LogOut,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onOpenPlayerView: (token: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onOpenPlayerView,
}) => {
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'report' | 'links' | 'medical' | 'guide' | 'settings'
  >('dashboard');

  const [selectedDate, setSelectedDate] = useState<string>(getAlmatyDate());
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [copiedReminder, setCopiedReminder] = useState(false);
  const [settings, setSettings] = useState<ReportSettings>(AppStorage.getSettings());
  const [version, setVersion] = useState<number>(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(
    new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  const athletes = AppStorage.getAthletes();
  const records = AppStorage.getDailyWellness(selectedDate);

  const refreshData = async () => {
    await AppStorage.syncFromServer();
    setSettings(AppStorage.getSettings());
    setVersion((v) => v + 1);
    setLastUpdatedTime(
      new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  };

  // Real-time synchronization: immediately updates medical staff dashboard when player submits form
  useEffect(() => {
    // Initial fetch from server
    refreshData();

    const handleDataChanged = () => {
      refreshData();
    };

    window.addEventListener('caspiy_wellness_saved', handleDataChanged);
    window.addEventListener('caspiy_athlete_updated', handleDataChanged);
    window.addEventListener('caspiy_athlete_deleted', handleDataChanged);
    window.addEventListener('storage', handleDataChanged);
    window.addEventListener('focus', handleDataChanged);

    // Auto-polling interval every 4 seconds to catch any submissions from player devices in real-time
    const intervalId = setInterval(handleDataChanged, 4000);

    return () => {
      window.removeEventListener('caspiy_wellness_saved', handleDataChanged);
      window.removeEventListener('caspiy_athlete_updated', handleDataChanged);
      window.removeEventListener('caspiy_athlete_deleted', handleDataChanged);
      window.removeEventListener('storage', handleDataChanged);
      window.removeEventListener('focus', handleDataChanged);
      clearInterval(intervalId);
    };
  }, []);

  const totalAthletes = athletes.length;
  const completedAthletesCount = records.length;
  const completionPercentage = totalAthletes > 0
    ? Math.round((completedAthletesCount / totalAthletes) * 100)
    : 0;

  // Average wellness
  const avgWellness = completedAthletesCount > 0
    ? Math.round(records.reduce((acc, r) => acc + r.wellnessPercent, 0) / completedAthletesCount)
    : 0;

  // Medical reviews count (RED + ORANGE)
  const medicalReviewCount = records.filter(
    (r) => r.status === 'RED' || r.status === 'ORANGE'
  ).length;

  // Missing athletes
  const missingAthletes = athletes.filter(
    (a) => !records.some((r) => r.athleteId === a.athleteId)
  );

  const handleCopyReminder = () => {
    const text = 'Ребята, кто еще не заполнил сегодняшний wellness, пожалуйста, заполните.';
    navigator.clipboard.writeText(text);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2500);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(getAlmatyDate());
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Bar Contract (3 Zones) */}
      <header className="sticky top-0 z-40 bg-[#090f1b]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm">
              CF
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white uppercase block leading-tight">
                CASPIY ATHLETE MONITORING
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Medical & Performance Staff · Asia/Aqtau (Актау, UTC+5)
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Segmented Control */}
          <nav className="hidden xl:flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Команда
            </button>
            <button
              onClick={() => setCurrentTab('report')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'report'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Отчет тренеру
            </button>
            <button
              onClick={() => setCurrentTab('links')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'links'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ссылки игроков
            </button>
            <button
              onClick={() => setCurrentTab('medical')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'medical'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Реабилитация / Нагрузка
            </button>
            <button
              onClick={() => setCurrentTab('guide')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'guide'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Apps Script
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Настройки
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2">
            {/* Google Sheets Live Status */}
            {settings.appsScriptUrl ? (
              <button
                onClick={() => setCurrentTab('settings')}
                title="Google Sheets прикреплен: данные игроков передаются автоматически в одну и ту же таблицу каждый день"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-700/60 text-emerald-300 text-xs font-medium transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sheets подключен</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('settings')}
                title="Нажмите чтобы прикрепить Google Таблицу"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-700/60 text-amber-300 text-xs font-medium transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Sheets: не прикреплен</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsManualRefreshing(true);
                refreshData();
                setTimeout(() => setIsManualRefreshing(false), 600);
              }}
              title={`Обновлено в ${lastUpdatedTime}. Нажмите для принудительного обновления.`}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isManualRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Обновить</span>
              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">{lastUpdatedTime}</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="xl:hidden bg-[#090f1b] border-b border-slate-800 px-3 py-2 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-medium">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
            currentTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Команда
        </button>
        <button
          onClick={() => setCurrentTab('report')}
          className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
            currentTab === 'report' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Отчет тренеру
        </button>
        <button
          onClick={() => setCurrentTab('links')}
          className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
            currentTab === 'links' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Ссылки игроков
        </button>
        <button
          onClick={() => setCurrentTab('medical')}
          className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
            currentTab === 'medical' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Реабилитация
        </button>
        <button
          onClick={() => setCurrentTab('guide')}
          className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
            currentTab === 'guide' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Google Apps Script
        </button>
        <button
          onClick={() => setCurrentTab('settings')}
          className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
            currentTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Настройки
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex-1 w-full space-y-6">
        {currentTab === 'dashboard' && (
          <>
            {/* Top Date Filter & Navigation Bar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                    ВЫБОР ДАТЫ МОНИТОРИНГА (АКТАУ)
                  </span>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <span>{formatRussianDate(selectedDate)}</span>
                    {selectedDate === getAlmatyDate() && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-[10px] text-emerald-400 font-bold">
                        СЕГОДНЯ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Date Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevDay}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                  title="Предыдущий день"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
                />

                <button
                  onClick={handleNextDay}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                  title="Следующий день"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToday}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors ml-1"
                >
                  Сегодня
                </button>
              </div>
            </div>

            {/* KPI Cards (Matches Prompt Spec) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* 1. Количество игроков */}
              <div className="p-4 rounded-3xl bg-[#0c1322] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Игроков</span>
                  <Users className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {totalAthletes}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  В активном составе
                </div>
              </div>

              {/* 2. Заполнили */}
              <div className="p-4 rounded-3xl bg-[#0c1322] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Заполнили</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-blue-400 font-mono mt-1">
                  {completedAthletesCount} / {totalAthletes}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Чек-ины за дату
                </div>
              </div>

              {/* 3. Completion */}
              <div className="p-4 rounded-3xl bg-[#0c1322] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Completion</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {completionPercentage}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Охват команды
                </div>
              </div>

              {/* 4. Medical Review */}
              <div className="p-4 rounded-3xl bg-[#0c1322] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Medical Review</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                  {medicalReviewCount}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Требуют осмотра / внимания
                </div>
              </div>

              {/* 5. Средний Wellness */}
              <div className="col-span-2 lg:col-span-1 p-4 rounded-3xl bg-[#0c1322] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Средний Wellness</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-blue-400 font-mono mt-1">
                  {avgWellness}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Цель: $\ge$ 80%
                </div>
              </div>
            </div>

            {/* Block: Missing Check-ins (Matches Prompt Spec) */}
            {missingAthletes.length > 0 && (
              <div className="p-4 sm:p-5 rounded-3xl bg-amber-950/20 border border-amber-800/40 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      MISSING CHECK-INS · НЕ ЗАПОЛНИЛИ ({missingAthletes.length})
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 flex flex-wrap items-center gap-2 pt-0.5">
                    {missingAthletes.map((a) => (
                      <span
                        key={a.athleteId}
                        className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-200 font-bold text-xs"
                      >
                        {a.displayName} #{a.jerseyNumber}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCopyReminder}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                    copiedReminder
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                  }`}
                >
                  {copiedReminder ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedReminder ? 'Текст скопирован!' : 'COPY REMINDER'}</span>
                </button>
              </div>
            )}

            {/* Team Table (Matches Prompt Spec) */}
            <div className="rounded-3xl border border-slate-800 overflow-hidden bg-[#0c1322]">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase tracking-wider">
                    Таблица команды (Team Table)
                  </span>
                  <span className="text-slate-400">· Нажмите на строку игрока для просмотра трендов</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> GREEN
                  </span>
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" /> YELLOW
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> ORANGE
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> RED
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#090f1b] text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Игрок</th>
                      <th className="py-3 px-2 text-center">Номер</th>
                      <th className="py-3 px-2 text-center">Sleep</th>
                      <th className="py-3 px-2 text-center">Fatigue</th>
                      <th className="py-3 px-2 text-center">Muscle Soreness</th>
                      <th className="py-3 px-2 text-center">Mood</th>
                      <th className="py-3 px-2 text-center">Stress</th>
                      <th className="py-3 px-3 text-center">Wellness</th>
                      <th className="py-3 px-2 text-center">Pain</th>
                      <th className="py-3 px-3">Pain Location</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono">
                    {athletes.map((athlete) => {
                      const record = records.find((r) => r.athleteId === athlete.athleteId);

                      if (!record) {
                        return (
                          <tr
                            key={athlete.athleteId}
                            onClick={() => setSelectedAthlete(athlete)}
                            className="hover:bg-slate-800/30 cursor-pointer opacity-70"
                          >
                            <td className="py-3 px-4 font-bold text-white font-sans text-xs">
                              {athlete.displayName}
                            </td>
                            <td className="py-3 px-2 text-center text-slate-500">
                              {athlete.jerseyNumber}
                            </td>
                            <td colSpan={7} className="py-3 px-2 text-center text-slate-500 font-sans italic text-xs">
                              Не заполнено на {formatShortDate(selectedDate)}
                            </td>
                            <td className="py-3 px-3 text-slate-600">—</td>
                            <td className="py-3 px-4 text-right font-sans">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                                MISSING
                              </span>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={athlete.athleteId}
                          onClick={() => setSelectedAthlete(athlete)}
                          className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-white font-sans text-xs flex items-center gap-2">
                            <span>{record.playerName}</span>
                          </td>
                          <td className="py-3 px-2 text-center text-blue-400 font-bold">
                            {record.jerseyNumber}
                          </td>
                          <td className="py-3 px-2 text-center text-slate-300">{record.sleep}</td>
                          <td className="py-3 px-2 text-center text-slate-300">{record.fatigue}</td>
                          <td className="py-3 px-2 text-center text-slate-300">{record.muscleSoreness}</td>
                          <td className="py-3 px-2 text-center text-slate-300">{record.mood}</td>
                          <td className="py-3 px-2 text-center text-slate-300">{record.stress}</td>
                          <td className="py-3 px-3 text-center font-extrabold text-blue-400">
                            {record.wellnessPercent}%
                          </td>
                          <td className="py-3 px-2 text-center">
                            {record.painPresent ? (
                              <span className={`font-bold ${record.painIntensity >= 4 ? 'text-rose-400' : 'text-amber-400'}`}>
                                {record.painIntensity}
                              </span>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-sans text-[11px] truncate max-w-[120px]">
                            {record.painLocation || '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-sans">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                                record.status === 'RED'
                                  ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                                  : record.status === 'ORANGE'
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                  : record.status === 'YELLOW'
                                  ? 'bg-yellow-950/60 text-yellow-300 border-yellow-800'
                                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {currentTab === 'report' && (
          <DailyReportView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            settings={settings}
          />
        )}

        {currentTab === 'links' && (
          <AthleteLinksView
            onOpenPlayerView={onOpenPlayerView}
            appsScriptUrl={settings.appsScriptUrl}
          />
        )}

        {currentTab === 'medical' && <MedicalRehabView />}

        {currentTab === 'guide' && <GasSetupModal />}

        {currentTab === 'settings' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={(s) => setSettings(s)}
          />
        )}
      </main>

      {/* Athlete Profile Modal */}
      {selectedAthlete && (
        <AthleteProfileModal
          athlete={selectedAthlete}
          todayRecord={
            records.find((r) => r.athleteId === selectedAthlete.athleteId) || null
          }
          onClose={() => setSelectedAthlete(null)}
          onAthleteUpdated={(updated) => {
            setSelectedAthlete(updated);
            refreshData();
          }}
          onAthleteDeleted={() => {
            setSelectedAthlete(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
};
