import React, { useState, useEffect } from 'react';
import { Athlete, DailyWellness, WellnessRating } from '../types';
import { AppStorage } from '../services/storage';
import { getAlmatyDate, formatRussianDate } from '../utils/date';
import { PAIN_LOCATIONS, ILLNESS_SYMPTOMS_LIST, calculateWellnessScore } from '../utils/status';
import { CheckCircle2, AlertCircle, WifiOff, RefreshCw, Shield, Edit3, HeartPulse } from 'lucide-react';

interface PlayerViewProps {
  token: string;
  onNavigateToAdmin?: () => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({ token, onNavigateToAdmin }) => {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [existingRecord, setExistingRecord] = useState<DailyWellness | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Form states
  const [sleep, setSleep] = useState<WellnessRating>(4);
  const [fatigue, setFatigue] = useState<WellnessRating>(4);
  const [muscleSoreness, setMuscleSoreness] = useState<WellnessRating>(4);
  const [mood, setMood] = useState<WellnessRating>(4);
  const [stress, setStress] = useState<WellnessRating>(4);

  const [painPresent, setPainPresent] = useState(false);
  const [painIntensity, setPainIntensity] = useState<number>(0);
  const [painLocation, setPainLocation] = useState<string>('Бедро');
  const [painLocationDetails, setPainLocationDetails] = useState('');

  const [illnessSymptoms, setIllnessSymptoms] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [illnessDetails, setIllnessDetails] = useState('');

  const todayStr = getAlmatyDate();
  const formattedToday = formatRussianDate(todayStr);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    loadPlayerData();
    const handleSync = () => loadPlayerData();
    window.addEventListener('caspiy_athlete_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('caspiy_athlete_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [token]);

  const loadPlayerData = () => {
    setLoading(true);
    setErrorMessage(null);

    // Check if URL has sync parameters to ensure updated nickname/name is immediately applied
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get('name');
    const numParam = params.get('num');
    const fnParam = params.get('fn');
    const lnParam = params.get('ln');
    const idParam = params.get('id');

    const foundAthlete = AppStorage.syncAthleteFromUrl(token, {
      name: nameParam,
      num: numParam,
      fn: fnParam,
      ln: lnParam,
      id: idParam,
    }) || AppStorage.findAthleteByToken(token);

    if (!foundAthlete) {
      setAthlete(null);
      setLoading(false);
      return;
    }

    setAthlete(foundAthlete);

    // Check if record exists for today
    const record = AppStorage.getAthleteRecordForDate(foundAthlete.athleteId, todayStr);
    if (record) {
      setExistingRecord(record);
      // Pre-fill form values
      setSleep(record.sleep);
      setFatigue(record.fatigue);
      setMuscleSoreness(record.muscleSoreness);
      setMood(record.mood);
      setStress(record.stress);
      setPainPresent(record.painPresent);
      setPainIntensity(record.painIntensity);
      setPainLocation(record.painLocation || 'Бедро');
      setPainLocationDetails(record.painLocationDetails || '');
      setIllnessSymptoms(record.illnessSymptoms);
      setIllnessDetails(record.illnessDetails || '');
      if (record.illnessList) {
        setSelectedSymptoms(record.illnessList);
      }
    } else {
      setExistingRecord(null);
      setIsEditing(true);
    }
    setLoading(false);
  };

  const { wellnessScore, wellnessPercent } = calculateWellnessScore(
    sleep,
    fatigue,
    muscleSoreness,
    mood,
    stress
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athlete) return;

    if (!navigator.onLine) {
      setIsOffline(true);
      setErrorMessage('Нет подключения к интернету. Проверьте сеть и повторите отправку.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const illnessCombined = selectedSymptoms.length > 0
        ? `${selectedSymptoms.join(', ')}${illnessDetails ? ` (${illnessDetails})` : ''}`
        : illnessDetails;

      const result = await AppStorage.saveWellness({
        token: athlete.accessToken,
        athleteId: athlete.athleteId,
        sleep,
        fatigue,
        muscleSoreness,
        mood,
        stress,
        painPresent,
        painIntensity: painPresent ? painIntensity : 0,
        painLocation: painPresent ? painLocation : '—',
        painLocationDetails: painLocation === 'Другое' ? painLocationDetails : '',
        illnessSymptoms,
        illnessDetails: illnessSymptoms ? (illnessCombined || 'Есть симптомы') : 'Нет',
        illnessList: selectedSymptoms,
      });

      if (result.success && result.record) {
        setExistingRecord(result.record);
        setSubmitSuccess(true);
        setIsEditing(false);
      } else {
        setErrorMessage(result.error || 'Не удалось сохранить данные. Попробуйте еще раз.');
      }
    } catch {
      setErrorMessage('Не удалось сохранить данные. Попробуйте еще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Загрузка профиля игрока...</p>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-950/40 border border-rose-800/60 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Ссылка недействительна</h1>
        <p className="text-slate-400 text-sm max-w-sm mb-6">
          Игрок с указанным кодом доступа не найден. Пожалуйста, откройте персональную ссылку от медицинского штаба или введите код заново.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              window.location.href = window.location.pathname;
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Ввести код заново
          </button>
          {onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
            >
              Вход для врача
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-16">
      {/* Offline Alert */}
      {isOffline && (
        <div className="bg-amber-950/80 border-b border-amber-800 px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-200 sticky top-0 z-50 backdrop-blur-md">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Нет подключения к интернету. Данные не могут быть сохранены.</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 bg-[#070b14]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-base shadow-sm">
              #{athlete.jerseyNumber}
            </div>
            <div>
              <div className="text-[10px] tracking-widest uppercase font-semibold text-blue-400">
                CASPIY FUTSAL CLUB
              </div>
              <h1 className="text-base font-bold text-white leading-tight">
                {athlete.displayName}
              </h1>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-200">{formattedToday}</div>
            <div className="text-[10px] text-slate-400">Asia/Aqtau (Актау)</div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* If already filled today and not in edit mode */}
        {existingRecord && !isEditing ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-base font-bold text-emerald-300">
                    Сегодняшний wellness уже заполнен
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Отметка за {formattedToday} успешно принята системой. Вы можете при необходимости изменить сегодняшнюю запись.
                  </p>
                </div>
              </div>
            </div>

            {/* Today's Snapshot Card */}
            <div className="p-5 rounded-2xl bg-[#0e172a] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Ваш результат сегодня
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-blue-400 font-mono">
                    {existingRecord.wellnessPercent}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({existingRecord.wellnessScore.toFixed(1)} / 5)
                  </span>
                </div>
              </div>

              {/* 5 scales breakdown */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Сон</div>
                  <div className="text-base font-bold text-white mt-0.5">{existingRecord.sleep}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Утомл</div>
                  <div className="text-base font-bold text-white mt-0.5">{existingRecord.fatigue}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Мышцы</div>
                  <div className="text-base font-bold text-white mt-0.5">{existingRecord.muscleSoreness}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Настр</div>
                  <div className="text-base font-bold text-white mt-0.5">{existingRecord.mood}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Стресс</div>
                  <div className="text-base font-bold text-white mt-0.5">{existingRecord.stress}</div>
                </div>
              </div>

              {/* Pain & Illness status */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between items-center py-1 border-t border-slate-800/60">
                  <span className="text-slate-400">Боль:</span>
                  <span className="font-semibold text-slate-200">
                    {existingRecord.painPresent ? `${existingRecord.painIntensity}/10 (${existingRecord.painLocation})` : 'Отсутствует'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-800/60">
                  <span className="text-slate-400">Симптомы болезни:</span>
                  <span className="font-semibold text-slate-200">
                    {existingRecord.illnessSymptoms ? existingRecord.illnessDetails : 'Отсутствуют'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-md shadow-blue-600/20"
              >
                <Edit3 className="w-4 h-4" />
                Изменить сегодняшнюю запись
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Данные переданы в медицинский штаб МФК Каспий. Записи за предыдущие дни не могут быть изменены.
              </p>
            </div>
          </div>
        ) : (
          /* Form for filling / editing */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Live indicator */}
            <div className="p-4 rounded-2xl bg-[#0d1629] border border-blue-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  ЕЖЕДНЕВНЫЙ CHECK-IN
                </span>
                <h2 className="text-sm font-semibold text-white">
                  Оцените самочувствие
                </h2>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Предварительно:</div>
                <div className="text-xl font-extrabold text-blue-400 font-mono">
                  {wellnessPercent}%
                </div>
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. СОН */}
            <WellnessQuestion
              title="1. КАЧЕСТВО СНА"
              description="Как вы спали сегодня ночью?"
              value={sleep}
              onChange={setSleep}
              labels={{
                1: 'Очень плохо',
                2: 'Плохо',
                3: 'Удовлетворительно',
                4: 'Хорошо',
                5: 'Отлично',
              }}
            />

            {/* 2. УТОМЛЕНИЕ */}
            <WellnessQuestion
              title="2. УРОВЕНЬ УТОМЛЕНИЯ"
              description="Чувствуете ли вы общую усталость?"
              value={fatigue}
              onChange={setFatigue}
              labels={{
                1: 'Очень сильное утомление',
                2: 'Выраженное утомление',
                3: 'Умеренное',
                4: 'Небольшое',
                5: 'Отсутствует',
              }}
            />

            {/* 3. МЫШЕЧНАЯ БОЛЕЗНЕННОСТЬ */}
            <WellnessQuestion
              title="3. МЫШЕЧНАЯ БОЛЕЗНЕННОСТЬ"
              description="Крепатура, скованность или болезненность в мышцах"
              value={muscleSoreness}
              onChange={setMuscleSoreness}
              labels={{
                1: 'Очень сильная',
                2: 'Выраженная',
                3: 'Умеренная',
                4: 'Небольшая',
                5: 'Отсутствует',
              }}
            />

            {/* 4. НАСТРОЕНИЕ */}
            <WellnessQuestion
              title="4. НАСТРОЕНИЕ"
              description="Психологический настрой и готовность"
              value={mood}
              onChange={setMood}
              labels={{
                1: 'Очень плохое',
                2: 'Плохое',
                3: 'Обычное',
                4: 'Хорошее',
                5: 'Отличное',
              }}
            />

            {/* 5. СТРЕСС */}
            <WellnessQuestion
              title="5. УРОВЕНЬ СТРЕССА"
              description="Эмоциональное напряжение, тревога или внешнее давление"
              value={stress}
              onChange={setStress}
              labels={{
                1: 'Очень высокий',
                2: 'Высокий',
                3: 'Умеренный',
                4: 'Низкий',
                5: 'Минимальный / отсутствует',
              }}
            />

            {/* 6. БОЛЬ */}
            <div className="p-4 rounded-2xl bg-[#0e172a] border border-slate-800 space-y-4 text-left">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  БОЛЬ И ДИСКОМФОРТ
                </div>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  Есть ли сейчас боль?
                </h3>
              </div>

              {/* Yes / No buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPainPresent(false);
                    setPainIntensity(0);
                  }}
                  className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center min-h-[48px] ${
                    !painPresent
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  НЕТ БОЛИ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPainPresent(true);
                    if (painIntensity === 0) setPainIntensity(3);
                  }}
                  className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center min-h-[48px] ${
                    painPresent
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ЕСТЬ БОЛЬ
                </button>
              </div>

              {/* Pain details if YES */}
              {painPresent && (
                <div className="pt-3 border-t border-slate-800/80 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-slate-300">
                        Интенсивность боли (0 — 10):
                      </label>
                      <span className="text-sm font-bold font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                        {painIntensity} / 10
                      </span>
                    </div>

                    <div className="grid grid-cols-11 gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPainIntensity(num)}
                          className={`h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                            painIntensity === num
                              ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Слабая (1-3)</span>
                      <span>Умеренная (4-6)</span>
                      <span>Сильная (7-10)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Где болит? (локализация)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PAIN_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setPainLocation(loc)}
                          className={`py-2 px-2 text-xs rounded-lg font-medium transition-all text-center truncate ${
                            painLocation === loc
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>

                    {painLocation === 'Другое' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={painLocationDetails}
                          onChange={(e) => setPainLocationDetails(e.target.value)}
                          placeholder="Укажите точное место боли..."
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 7. СИМПТОМЫ БОЛЕЗНИ */}
            <div className="p-4 rounded-2xl bg-[#0e172a] border border-slate-800 space-y-4 text-left">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  СОСТОЯНИЕ ЗДОРОВЬЯ
                </div>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  Есть ли сегодня симптомы болезни?
                </h3>
              </div>

              {/* Yes / No buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIllnessSymptoms(false);
                    setSelectedSymptoms([]);
                    setIllnessDetails('');
                  }}
                  className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center min-h-[48px] ${
                    !illnessSymptoms
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  НЕТ СИМПТОМОВ
                </button>
                <button
                  type="button"
                  onClick={() => setIllnessSymptoms(true)}
                  className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center min-h-[48px] ${
                    illnessSymptoms
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ЕСТЬ СИМПТОМЫ
                </button>
              </div>

              {/* Symptom checkboxes */}
              {illnessSymptoms && (
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {ILLNESS_SYMPTOMS_LIST.map((sym) => {
                      const isChecked = selectedSymptoms.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => toggleSymptom(sym)}
                          className={`py-2 px-3 text-xs rounded-xl font-medium text-left flex items-center justify-between border transition-all ${
                            isChecked
                              ? 'bg-amber-950/60 border-amber-600 text-amber-200'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{sym}</span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[10px] ${
                              isChecked
                                ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold'
                                : 'border-slate-600'
                            }`}
                          >
                            {isChecked ? '✓' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Дополнительно (комментарий):
                    </label>
                    <textarea
                      rows={2}
                      value={illnessDetails}
                      onChange={(e) => setIllnessDetails(e.target.value)}
                      placeholder="Опишите подробнее симптомы (например, температура 37.3)..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={submitting || isOffline}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-600/25 transition-all active:scale-[0.99] min-h-[56px]"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Сохранение в Google Sheets...</span>
                  </>
                ) : (
                  <>
                    <HeartPulse className="w-5 h-5" />
                    <span>{existingRecord ? 'Обновить wellness' : 'Отправить wellness'}</span>
                  </>
                )}
              </button>

              {existingRecord && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full py-2.5 px-4 text-xs font-medium text-slate-400 hover:text-slate-200 text-center"
                >
                  Отмена редактирования
                </button>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

interface WellnessQuestionProps {
  title: string;
  description: string;
  value: WellnessRating;
  onChange: (val: WellnessRating) => void;
  labels: Record<WellnessRating, string>;
}

const WellnessQuestion: React.FC<WellnessQuestionProps> = ({
  title,
  description,
  value,
  onChange,
  labels,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-[#0e172a] border border-slate-800 text-left space-y-3">
      <div>
        <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
          {title}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>

      {/* 5 Big Touch Buttons (1 to 5) */}
      <div className="grid grid-cols-5 gap-1.5">
        {([1, 2, 3, 4, 5] as WellnessRating[]).map((num) => {
          const isSelected = value === num;
          // Color accents: 1 = red/rose, 2 = orange, 3 = yellow, 4 = blue, 5 = emerald
          let activeBg = 'bg-blue-600 text-white ring-2 ring-blue-400';
          if (num === 1) activeBg = 'bg-rose-600 text-white ring-2 ring-rose-400';
          else if (num === 2) activeBg = 'bg-amber-600 text-white ring-2 ring-amber-400';
          else if (num === 3) activeBg = 'bg-yellow-600 text-white ring-2 ring-yellow-400';
          else if (num === 4) activeBg = 'bg-blue-600 text-white ring-2 ring-blue-400';
          else if (num === 5) activeBg = 'bg-emerald-600 text-white ring-2 ring-emerald-400';

          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`h-14 rounded-xl text-lg font-extrabold transition-all flex flex-col items-center justify-center min-h-[48px] ${
                isSelected
                  ? `${activeBg} shadow-lg scale-105`
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{num}</span>
            </button>
          );
        })}
      </div>

      {/* Selected description verbal label */}
      <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
        <span className="text-xs font-semibold text-slate-200">
          {value}: {labels[value]}
        </span>
      </div>
    </div>
  );
};
