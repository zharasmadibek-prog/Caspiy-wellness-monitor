import React, { useState } from 'react';
import { Athlete, DailyWellness } from '../types';
import { AppStorage } from '../services/storage';
import { formatShortDate } from '../utils/date';
import { EditAthleteModal } from './EditAthleteModal';
import { X, Calendar, Activity, AlertTriangle, TrendingUp, Heart, Edit3 } from 'lucide-react';

interface AthleteProfileModalProps {
  athlete: Athlete;
  todayRecord: DailyWellness | null;
  onClose: () => void;
  onAthleteUpdated?: (updated: Athlete) => void;
  onAthleteDeleted?: (athleteId: string) => void;
}

export const AthleteProfileModal: React.FC<AthleteProfileModalProps> = ({
  athlete: initialAthlete,
  todayRecord,
  onClose,
  onAthleteUpdated,
  onAthleteDeleted,
}) => {
  const [athlete, setAthlete] = useState<Athlete>(initialAthlete);
  const [rangeDays, setRangeDays] = useState<7 | 14 | 28>(14);
  const [showEditModal, setShowEditModal] = useState(false);

  const history = AppStorage.getAthleteHistory(athlete.athleteId, rangeDays);

  // Calculate stats over selected range
  const validRecords = history.filter((h) => h.wellnessPercent > 0);
  const avgWellness = validRecords.length > 0
    ? Math.round(validRecords.reduce((acc, curr) => acc + curr.wellnessPercent, 0) / validRecords.length)
    : 0;

  const painEpisodes = validRecords.filter((h) => h.painPresent && h.painIntensity > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0c1322] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090f1b]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-lg">
              #{athlete.jerseyNumber}
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                ПРОФИЛЬ АТЛЕТА · КАСПИЙ
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {athlete.displayName} ({athlete.firstName} {athlete.lastName})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Редактировать имя, номер, статус"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Редактировать</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Today's Snapshot Block */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Состояние сегодня
            </div>

            {todayRecord ? (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-blue-400 font-mono">
                      {todayRecord.wellnessPercent}%
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Индекс готовности: {todayRecord.wellnessScore.toFixed(1)} / 5.0
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {todayRecord.statusText}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`px-3 py-1 rounded-lg font-bold border ${
                        todayRecord.status === 'RED'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                          : todayRecord.status === 'ORANGE'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                          : todayRecord.status === 'YELLOW'
                          ? 'bg-yellow-950/60 text-yellow-300 border-yellow-800'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {todayRecord.status}
                    </span>
                  </div>
                </div>

                {/* Micro indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="p-2 rounded-xl bg-[#090f1b] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Сон</span>
                    <span className="text-sm font-bold text-white font-mono">{todayRecord.sleep} / 5</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#090f1b] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Утомление</span>
                    <span className="text-sm font-bold text-white font-mono">{todayRecord.fatigue} / 5</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#090f1b] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Мышцы</span>
                    <span className="text-sm font-bold text-white font-mono">{todayRecord.muscleSoreness} / 5</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#090f1b] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Настроение</span>
                    <span className="text-sm font-bold text-white font-mono">{todayRecord.mood} / 5</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#090f1b] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Стресс</span>
                    <span className="text-sm font-bold text-white font-mono">{todayRecord.stress} / 5</span>
                  </div>
                </div>

                {/* Pain notes */}
                <div className="flex flex-wrap items-center justify-between text-xs pt-1 text-slate-300">
                  <div>
                    <span className="text-slate-400">Боль: </span>
                    {todayRecord.painPresent ? (
                      <span className="text-rose-400 font-semibold font-mono">
                        {todayRecord.painIntensity}/10 ({todayRecord.painLocation})
                      </span>
                    ) : (
                      <span className="text-emerald-400">Нет жалоб</span>
                    )}
                  </div>
                  {todayRecord.illnessSymptoms && (
                    <div className="text-amber-400">
                      Симптомы: {todayRecord.illnessDetails || 'Есть'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300">
                Игрок еще не заполнил wellness на сегодня.
              </div>
            )}
          </div>

          {/* Range Selector */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Динамика и тренды
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
              {([7, 14, 28] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setRangeDays(days)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    rangeDays === days
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {days} дней
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Средний Wellness</span>
              <div className="text-xl font-extrabold text-blue-400 font-mono mt-1">{avgWellness}%</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Заполнено чек-инов</span>
              <div className="text-xl font-extrabold text-white font-mono mt-1">
                {validRecords.length} / {rangeDays}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Дней с болью</span>
              <div className="text-xl font-extrabold text-rose-400 font-mono mt-1">{painEpisodes}</div>
            </div>
          </div>

          {/* SVG Trend Chart */}
          <div className="p-4 rounded-2xl bg-[#090f1b] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">График Wellness Trend (%)</span>
              <span className="text-[10px] text-slate-400">Целевая зона $\ge$ 80%</span>
            </div>

            <div className="h-36 w-full relative">
              <TrendChart records={history} />
            </div>
          </div>

          {/* Historical Table */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              История записей
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 max-h-56 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#090f1b] text-slate-400 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Дата</th>
                    <th className="py-2 px-2 text-center">Сон</th>
                    <th className="py-2 px-2 text-center">Утомл</th>
                    <th className="py-2 px-2 text-center">Мышцы</th>
                    <th className="py-2 px-2 text-center">Настр</th>
                    <th className="py-2 px-2 text-center">Стресс</th>
                    <th className="py-2 px-2 text-center">Wellness</th>
                    <th className="py-2 px-2 text-center">Боль</th>
                    <th className="py-2 px-3 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {history.map((rec) => (
                    <tr key={rec.recordId} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-300 font-sans text-xs">{formatShortDate(rec.date)}</td>
                      <td className="py-2 px-2 text-center text-slate-300">{rec.sleep}</td>
                      <td className="py-2 px-2 text-center text-slate-300">{rec.fatigue}</td>
                      <td className="py-2 px-2 text-center text-slate-300">{rec.muscleSoreness}</td>
                      <td className="py-2 px-2 text-center text-slate-300">{rec.mood}</td>
                      <td className="py-2 px-2 text-center text-slate-300">{rec.stress}</td>
                      <td className="py-2 px-2 text-center font-bold text-blue-400">{rec.wellnessPercent}%</td>
                      <td className="py-2 px-2 text-center">
                        {rec.painPresent ? (
                          <span className="text-rose-400">{rec.painIntensity} ({rec.painLocation})</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.status === 'RED'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : rec.status === 'ORANGE'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : rec.status === 'YELLOW'
                              ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditAthleteModal
          athlete={athlete}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => {
            setAthlete(updated);
            if (onAthleteUpdated) onAthleteUpdated(updated);
            setShowEditModal(false);
          }}
          onDeleted={(id) => {
            setShowEditModal(false);
            if (onAthleteDeleted) onAthleteDeleted(id);
            onClose();
          }}
        />
      )}
    </div>
  );
};

interface TrendChartProps {
  records: DailyWellness[];
}

const TrendChart: React.FC<TrendChartProps> = ({ records }) => {
  if (records.length === 0) {
    return <div className="text-xs text-slate-500 flex items-center justify-center h-full">Нет данных</div>;
  }

  // Chronological order (oldest to newest)
  const sorted = [...records].reverse();
  const count = sorted.length;

  const width = 600;
  const height = 130;
  const paddingX = 30;
  const paddingY = 15;

  const minVal = 40;
  const maxVal = 100;

  const points = sorted.map((r, i) => {
    const x = paddingX + (i / Math.max(count - 1, 1)) * (width - 2 * paddingX);
    const normalized = (r.wellnessPercent - minVal) / (maxVal - minVal);
    const y = height - paddingY - normalized * (height - 2 * paddingY);
    return { x, y, val: r.wellnessPercent, date: r.date, pain: r.painIntensity };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Target 80% line
  const target80Y = height - paddingY - ((80 - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      {/* 80% Target Line */}
      <line
        x1={paddingX}
        y1={target80Y}
        x2={width - paddingX}
        y2={target80Y}
        stroke="#10b981"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.4"
      />
      <text x={paddingX - 4} y={target80Y + 3} fill="#10b981" fontSize="9" textAnchor="end" opacity="0.6">
        80%
      </text>

      {/* Area fill */}
      {points.length > 1 && (
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
          fill="url(#gradBlue)"
          opacity="0.25"
        />
      )}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main trend line */}
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />

      {/* Points */}
      {points.map((p, idx) => {
        const isPain = p.pain >= 4;
        return (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r={isPain ? 5 : 3.5}
              fill={isPain ? '#f43f5e' : '#3b82f6'}
              stroke="#070b14"
              strokeWidth="2"
            />
            {/* Show value on hover or endpoints */}
            {(idx === 0 || idx === points.length - 1 || isPain) && (
              <text
                x={p.x}
                y={p.y - 7}
                fill={isPain ? '#f43f5e' : '#94a3b8'}
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                {p.val}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
