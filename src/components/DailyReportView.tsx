import React, { useState } from 'react';
import { Athlete, DailyWellness, ReportSettings } from '../types';
import { AppStorage } from '../services/storage';
import { formatRussianDate, getAlmatyDate, formatShortDate } from '../utils/date';
import { Download, FileText, Share2, CheckCircle, Printer, HardDrive, AlertTriangle } from 'lucide-react';

interface DailyReportViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  settings: ReportSettings;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  selectedDate,
  onSelectDate,
  settings,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [driveSaving, setDriveSaving] = useState(false);
  const [driveResult, setDriveResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  const athletes = AppStorage.getAthletes();
  const records = AppStorage.getDailyWellness(selectedDate);

  const totalAthletes = athletes.length;
  const completedCount = records.length;
  const completionRate = totalAthletes > 0 ? Math.round((completedCount / totalAthletes) * 100) : 0;

  const avgWellness = completedCount > 0
    ? Math.round(records.reduce((acc, r) => acc + r.wellnessPercent, 0) / completedCount)
    : 0;

  const medicalReviews = records.filter((r) => r.status === 'RED' || r.status === 'ORANGE').length;
  const severePainCount = records.filter((r) => r.painPresent && r.painIntensity >= 4).length;

  const handleDownloadCsv = () => {
    const csvContent = AppStorage.exportCsv(selectedDate);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Caspiy_Wellness_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleSaveToDrive = async () => {
    if (!settings.appsScriptUrl || settings.appsScriptUrl.trim() === '') {
      setDriveResult({
        success: false,
        message: 'Для автоматического сохранения PDF в Google Drive укажите URL Google Apps Script в настройках системы.',
      });
      return;
    }

    setDriveSaving(true);
    setDriveResult(null);

    try {
      const response = await fetch(settings.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generatePdf',
          date: selectedDate,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setDriveResult({
          success: true,
          message: `PDF сохранен в папку Google Drive: ${data.folderName || 'Caspiy_Futsal_Reports'}`,
          url: data.url,
        });
      } else {
        setDriveResult({
          success: false,
          message: data.error || 'Ошибка сохранения в Google Drive',
        });
      }
    } catch (err) {
      setDriveResult({
        success: false,
        message: 'Не удалось связаться с Google Apps Script. Проверьте развертывание Web App.',
      });
    } finally {
      setDriveSaving(false);
    }
  };

  const handleCopyWhatsAppSummary = () => {
    const lines = [
      `📊 READINESS & RECOVERY REPORT`,
      `⚽ CASPIY FUTSAL CLUB`,
      `📅 Дата: ${formatRussianDate(selectedDate)}`,
      `👥 Заполнили: ${completedCount} из ${totalAthletes} (${completionRate}%)`,
      `📈 Средний Wellness команды: ${avgWellness}%`,
      `⚠️ Требуют внимания/осмотра: ${medicalReviews}`,
      ``,
    ];

    if (medicalReviews > 0) {
      lines.push(`🚨 СПИСОК ОСОБОГО ВНИМАНИЯ:`);
      records
        .filter((r) => r.status === 'RED' || r.status === 'ORANGE')
        .forEach((r) => {
          let note = `${r.playerName} (#${r.jerseyNumber}) — Wellness ${r.wellnessPercent}%`;
          if (r.painPresent) note += ` | Боль: ${r.painIntensity}/10 (${r.painLocation})`;
          if (r.illnessSymptoms) note += ` | Симптомы: ${r.illnessDetails}`;
          lines.push(`• ${note}`);
        });
      lines.push(``);
    }

    const missingAthletes = athletes.filter(
      (a) => !records.some((r) => r.athleteId === a.athleteId)
    );
    if (missingAthletes.length > 0) {
      lines.push(`⏳ НЕ ЗАПОЛНИЛИ: ${missingAthletes.map((a) => a.displayName).join(', ')}`);
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Date Filter (Hidden on print) */}
      <div className="no-print p-5 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
            ОТЧЕТ ДЛЯ ГЛАВНОГО ТРЕНЕРА
          </span>
          <h2 className="text-xl font-bold text-white">
            Readiness & Recovery Report
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Сводка состояния готовности и восстановления на {formatRussianDate(selectedDate)}
          </p>
        </div>

        {/* Date input & Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
          />

          <button
            onClick={handlePrintPdf}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Печать / PDF</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV (Excel)</span>
          </button>

          <button
            onClick={handleSaveToDrive}
            disabled={driveSaving}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>{driveSaving ? 'Сохранение...' : 'В Google Drive'}</span>
          </button>

          <button
            onClick={handleCopyWhatsAppSummary}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600/30 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedSummary ? 'Скопировано!' : 'Сводка для WhatsApp'}</span>
          </button>
        </div>
      </div>

      {driveResult && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center justify-between gap-2 ${
            driveResult.success
              ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
              : 'bg-amber-950/40 border border-amber-800 text-amber-300'
          }`}
        >
          <span>{driveResult.message}</span>
          {driveResult.url && (
            <a
              href={driveResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold ml-2 text-white"
            >
              Открыть файл
            </a>
          )}
        </div>
      )}

      {/* Coach Printable Report Layout */}
      <div className="print-page p-6 sm:p-8 rounded-3xl bg-[#0c1322] border border-slate-800 text-slate-100 space-y-6">
        {/* Printable Header */}
        <div className="text-center pb-6 border-b border-slate-800 space-y-1">
          <div className="text-xs font-extrabold tracking-widest text-blue-400 uppercase">
            CASPIY FUTSAL CLUB · МЕДИЦИНСКИЙ ШТАБ
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            READINESS & RECOVERY REPORT
          </h1>
          <div className="text-sm font-semibold text-slate-300">
            {formatRussianDate(selectedDate)} · Asia/Aqtau (Актау, UTC+5)
          </div>
        </div>

        {/* Printable KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Всего игроков</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{totalAthletes}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Заполнили Check-in</span>
            <div className="text-2xl font-black text-blue-400 font-mono mt-0.5">
              {completedCount} <span className="text-xs text-slate-400 font-normal">({completionRate}%)</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Средний Wellness</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{avgWellness}%</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Медицинский осмотр</span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">{medicalReviews}</div>
          </div>
        </div>

        {/* Report Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#090f1b] text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Игрок</th>
                <th className="py-3 px-2 text-center">#</th>
                <th className="py-3 px-2 text-center">Сон</th>
                <th className="py-3 px-2 text-center">Утомл</th>
                <th className="py-3 px-2 text-center">Мышцы</th>
                <th className="py-3 px-2 text-center">Настр</th>
                <th className="py-3 px-2 text-center">Стресс</th>
                <th className="py-3 px-3 text-center">Wellness</th>
                <th className="py-3 px-2 text-center">Боль</th>
                <th className="py-3 px-3">Локализация</th>
                <th className="py-3 px-3 text-right">Статус мониторинга</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                    Нет сохраненных записей на выбранную дату {selectedDate}.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.recordId} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-white font-sans text-xs">
                      {r.playerName}
                    </td>
                    <td className="py-2.5 px-2 text-center text-blue-400 font-bold">
                      {r.jerseyNumber}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{r.sleep}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{r.fatigue}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{r.muscleSoreness}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{r.mood}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{r.stress}</td>
                    <td className="py-2.5 px-3 text-center font-extrabold text-blue-400">
                      {r.wellnessPercent}%
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {r.painPresent ? (
                        <span className={`font-bold ${r.painIntensity >= 4 ? 'text-rose-400' : 'text-amber-400'}`}>
                          {r.painIntensity}/10
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px] truncate max-w-[130px]">
                      {r.painLocation || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          r.status === 'RED'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                            : r.status === 'ORANGE'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : r.status === 'YELLOW'
                            ? 'bg-yellow-950/60 text-yellow-300 border-yellow-800'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <div>
            Шкалы: 1 — плохое / тяжелое, 5 — отличное / отсутствие боли.
            Статус является инструментом мониторинга динамики восстановления.
          </div>
          <div>
            Caspiy Futsal Medical Monitoring System
          </div>
        </div>
      </div>
    </div>
  );
};
