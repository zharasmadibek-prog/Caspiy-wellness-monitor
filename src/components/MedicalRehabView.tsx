import React, { useState } from 'react';
import { MedicalRehabRecord, TrainingLoadRecord } from '../types';
import { AppStorage } from '../services/storage';
import { formatShortDate } from '../utils/date';
import { Activity, ShieldAlert, Heart, Dumbbell, Stethoscope, Plus } from 'lucide-react';

export const MedicalRehabView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rehab' | 'load'>('rehab');

  const rehabRecords = AppStorage.getMedicalRehabRecords();
  const loadRecords = AppStorage.getTrainingLoadRecords();

  return (
    <div className="space-y-6">
      {/* Header & Tab Selector */}
      <div className="p-5 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
            МЕДИЦИНСКИЙ ПРОТОКОЛ & НАГРУЗКИ
          </span>
          <h2 className="text-xl font-bold text-white">
            Medical Rehab & Training Load
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Конфиденциальные медицинские данные и учет тренировочных нагрузок (только для медштаба)
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('rehab')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'rehab'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Реабилитация (Лист 3)</span>
          </button>
          <button
            onClick={() => setActiveTab('load')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'load'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Нагрузка / Polar (Лист 4)</span>
          </button>
        </div>
      </div>

      {activeTab === 'rehab' ? (
        /* MEDICAL REHAB TABLE */
        <div className="rounded-3xl border border-slate-800 overflow-hidden bg-[#0c1322] space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Журнал травм и реабилитации (MEDICAL_REHAB)</h3>
              <p className="text-xs text-slate-400">Данные защищены и никогда не передаются в клиентские интерфейсы игроков</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-bold">
              Активных случаев: {rehabRecords.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#090f1b] text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Дата</th>
                  <th className="py-3 px-3">Игрок</th>
                  <th className="py-3 px-3">Диагноз / Травма</th>
                  <th className="py-3 px-2 text-center">Боль (покой/нагр)</th>
                  <th className="py-3 px-3">Ограничения</th>
                  <th className="py-3 px-3">Модифицированная работа</th>
                  <th className="py-3 px-3">Статус / RTP</th>
                  <th className="py-3 px-3">Комментарий врача</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rehabRecords.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {formatShortDate(item.date)}
                    </td>
                    <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                      {item.playerName}
                    </td>
                    <td className="py-3 px-3 text-amber-300 font-medium">
                      {item.injury} ({item.bodyPart})
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-xs">
                      <span className="text-rose-400 font-bold">{item.pain}</span> / <span className="text-rose-500 font-bold">{item.painWithLoad}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs text-[11px]">
                      {item.restriction}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs text-[11px]">
                      {item.modifiedTraining}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 border border-amber-800 text-amber-300 block text-center mb-1">
                        {item.rehabStatus}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{item.returnToPlay}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] italic">
                      "{item.medicalComment}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TRAINING LOAD TABLE */
        <div className="rounded-3xl border border-slate-800 overflow-hidden bg-[#0c1322] space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Тренировочная нагрузка (TRAINING_LOAD)</h3>
              <p className="text-xs text-slate-400">
                Готовая структура базы для sRPE и будущей интеграции мониторов Polar (HRmean, %HRmax, TRIMP)
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-bold">
              Polar Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#090f1b] text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Дата</th>
                  <th className="py-3 px-3">Игрок</th>
                  <th className="py-3 px-2 text-center">Длит-ть (мин)</th>
                  <th className="py-3 px-2 text-center">sRPE</th>
                  <th className="py-3 px-2 text-center">sRPE Load (AU)</th>
                  <th className="py-3 px-2 text-center">ЧСС ср</th>
                  <th className="py-3 px-2 text-center">ЧСС макс</th>
                  <th className="py-3 px-2 text-center">% HRmax</th>
                  <th className="py-3 px-2 text-center">TRIMP</th>
                  <th className="py-3 px-3">Комментарий к сессии</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {loadRecords.map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {formatShortDate(l.date)}
                    </td>
                    <td className="py-3 px-3 font-bold text-white font-sans text-xs whitespace-nowrap">
                      {l.playerName}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-300">{l.trainingDuration} мин</td>
                    <td className="py-3 px-2 text-center text-blue-400 font-bold">{l.sRPE} / 10</td>
                    <td className="py-3 px-2 text-center text-emerald-400 font-extrabold">{l.sRPELoad}</td>
                    <td className="py-3 px-2 text-center text-slate-300">{l.HRmean || '—'} уд/мин</td>
                    <td className="py-3 px-2 text-center text-rose-400">{l.HRpeak || '—'} уд/мин</td>
                    <td className="py-3 px-2 text-center text-amber-400">{l.percentHRmax ? `${l.percentHRmax}%` : '—'}</td>
                    <td className="py-3 px-2 text-center text-purple-400 font-bold">{l.TRIMP || '—'}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans text-xs">{l.comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
