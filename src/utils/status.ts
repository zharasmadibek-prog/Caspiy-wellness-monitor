import { HealthStatus, ReportSettings, WellnessRating } from '../types';

export interface StatusEvaluation {
  status: HealthStatus;
  statusLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  reason: string;
}

export const DEFAULT_SETTINGS: ReportSettings = {
  teamName: 'МФК КАСПИЙ (CASPIY FUTSAL CLUB)',
  teamLogo: '',
  timezone: 'Asia/Aqtau',
  wellnessThresholdGreen: 80,
  wellnessThresholdYellow: 70,
  wellnessThresholdOrange: 60,
  painWarningThreshold: 4,
  painSevereThreshold: 7,
  adminPasswordHash: 'caspiy2026',
  appsScriptUrl: '',
};

/**
 * Calculates wellness score (1.0 - 5.0) and percent (20% - 100%)
 */
export function calculateWellnessScore(
  sleep: WellnessRating,
  fatigue: WellnessRating,
  muscleSoreness: WellnessRating,
  mood: WellnessRating,
  stress: WellnessRating
): { wellnessScore: number; wellnessPercent: number } {
  const sum = sleep + fatigue + muscleSoreness + mood + stress;
  const rawScore = sum / 5;
  const wellnessScore = Math.round(rawScore * 10) / 10;
  const wellnessPercent = Math.round((wellnessScore / 5) * 100);
  return { wellnessScore, wellnessPercent };
}

/**
 * Centralized evaluation of player status.
 * Notice: This is a monitoring tool, NOT an automatic clearance to play.
 * NEVER outputs "допущен" or "не допущен".
 */
export function evaluateHealthStatus(
  wellnessPercent: number,
  painPresent: boolean,
  painIntensity: number,
  illnessSymptoms: boolean,
  settings: ReportSettings = DEFAULT_SETTINGS
): StatusEvaluation {
  const hasSeverePain = painPresent && painIntensity >= settings.painSevereThreshold;
  const hasWarningPain = painPresent && painIntensity >= settings.painWarningThreshold;
  const isSevereWellness = wellnessPercent < settings.wellnessThresholdOrange;
  const isModerateWellness = wellnessPercent < settings.wellnessThresholdYellow;
  const isSlightDropWellness = wellnessPercent < settings.wellnessThresholdGreen;

  // 1. RED / MEDICAL REVIEW
  if (isSevereWellness || hasSeverePain || (illnessSymptoms && painIntensity >= 5)) {
    let reason = 'Требуется медицинский осмотр';
    if (hasSeverePain) reason += ` (интенсивность боли ${painIntensity}/10)`;
    if (isSevereWellness) reason += ` (wellness ${wellnessPercent}%)`;
    if (illnessSymptoms) reason += ` (симптомы болезни)`;

    return {
      status: 'RED',
      statusLabel: 'Требует медицинского осмотра',
      badgeBg: 'bg-rose-950/40',
      badgeText: 'text-rose-400',
      badgeBorder: 'border-rose-800/60',
      dotColor: 'bg-rose-500',
      reason,
    };
  }

  // 2. ORANGE
  if (isModerateWellness || hasWarningPain || illnessSymptoms) {
    let reason = 'Требует внимания';
    if (hasWarningPain) reason += ` (боль ${painIntensity}/10)`;
    if (illnessSymptoms) reason += ` (есть симптомы болезни)`;
    if (isModerateWellness) reason += ` (wellness ${wellnessPercent}%)`;

    return {
      status: 'ORANGE',
      statusLabel: 'Требует внимания',
      badgeBg: 'bg-amber-950/40',
      badgeText: 'text-amber-400',
      badgeBorder: 'border-amber-800/60',
      dotColor: 'bg-amber-500',
      reason,
    };
  }

  // 3. YELLOW
  if (isSlightDropWellness) {
    return {
      status: 'YELLOW',
      statusLabel: 'Есть признаки ухудшения wellness',
      badgeBg: 'bg-yellow-950/30',
      badgeText: 'text-yellow-400',
      badgeBorder: 'border-yellow-800/60',
      dotColor: 'bg-yellow-400',
      reason: `Wellness ${wellnessPercent}% (ниже целевых 80%)`,
    };
  }

  // 4. GREEN
  return {
    status: 'GREEN',
    statusLabel: 'Оптимальное состояние',
    badgeBg: 'bg-emerald-950/30',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-800/60',
    dotColor: 'bg-emerald-400',
    reason: `Wellness ${wellnessPercent}%, без ограничений`,
  };
}

export const PAIN_LOCATIONS = [
  'Голова',
  'Шея',
  'Плечо',
  'Локоть',
  'Кисть',
  'Грудная клетка',
  'Поясница',
  'Таз',
  'Пах',
  'Бедро',
  'Колено',
  'Голень',
  'Голеностоп',
  'Стопа',
  'Другое',
];

export const ILLNESS_SYMPTOMS_LIST = [
  'Температура',
  'Кашель',
  'Насморк',
  'Боль в горле',
  'ЖКТ',
  'Головная боль',
  'Другое',
];
