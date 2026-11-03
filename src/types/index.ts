export type WellnessRating = 1 | 2 | 3 | 4 | 5;

export type HealthStatus = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface Athlete {
  athleteId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  jerseyNumber: string;
  accessToken: string;
  active: boolean;
  createdAt: string;
}

export interface DailyWellness {
  recordId: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  athleteId: string;
  playerName: string;
  jerseyNumber: string;
  sleep: WellnessRating;
  fatigue: WellnessRating;
  muscleSoreness: WellnessRating;
  mood: WellnessRating;
  stress: WellnessRating;
  wellnessScore: number; // 1.0 - 5.0
  wellnessPercent: number; // 20 - 100%
  painPresent: boolean;
  painIntensity: number; // 0 - 10
  painLocation: string;
  painLocationDetails?: string;
  illnessSymptoms: boolean;
  illnessDetails: string;
  illnessList?: string[];
  status: HealthStatus;
  statusText: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRehabRecord {
  date: string;
  athleteId: string;
  playerName: string;
  injury: string;
  bodyPart: string;
  pain: number;
  painWithLoad: number;
  restriction: string;
  modifiedTraining: string;
  rehabStatus: 'Active' | 'Modified' | 'Return to Play' | 'Resolved';
  returnToPlay: string;
  medicalComment: string;
  updatedAt: string;
}

export interface TrainingLoadRecord {
  date: string;
  athleteId: string;
  playerName: string;
  trainingDuration: number; // in minutes
  sRPE: number; // 1-10
  sRPELoad: number; // duration * sRPE
  HRmean?: number;
  HRpeak?: number;
  HRmax?: number;
  percentHRmax?: number;
  TRIMP?: number;
  comment?: string;
}

export interface ReportSettings {
  teamName: string;
  teamLogo: string;
  timezone: string;
  wellnessThresholdGreen: number; // default 80
  wellnessThresholdYellow: number; // default 70
  wellnessThresholdOrange: number; // default 60
  painWarningThreshold: number; // default 4
  painSevereThreshold: number; // default 7
  adminPasswordHash?: string;
  appsScriptUrl?: string;
}
