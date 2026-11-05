import { Athlete, DailyWellness, ReportSettings, MedicalRehabRecord, TrainingLoadRecord } from '../types';
import { getAlmatyDate, getLastNDays } from '../utils/date';
import { evaluateHealthStatus, DEFAULT_SETTINGS, calculateWellnessScore } from '../utils/status';

const STORAGE_KEYS = {
  ATHLETES: 'caspiy_futsal_athletes_v2',
  WELLNESS: 'caspiy_futsal_wellness_v2',
  SETTINGS: 'caspiy_futsal_settings_v1',
  REHAB: 'caspiy_futsal_rehab_v1',
  TRAINING_LOAD: 'caspiy_futsal_load_v1',
  PERMANENT_GAS_URL: 'caspiy_permanent_gas_url_v1',
};

// Seed team members: 16 Caspiy Futsal players
export const INITIAL_ATHLETES: Athlete[] = [
  { athleteId: 'A001', firstName: 'Narun', lastName: 'Serikov', displayName: 'Serikov Narun', jerseyNumber: '2', accessToken: 'tok_eyJpIjoiQTAwMSIsImQiOiJTZXJpa292IE5hcnVuIiwiaiI6IjIiLCJmIjoiTmFydW4iLCJsIjoiU2VyaWtvdiJ9', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A002', firstName: 'Arnold', lastName: 'Knaub', displayName: 'Arnold Knaub', jerseyNumber: '3', accessToken: 'tok_eyJpIjoiQTAwMiIsImQiOiJBcm5vbGQgS25hdWIiLCJqIjoiMyIsImYiOiJBcm5vbGQiLCJsIjoiS25hdWIifQ', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A003', firstName: 'Sabit', lastName: 'Uzakbaev', displayName: 'Uzakbaev Sabit', jerseyNumber: '6', accessToken: 'tok_eyJpIjoiQTAwMyIsImQiOiJVemFrYmFldiBTYWJpdCIsImoiOiI2IiwiZiI6IlNhYml0IiwibCI6IlV6YWtiYWV2In0', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A004', firstName: 'Gaziz', lastName: 'Nagashybay', displayName: 'Nagashybay Gaziz', jerseyNumber: '8', accessToken: 'tok_eyJpIjoiQTAwNCIsImQiOiJOYWdhc2h5YmF5IEdheml6IiwiaiI6IjgiLCJmIjoiR2F6aXoiLCJsIjoiTmFnYXNoeWJheSJ9', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A005', firstName: 'Raymbek', lastName: 'Zhuma', displayName: 'Zhuma Raymbek', jerseyNumber: '10', accessToken: 'tok_eyJpIjoiQTAwNSIsImQiOiJaaHVtYSBSYXltYmVrIiwiaiI6IjEwIiwiZiI6IlJheW1iZWsiLCJsIjoiWmh1bWEifQ', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A006', firstName: 'Damir', lastName: 'Qairbay', displayName: 'Qairbay Damir', jerseyNumber: '11', accessToken: 'tok_eyJpIjoiQTAwNiIsImQiOiJRYWlyYmF5IERhbWlyIiwiaiI6IjExIiwiZiI6IkRhbWlyIiwibCI6IlFhaXJiYXkifQ', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A007', firstName: 'Allbergen', lastName: 'Tanataruly', displayName: 'Tanataruly Allbergen', jerseyNumber: '13', accessToken: 'tok_eyJpIjoiQTAwNyIsImQiOiJUYW5hdGFydWx5IEFsbGJlcmdlbiIsImoiOiIxMyIsImYiOiJBbGxiZXJnZW4iLCJsIjoiVGFuYXRhcnVseSJ9', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A008', firstName: 'Rasul', lastName: 'Nurbai', displayName: 'Nurbai Rasul', jerseyNumber: '14', accessToken: 'tok_eyJpIjoiQTAwOCIsImQiOiJOdXJiYWkgUmFzdWwiLCJqIjoiMTQiLCJmIjoiUmFzdWwiLCJsIjoiTnVyYmFpIn0', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A009', firstName: 'Adlet', lastName: 'Bulatov', displayName: 'Bulatov Adlet', jerseyNumber: '16', accessToken: 'tok_eyJpIjoiQTAwOSIsImQiOiJCdWxhdG92IEFkbGV0IiwiaiI6IjE2IiwiZiI6IkFkbGV0IiwibCI6IkJ1bGF0b3YifQ', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A010', firstName: 'Rakhat', lastName: 'Tolegen', displayName: 'Tolegen Rakhat', jerseyNumber: '17', accessToken: 'tok_eyJpIjoiQTAxMCIsImQiOiJUb2xlZ2VuIFJha2hhdCIsImoiOiIxNyIsImYiOiJSYWtoYXQiLCJsIjoiVG9sZWdlbiJ9', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A011', firstName: 'Adaybek', lastName: 'Altynbek', displayName: 'Altynbek Adaybek', jerseyNumber: '21', accessToken: 'tok_eyJpIjoiQTAxMSIsImQiOiJBbHR5bmJlayBBZGF5YmVrIiwiaiI6IjIxIiwiZiI6IkFkYXliZWsiLCJsIjoiQWx0eW5iZWsifQ', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A012', firstName: 'Ali', lastName: 'Niknam', displayName: 'Niknam Ali', jerseyNumber: '22', accessToken: 'tok_eyJpIjoiQTAxMiIsImQiOiJOaWtuYW0gQWxpIiwiaiI6IjIyIiwiZiI6IkFsaSIsImwiOiJOaWtuYW0ifQ', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A013', firstName: 'Erbol', lastName: 'Sauyrbaev', displayName: 'Sauyrbaev Erbol', jerseyNumber: '23', accessToken: 'tok_eyJpIjoiQTAxMyIsImQiOiJTYXV5cmJhZXYgRXJib2wiLCJqIjoiMjMiLCJmIjoiRXJib2wiLCJsIjoiU2F1eXJiYWV2In0', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A014', firstName: 'Maksat', lastName: 'Orysbai', displayName: 'Orysbai Maksat', jerseyNumber: '26', accessToken: 'tok_eyJpIjoiQTAxNCIsImQiOiJPcnlzYmFpIE1ha3NhdCIsImoiOiIyNiIsImYiOiJNYWtzYXQiLCJsIjoiT3J5c2JhaSJ9', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A015', firstName: 'Erzhan', lastName: 'Karmenov', displayName: 'Karmenov Erzhan', jerseyNumber: '77', accessToken: 'tok_eyJpIjoiQTAxNSIsImQiOiJLYXJtZW5vdiBFcnpoYW4iLCJqIjoiNzciLCJmIjoiRXJ6aGFuIiwibCI6Ikthcm1lbm92In0', active: true, createdAt: '2026-09-01T08:00:00Z' },
  { athleteId: 'A016', firstName: 'Nursultan', lastName: 'Tanatuly', displayName: 'Tanatuly Nursultan', jerseyNumber: '79', accessToken: 'tok_eyJpIjoiQTAxNiIsImQiOiJUYW5hdHVseSBOdXJzdWx0YW4iLCJqIjoiNzkiLCJmIjoiTnVyc3VsdGFuIiwibCI6IlRhbmF0dWx5In0', active: true, createdAt: '2026-09-01T08:00:00Z' },
];

/**
 * Generates realistic seed wellness records for the past 14 days
 */
function createSeedWellnessRecords(): DailyWellness[] {
  const records: DailyWellness[] = [];
  const today = getAlmatyDate();
  const pastDays = getLastNDays(14, today);

  INITIAL_ATHLETES.forEach((athlete) => {
    pastDays.forEach((dateStr, dayIndex) => {
      // For today, let 14 out of 16 fill (missing 2: Gaziz Nagashybay and Rasul Nurbai)
      if (dateStr === today) {
        if (athlete.jerseyNumber === '8' || athlete.jerseyNumber === '14') {
          return; // Missing check-ins for demo!
        }
      }

      // Pseudo-random deterministic metrics
      const hash = (athlete.athleteId.charCodeAt(3) * 17 + dayIndex * 31) % 100;
      
      let sleep = (hash % 3 === 0 ? 3 : hash % 5 === 0 ? 5 : 4) as 1 | 2 | 3 | 4 | 5;
      let fatigue = (hash % 4 === 0 ? 3 : hash % 7 === 0 ? 2 : 4) as 1 | 2 | 3 | 4 | 5;
      let soreness = (hash % 6 === 0 ? 3 : 4) as 1 | 2 | 3 | 4 | 5;
      let mood = (hash % 8 === 0 ? 3 : 5) as 1 | 2 | 3 | 4 | 5;
      let stress = (hash % 5 === 0 ? 3 : 4) as 1 | 2 | 3 | 4 | 5;

      let painPresent = false;
      let painIntensity = 0;
      let painLocation = '—';
      let illnessSymptoms = false;
      let illnessDetails = '';

      // Specific athlete scenarios to illustrate all statuses
      if (athlete.jerseyNumber === '3') {
        // Arnold Knaub has knee pain
        painPresent = true;
        painIntensity = 3;
        painLocation = 'Колено';
        fatigue = 3;
        stress = 2;
      } else if (athlete.jerseyNumber === '16' && dateStr === today) {
        // Bulatov Adlet needs medical review (groin pain)
        painPresent = true;
        painIntensity = 7;
        painLocation = 'Пах';
        soreness = 2;
        fatigue = 2;
      } else if (athlete.jerseyNumber === '17' && dateStr === today) {
        // Tolegen Rakhat slight illness symptoms
        illnessSymptoms = true;
        illnessDetails = 'Насморк, першение в горле';
        fatigue = 3;
      }

      const { wellnessScore, wellnessPercent } = calculateWellnessScore(sleep, fatigue, soreness, mood, stress);
      const evalResult = evaluateHealthStatus(wellnessPercent, painPresent, painIntensity, illnessSymptoms);

      records.push({
        recordId: `DW_${athlete.athleteId}_${dateStr}`,
        date: dateStr,
        timestamp: `${dateStr}T08:${15 + (hash % 40)}:00+05:00`,
        athleteId: athlete.athleteId,
        playerName: athlete.displayName,
        jerseyNumber: athlete.jerseyNumber,
        sleep,
        fatigue,
        muscleSoreness: soreness,
        mood,
        stress,
        wellnessScore,
        wellnessPercent,
        painPresent,
        painIntensity,
        painLocation,
        illnessSymptoms,
        illnessDetails,
        status: evalResult.status,
        statusText: evalResult.statusLabel,
        createdAt: `${dateStr}T08:15:00Z`,
        updatedAt: `${dateStr}T08:15:00Z`,
      });
    });
  });

  return records;
}

export class AppStorage {
  private static isInitialized = false;

  static init() {
    if (this.isInitialized) return;
    try {
      if (!localStorage.getItem(STORAGE_KEYS.ATHLETES)) {
        localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(INITIAL_ATHLETES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.WELLNESS)) {
        localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(createSeedWellnessRecords()));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
      this.isInitialized = true;
      // Immediately pull fresh shared state from server in background
      this.syncFromServer();
    } catch (e) {
      console.error('Failed to init storage', e);
    }
  }

  /**
   * Synchronizes local cache with server's central persistent database
   */
  static async syncFromServer() {
    try {
      // 1. Settings (including Google Apps Script URL)
      const settingsRes = await fetch('/api/settings').catch(() => null);
      if (settingsRes && settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.success && data.settings) {
          const currentLocal = this.getSettings();
          const serverUrl = (data.settings.appsScriptUrl || '').trim();
          const localUrl = (currentLocal.appsScriptUrl || '').trim();
          const permanentUrl = (localStorage.getItem(STORAGE_KEYS.PERMANENT_GAS_URL) || '').trim();
          const activeUrl = serverUrl || localUrl || permanentUrl;

          const merged = { ...DEFAULT_SETTINGS, ...currentLocal, ...data.settings };
          if (activeUrl) {
            merged.appsScriptUrl = activeUrl;
            localStorage.setItem(STORAGE_KEYS.PERMANENT_GAS_URL, activeUrl);
          }

          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));

          // Auto-heal server: if server was empty but local has URL, push it to server
          if (!serverUrl && (localUrl || permanentUrl)) {
            fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...data.settings, appsScriptUrl: activeUrl }),
            }).catch((e) => console.warn('Auto-healing server settings failed:', e));
          }
        }
      }

      // 2. Athletes
      const athletesRes = await fetch('/api/athletes').catch(() => null);
      if (athletesRes && athletesRes.ok) {
        const data = await athletesRes.json();
        if (data.success && Array.isArray(data.athletes) && data.athletes.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(data.athletes));
        }
      }

      // 3. Wellness records
      const wellnessRes = await fetch('/api/wellness').catch(() => null);
      if (wellnessRes && wellnessRes.ok) {
        const data = await wellnessRes.json();
        if (data.success && Array.isArray(data.records)) {
          const localRecords = this.getAllWellnessRecords();
          const recordMap = new Map<string, DailyWellness>();
          // Start with local, then overwrite with server records (server is authoritative)
          localRecords.forEach((r) => recordMap.set(`${r.athleteId}_${r.date}`, r));
          data.records.forEach((r: DailyWellness) => recordMap.set(`${r.athleteId}_${r.date}`, r));
          const mergedRecords = Array.from(recordMap.values());
          localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(mergedRecords));
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('caspiy_wellness_saved'));
        window.dispatchEvent(new CustomEvent('caspiy_athlete_updated'));
      }
    } catch (err) {
      console.warn('Sync from server warning:', err);
    }
  }

  static getAthletes(): Athlete[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATHLETES);
      return data ? JSON.parse(data) : INITIAL_ATHLETES;
    } catch {
      return INITIAL_ATHLETES;
    }
  }

  static findAthleteByToken(token: string): Athlete | null {
    if (!token) return null;
    const cleanToken = token.trim();
    const athletes = this.getAthletes();
    
    // 1. Direct match by accessToken
    const found = athletes.find((a) => a.accessToken.toLowerCase() === cleanToken.toLowerCase());
    if (found) return found;

    // 2. Direct match by athleteId (e.g. A001, A018)
    const byId = athletes.find((a) => a.athleteId.toLowerCase() === cleanToken.toLowerCase());
    if (byId) return byId;

    // 3. Fallback: decode self-contained token if opened on a new device/phone where this athlete was not in local storage yet
    if (cleanToken.startsWith('tok_') || cleanToken.startsWith('cf_')) {
      try {
        const rawPayload = cleanToken.replace(/^(tok_|cf_)/, '');
        // Replace URL-safe base64 characters
        const base64 = rawPayload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonStr = decodeURIComponent(escape(atob(base64)));
        const parsed = JSON.parse(jsonStr);

        if (parsed && (parsed.d || parsed.displayName)) {
          const recoveredAthlete: Athlete = {
            athleteId: parsed.i || parsed.id || `A${String(athletes.length + 1).padStart(3, '0')}`,
            firstName: parsed.f || parsed.firstName || parsed.d || parsed.displayName,
            lastName: parsed.l || parsed.lastName || '',
            displayName: (parsed.d || parsed.displayName).trim(),
            jerseyNumber: String(parsed.j || parsed.jerseyNumber || '00'),
            accessToken: cleanToken,
            active: true,
            createdAt: new Date().toISOString(),
          };

          // Save to local storage on this device so all subsequent checks and submissions work instantly
          athletes.push(recoveredAthlete);
          localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(athletes));
          return recoveredAthlete;
        }
      } catch (err) {
        console.warn('Could not decode token payload:', err);
      }
    }

    return null;
  }

  static findAthleteById(athleteId: string): Athlete | null {
    const athletes = this.getAthletes();
    return athletes.find((a) => a.athleteId === athleteId) || null;
  }

  static updateAthlete(
    athleteId: string,
    updates: Partial<Pick<Athlete, 'firstName' | 'lastName' | 'displayName' | 'jerseyNumber' | 'active'>>
  ): Athlete | null {
    this.init();
    const athletes = this.getAthletes();
    const index = athletes.findIndex((a) => a.athleteId === athleteId);
    if (index === -1) return null;

    const current = athletes[index];
    const updated: Athlete = {
      ...current,
      firstName: updates.firstName !== undefined ? updates.firstName : current.firstName,
      lastName: updates.lastName !== undefined ? updates.lastName : current.lastName,
      displayName: updates.displayName !== undefined ? updates.displayName.trim() : current.displayName,
      jerseyNumber: updates.jerseyNumber !== undefined ? updates.jerseyNumber : current.jerseyNumber,
      active: updates.active !== undefined ? updates.active : current.active,
    };

    athletes[index] = updated;
    localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(athletes));

    // Sync update to server
    fetch(`/api/athletes/${athleteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((e) => console.warn('Failed to update athlete on server:', e));

    // Update player details in existing wellness records to keep history in sync
    if (updates.displayName || updates.jerseyNumber) {
      const allRecords = this.getAllWellnessRecords();
      let recordsModified = false;
      allRecords.forEach((r) => {
        if (r.athleteId === athleteId) {
          if (updates.displayName) r.playerName = updates.displayName.trim();
          if (updates.jerseyNumber) r.jerseyNumber = updates.jerseyNumber;
          recordsModified = true;
        }
      });
      if (recordsModified) {
        localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(allRecords));
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('caspiy_athlete_updated', { detail: updated }));
    }

    return updated;
  }

  static deleteAthlete(athleteId: string): boolean {
    this.init();
    const athletes = this.getAthletes();
    const index = athletes.findIndex((a) => a.athleteId === athleteId);
    if (index === -1) return false;

    athletes.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(athletes));

    // Delete on server
    fetch(`/api/athletes/${athleteId}`, {
      method: 'DELETE',
    }).catch((e) => console.warn('Failed to delete athlete on server:', e));

    // Also remove associated wellness records
    const allRecords = this.getAllWellnessRecords();
    const remainingRecords = allRecords.filter((r) => r.athleteId !== athleteId);
    localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(remainingRecords));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('caspiy_athlete_deleted', { detail: { athleteId } }));
    }
    return true;
  }

  /**
   * Synchronizes athlete profile with URL parameters (name, number, first/last name).
   * Ensures that if an athlete's nickname/name is edited by the doctor, opening the link
   * on any smartphone/browser immediately updates local storage to the new nickname!
   */
  static syncAthleteFromUrl(
    token: string,
    params: { name?: string | null; num?: string | null; fn?: string | null; ln?: string | null; id?: string | null }
  ): Athlete | null {
    if (!token) return null;
    this.init();

    const cleanToken = token.trim();
    let athlete = this.findAthleteByToken(cleanToken);

    const displayName = params.name ? decodeURIComponent(params.name).trim() : null;
    const jerseyNumber = params.num ? decodeURIComponent(params.num).trim() : null;
    const firstName = params.fn ? decodeURIComponent(params.fn).trim() : null;
    const lastName = params.ln ? decodeURIComponent(params.ln).trim() : null;
    const athleteId = params.id ? decodeURIComponent(params.id).trim() : null;

    if (athlete) {
      let needsUpdate = false;
      const updates: Partial<Athlete> = {};

      if (displayName && athlete.displayName !== displayName) {
        updates.displayName = displayName;
        needsUpdate = true;
      }
      if (jerseyNumber && athlete.jerseyNumber !== jerseyNumber) {
        updates.jerseyNumber = jerseyNumber;
        needsUpdate = true;
      }
      if (firstName && athlete.firstName !== firstName) {
        updates.firstName = firstName;
        needsUpdate = true;
      }
      if (lastName && athlete.lastName !== lastName) {
        updates.lastName = lastName;
        needsUpdate = true;
      }

      if (needsUpdate) {
        athlete = this.updateAthlete(athlete.athleteId, updates) || athlete;
      }
      return athlete;
    }

    // If athlete not yet present in this device's storage, register them with the URL payload
    if (displayName || jerseyNumber) {
      const athletes = this.getAthletes();
      const newAthlete: Athlete = {
        athleteId: athleteId || `A${String(athletes.length + 1).padStart(3, '0')}`,
        firstName: firstName || displayName || 'Игрок',
        lastName: lastName || '',
        displayName: displayName || 'Игрок',
        jerseyNumber: jerseyNumber || '00',
        accessToken: cleanToken,
        active: true,
        createdAt: new Date().toISOString(),
      };
      athletes.push(newAthlete);
      localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(athletes));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('caspiy_athlete_updated', { detail: newAthlete }));
      }
      return newAthlete;
    }

    return null;
  }

  static getDailyWellness(dateStr: string): DailyWellness[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WELLNESS);
      const all: DailyWellness[] = data ? JSON.parse(data) : [];
      return all.filter((r) => r.date === dateStr);
    } catch {
      return [];
    }
  }

  static getAllWellnessRecords(): DailyWellness[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WELLNESS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static getAthleteRecordForDate(athleteId: string, dateStr: string): DailyWellness | null {
    const records = this.getDailyWellness(dateStr);
    return records.find((r) => r.athleteId === athleteId) || null;
  }

  static getAthleteHistory(athleteId: string, days: number = 28): DailyWellness[] {
    const all = this.getAllWellnessRecords();
    const athleteRecords = all.filter((r) => r.athleteId === athleteId);
    athleteRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return athleteRecords.slice(0, days);
  }

  /**
   * Saves or updates today's record.
   * STRICT RULE: Old records are NEVER overwritten. Only today's record (athleteId + today's date) is created or updated.
   */
  static async saveWellness(
    data: {
      athleteId?: string;
      token?: string;
      sleep: 1 | 2 | 3 | 4 | 5;
      fatigue: 1 | 2 | 3 | 4 | 5;
      muscleSoreness: 1 | 2 | 3 | 4 | 5;
      mood: 1 | 2 | 3 | 4 | 5;
      stress: 1 | 2 | 3 | 4 | 5;
      painPresent: boolean;
      painIntensity: number;
      painLocation: string;
      painLocationDetails?: string;
      illnessSymptoms: boolean;
      illnessDetails: string;
      illnessList?: string[];
    }
  ): Promise<{ success: boolean; message: string; record?: DailyWellness; isUpdate?: boolean; error?: string }> {
    this.init();
    const settings = this.getSettings();

    // 1. Identify athlete
    let athlete: Athlete | null = null;
    if (data.token) {
      athlete = this.findAthleteByToken(data.token);
    } else if (data.athleteId) {
      athlete = this.findAthleteById(data.athleteId);
    }

    if (!athlete) {
      return { success: false, message: '', error: 'Игрок не найден. Проверьте правильность персональной ссылки.' };
    }

    // 2. Automated server date (Asia/Almaty)
    const today = getAlmatyDate();
    const timestamp = new Date().toISOString();

    const { wellnessScore, wellnessPercent } = calculateWellnessScore(
      data.sleep,
      data.fatigue,
      data.muscleSoreness,
      data.mood,
      data.stress
    );

    let painLoc = data.painPresent ? data.painLocation : '—';
    if (data.painLocation === 'Другое' && data.painLocationDetails) {
      painLoc = `Другое: ${data.painLocationDetails}`;
    }

    const evalResult = evaluateHealthStatus(
      wellnessPercent,
      data.painPresent,
      data.painIntensity,
      data.illnessSymptoms,
      settings
    );

    const all = this.getAllWellnessRecords();
    const existingIndex = all.findIndex((r) => r.athleteId === athlete!.athleteId && r.date === today);

    let targetRecord: DailyWellness;
    let isUpdate = false;

    if (existingIndex >= 0) {
      // Update TODAY'S record
      isUpdate = true;
      targetRecord = {
        ...all[existingIndex],
        sleep: data.sleep,
        fatigue: data.fatigue,
        muscleSoreness: data.muscleSoreness,
        mood: data.mood,
        stress: data.stress,
        wellnessScore,
        wellnessPercent,
        painPresent: data.painPresent,
        painIntensity: data.painIntensity,
        painLocation: painLoc,
        painLocationDetails: data.painLocationDetails,
        illnessSymptoms: data.illnessSymptoms,
        illnessDetails: data.illnessDetails,
        illnessList: data.illnessList,
        status: evalResult.status,
        statusText: evalResult.statusLabel,
        updatedAt: timestamp,
      };
      all[existingIndex] = targetRecord;
    } else {
      // Create new record for today
      targetRecord = {
        recordId: `DW_${athlete.athleteId}_${today}`,
        date: today,
        timestamp,
        athleteId: athlete.athleteId,
        playerName: athlete.displayName,
        jerseyNumber: athlete.jerseyNumber,
        sleep: data.sleep,
        fatigue: data.fatigue,
        muscleSoreness: data.muscleSoreness,
        mood: data.mood,
        stress: data.stress,
        wellnessScore,
        wellnessPercent,
        painPresent: data.painPresent,
        painIntensity: data.painIntensity,
        painLocation: painLoc,
        painLocationDetails: data.painLocationDetails,
        illnessSymptoms: data.illnessSymptoms,
        illnessDetails: data.illnessDetails,
        illnessList: data.illnessList,
        status: evalResult.status,
        statusText: evalResult.statusLabel,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      all.push(targetRecord);
    }

    localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(all));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('caspiy_wellness_saved', { detail: targetRecord }));
    }

    // 1. Send to server: persists to database and forwards to Google Apps Script
    try {
      fetch('/api/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...targetRecord,
          token: athlete.accessToken,
          appsScriptUrl: settings.appsScriptUrl,
        }),
      }).then(async (res) => {
        if (res.ok) {
          const resJson = await res.json().catch(() => null);
          console.log('[Central Server & GAS Forward Result]:', resJson);
        }
      }).catch((e) => console.warn('Central server sync warning:', e));
    } catch (netErr) {
      console.warn('Network fetch error to /api/wellness:', netErr);
    }

    // 2. Direct browser-to-Google-Apps-Script fallback if appsScriptUrl is present
    if (settings.appsScriptUrl && settings.appsScriptUrl.trim() !== '') {
      try {
        fetch(settings.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors', // standard Apps Script POST
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'saveWellness',
            token: athlete.accessToken,
            athleteId: athlete.athleteId,
            playerName: athlete.displayName,
            jerseyNumber: athlete.jerseyNumber,
            data: targetRecord,
          }),
        }).catch((e) => console.warn('Apps Script direct sync background:', e));
      } catch (err) {
        console.warn('Apps script direct post error', err);
      }
    }

    return {
      success: true,
      message: isUpdate
        ? 'Сегодняшний wellness успешно обновлен.'
        : 'Спасибо. Сегодняшний wellness сохранен.',
      record: targetRecord,
      isUpdate,
    };
  }

  static getSettings(): ReportSettings {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = data ? JSON.parse(data) : {};

      const permanentGasUrl = (localStorage.getItem(STORAGE_KEYS.PERMANENT_GAS_URL) || '').trim();
      const envGasUrl = ((import.meta as any).env?.VITE_GOOGLE_APPS_SCRIPT_URL || '').trim();

      const effectiveGasUrl = (parsed.appsScriptUrl || '').trim() ||
                              permanentGasUrl ||
                              envGasUrl;

      const merged: ReportSettings = { ...DEFAULT_SETTINGS, ...parsed };
      if (effectiveGasUrl) {
        merged.appsScriptUrl = effectiveGasUrl;
      }
      return merged;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static updateSettings(newSettings: Partial<ReportSettings> & { forceClearAppsScriptUrl?: boolean }) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };

    const incomingUrl = newSettings.appsScriptUrl !== undefined ? newSettings.appsScriptUrl.trim() : undefined;
    if (incomingUrl && incomingUrl !== '') {
      updated.appsScriptUrl = incomingUrl;
      localStorage.setItem(STORAGE_KEYS.PERMANENT_GAS_URL, incomingUrl);
    } else if (newSettings.forceClearAppsScriptUrl) {
      updated.appsScriptUrl = '';
      localStorage.removeItem(STORAGE_KEYS.PERMANENT_GAS_URL);
    } else if (incomingUrl === '') {
      // Retain existing permanent URL if empty is provided without forceClear
      const permanent = (localStorage.getItem(STORAGE_KEYS.PERMANENT_GAS_URL) || '').trim();
      if (permanent) {
        updated.appsScriptUrl = permanent;
      }
    }

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));

    // Save to server so all devices and player phones immediately get updated settings
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((e) => console.warn('Failed to save settings to server:', e));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('caspiy_settings_updated', { detail: updated }));
    }
  }

  static async testGoogleAppsScript(url?: string): Promise<{ success: boolean; reachable?: boolean; httpStatus?: number; details?: any; error?: string }> {
    try {
      const res = await fetch('/api/gas/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err?.message || 'Ошибка соединения с сервером' };
    }
  }

  static async syncAllToGoogleSheets(): Promise<{ success: boolean; result?: any; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/gas/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err?.message || 'Ошибка синхронизации' };
    }
  }

  static async syncAthletesToGoogleSheets(): Promise<{ success: boolean; result?: any; message?: string; error?: string; count?: number }> {
    try {
      const res = await fetch('/api/gas/sync-athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err?.message || 'Ошибка синхронизации состава' };
    }
  }

  static addAthlete(athlete: { firstName: string; lastName: string; displayName: string; jerseyNumber: string }): Athlete {
    const athletes = this.getAthletes();
    const nextNum = athletes.length + 1;
    const athleteId = `A${String(nextNum).padStart(3, '0')}`;
    
    // Create compact URL-safe payload so the token works seamlessly on any device/browser
    const payload = {
      i: athleteId,
      d: athlete.displayName.trim(),
      j: athlete.jerseyNumber.trim(),
      f: athlete.firstName.trim() || athlete.displayName.trim(),
      l: athlete.lastName.trim(),
    };
    
    let accessToken: string;
    try {
      const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      accessToken = `tok_${b64}`;
    } catch {
      accessToken = `token_${Math.random().toString(36).substring(2, 9)}`;
    }

    const newAthlete: Athlete = {
      athleteId,
      firstName: athlete.firstName.trim() || athlete.displayName.trim(),
      lastName: athlete.lastName.trim(),
      displayName: athlete.displayName.trim(),
      jerseyNumber: athlete.jerseyNumber.trim(),
      accessToken,
      active: true,
      createdAt: new Date().toISOString(),
    };

    athletes.push(newAthlete);
    localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(athletes));

    // Save to central server
    fetch('/api/athletes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAthlete),
    }).catch((e) => console.warn('Failed to add athlete on server:', e));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('caspiy_athlete_updated', { detail: newAthlete }));
    }

    return newAthlete;
  }

  static resetToDefaultData() {
    localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(INITIAL_ATHLETES));
    localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(createSeedWellnessRecords()));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }

  /**
   * Generates UTF-8 CSV with Excel BOM
   */
  static exportCsv(dateStr: string): string {
    const records = this.getDailyWellness(dateStr);
    const headers = [
      'Date', 'Player', 'Jersey number', 'Sleep', 'Fatigue',
      'Muscle soreness', 'Mood', 'Stress', 'Wellness score',
      'Wellness percent', 'Pain', 'Pain location', 'Illness symptoms', 'Status'
    ];

    const rows = [headers.join(';')];
    records.forEach((r) => {
      const line = [
        r.date,
        `"${r.playerName}"`,
        r.jerseyNumber,
        r.sleep,
        r.fatigue,
        r.muscleSoreness,
        r.mood,
        r.stress,
        r.wellnessScore,
        `${r.wellnessPercent}%`,
        r.painPresent ? r.painIntensity : 0,
        `"${r.painLocation || ''}"`,
        `"${r.illnessSymptoms ? r.illnessDetails : 'Нет'}"`,
        r.status
      ];
      rows.push(line.join(';'));
    });

    return '\uFEFF' + rows.join('\r\n');
  }

  static getMedicalRehabRecords(): MedicalRehabRecord[] {
    return [
      {
        date: getAlmatyDate(),
        athleteId: 'A009',
        playerName: 'Bulatov Adlet',
        injury: 'Растяжение приводящей мышцы бедра',
        bodyPart: 'Пах',
        pain: 7,
        painWithLoad: 8,
        restriction: 'Исключить резкие ускорения и удары',
        modifiedTraining: 'Велотренажер + ЛФК стабилизация таза',
        rehabStatus: 'Active',
        returnToPlay: 'Ориентировочно 7-10 дней',
        medicalComment: 'Назначена физиотерапия, контроль через 48 часов',
        updatedAt: new Date().toISOString(),
      },
      {
        date: getAlmatyDate(),
        athleteId: 'A002',
        playerName: 'Arnold Knaub',
        injury: 'Тендинопатия связки надколенника',
        bodyPart: 'Колено',
        pain: 3,
        painWithLoad: 4,
        restriction: 'Ограничить прыжковую нагрузку',
        modifiedTraining: 'Изометрические упражнения, тренировка с контролем',
        rehabStatus: 'Modified',
        returnToPlay: 'В общей группе с ограничениями',
        medicalComment: 'Тейпирование перед тренировкой, лед после занятия',
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  static getTrainingLoadRecords(): TrainingLoadRecord[] {
    return [
      {
        date: getAlmatyDate(),
        athleteId: 'A001',
        playerName: 'Serikov Narun',
        trainingDuration: 90,
        sRPE: 7,
        sRPELoad: 630,
        HRmean: 152,
        HRpeak: 184,
        HRmax: 195,
        percentHRmax: 78,
        TRIMP: 145,
        comment: 'Основная тактическая тренировка + игра 5x5',
      },
      {
        date: getAlmatyDate(),
        athleteId: 'A012',
        playerName: 'Niknam Ali',
        trainingDuration: 75,
        sRPE: 6,
        sRPELoad: 450,
        HRmean: 138,
        HRpeak: 172,
        HRmax: 190,
        percentHRmax: 72,
        TRIMP: 110,
        comment: 'Вратарская специфика + реакция на ближние удары',
      },
    ];
  }
}
