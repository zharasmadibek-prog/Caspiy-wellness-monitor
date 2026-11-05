import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Default initial team members: 16 Caspiy Futsal players
const DEFAULT_ATHLETES = [
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

const DEFAULT_SETTINGS = {
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

interface DatabaseSchema {
  athletes: typeof DEFAULT_ATHLETES;
  wellness: any[];
  settings: typeof DEFAULT_SETTINGS;
  rehab: any[];
  trainingLoad: any[];
}

const ENV_GAS_URL = (process.env.GOOGLE_APPS_SCRIPT_URL || process.env.VITE_GOOGLE_APPS_SCRIPT_URL || '').trim();

function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      const settings = parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : { ...DEFAULT_SETTINGS };
      if (!settings.appsScriptUrl && ENV_GAS_URL) {
        settings.appsScriptUrl = ENV_GAS_URL;
      }
      return {
        athletes: Array.isArray(parsed.athletes) && parsed.athletes.length > 0 ? parsed.athletes : DEFAULT_ATHLETES,
        wellness: Array.isArray(parsed.wellness) ? parsed.wellness : [],
        settings,
        rehab: Array.isArray(parsed.rehab) ? parsed.rehab : [],
        trainingLoad: Array.isArray(parsed.trainingLoad) ? parsed.trainingLoad : [],
      };
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }

  const initialDb: DatabaseSchema = {
    athletes: DEFAULT_ATHLETES,
    wellness: [],
    settings: { ...DEFAULT_SETTINGS, appsScriptUrl: ENV_GAS_URL },
    rehab: [],
    trainingLoad: [],
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Forward wellness check-in to Google Apps Script Web App with redirect handling
async function forwardToGoogleAppsScript(appsScriptUrl: string, payload: any) {
  if (!appsScriptUrl || !appsScriptUrl.trim().startsWith('http')) {
    return { success: false, error: 'Google Apps Script URL is empty or invalid' };
  }

  try {
    console.log(`[GAS Forward] Sending to ${appsScriptUrl}...`);
    const response = await fetch(appsScriptUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow', // Follow 302 redirect from Google Apps Script
    });

    const text = await response.text();
    console.log(`[GAS Forward] Response status: ${response.status}, text: ${text.slice(0, 200)}`);
    try {
      const parsed = JSON.parse(text);
      return { success: true, gasResponse: parsed };
    } catch {
      return { success: response.ok, rawText: text };
    }
  } catch (error: any) {
    console.error('[GAS Forward] Failed to send to Google Apps Script:', error);
    return { success: false, error: error?.message || String(error) };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // CORS middleware for safety
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      serverTime: new Date().toISOString(),
      timezone: 'Asia/Aqtau (UTC+5)',
    });
  });

  // --- SETTINGS ---
  app.get('/api/settings', (req: Request, res: Response) => {
    const db = getDatabase();
    res.json({ success: true, settings: db.settings });
  });

  app.post('/api/settings', (req: Request, res: Response) => {
    const db = getDatabase();
    const incoming = req.body || {};
    const updated = { ...db.settings, ...incoming };

    // Prevent accidental erasing of appsScriptUrl:
    const incomingUrl = incoming.appsScriptUrl !== undefined ? String(incoming.appsScriptUrl).trim() : undefined;
    if (incomingUrl && incomingUrl !== '') {
      updated.appsScriptUrl = incomingUrl;
    } else if (incoming.forceClearAppsScriptUrl) {
      updated.appsScriptUrl = '';
    } else if (db.settings.appsScriptUrl) {
      // Retain existing URL if incoming is empty/missing and not force cleared
      updated.appsScriptUrl = db.settings.appsScriptUrl;
    }

    db.settings = updated;
    saveDatabase(db);
    res.json({ success: true, settings: db.settings });
  });

  // --- ATHLETES ---
  app.get('/api/athletes', (req: Request, res: Response) => {
    const db = getDatabase();
    res.json({ success: true, athletes: db.athletes });
  });

  app.post('/api/athletes', async (req: Request, res: Response) => {
    const db = getDatabase();
    const newAthlete = req.body;
    if (!newAthlete.athleteId) {
      newAthlete.athleteId = `A${String(db.athletes.length + 1).padStart(3, '0')}`;
    }
    if (!newAthlete.accessToken) {
      newAthlete.accessToken = `token_${Math.random().toString(36).substring(2, 9)}`;
    }
    if (newAthlete.active === undefined) {
      newAthlete.active = true;
    }
    newAthlete.createdAt = newAthlete.createdAt || new Date().toISOString();

    db.athletes.push(newAthlete);
    saveDatabase(db);

    // Automatically sync new athlete to Google Sheets if URL is configured
    if (db.settings.appsScriptUrl && db.settings.appsScriptUrl.trim() !== '') {
      forwardToGoogleAppsScript(db.settings.appsScriptUrl, {
        action: 'updateAthlete',
        athlete: newAthlete,
      }).catch((e) => console.warn('Auto-sync new athlete to GAS failed:', e));
    }

    res.json({ success: true, athlete: newAthlete });
  });

  app.put('/api/athletes/:athleteId', async (req: Request, res: Response) => {
    const db = getDatabase();
    const index = db.athletes.findIndex((a) => a.athleteId === req.params.athleteId);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Athlete not found' });
      return;
    }
    const current = db.athletes[index];
    const updated = { ...current, ...req.body };
    db.athletes[index] = updated;

    // Keep player details in wellness records updated too
    if (updated.displayName || updated.jerseyNumber) {
      db.wellness.forEach((r) => {
        if (r.athleteId === updated.athleteId) {
          if (updated.displayName) r.playerName = updated.displayName.toUpperCase();
          if (updated.jerseyNumber) r.jerseyNumber = updated.jerseyNumber;
        }
      });
    }

    saveDatabase(db);

    // Automatically sync updated athlete to Google Sheets if URL is configured!
    let gasSyncResult: any = null;
    if (db.settings.appsScriptUrl && db.settings.appsScriptUrl.trim() !== '') {
      gasSyncResult = await forwardToGoogleAppsScript(db.settings.appsScriptUrl, {
        action: 'updateAthlete',
        athlete: updated,
      });
    }

    res.json({ success: true, athlete: updated, gasSync: gasSyncResult });
  });

  app.delete('/api/athletes/:athleteId', async (req: Request, res: Response) => {
    const db = getDatabase();
    const athleteId = req.params.athleteId;
    db.athletes = db.athletes.filter((a) => a.athleteId !== athleteId);
    db.wellness = db.wellness.filter((r) => r.athleteId !== athleteId);
    saveDatabase(db);

    // Automatically sync deletion/deactivation to Google Sheets
    if (db.settings.appsScriptUrl && db.settings.appsScriptUrl.trim() !== '') {
      forwardToGoogleAppsScript(db.settings.appsScriptUrl, {
        action: 'deleteAthlete',
        athleteId,
      }).catch((e) => console.warn('Auto-sync delete athlete to GAS failed:', e));
    }

    res.json({ success: true, athleteId });
  });

  // --- WELLNESS ---
  app.get('/api/wellness', (req: Request, res: Response) => {
    const db = getDatabase();
    const date = req.query.date as string | undefined;
    const athleteId = req.query.athleteId as string | undefined;

    let records = db.wellness;
    if (date) {
      records = records.filter((r) => r.date === date);
    }
    if (athleteId) {
      records = records.filter((r) => r.athleteId === athleteId);
    }

    res.json({ success: true, records });
  });

  app.post('/api/wellness', async (req: Request, res: Response) => {
    const db = getDatabase();
    const record = req.body;

    if (!record || !record.date || !record.athleteId) {
      res.status(400).json({ success: false, error: 'Missing date or athleteId' });
      return;
    }

    // Save or update in central database
    const existingIndex = db.wellness.findIndex(
      (r) => r.athleteId === record.athleteId && r.date === record.date
    );

    let isUpdate = false;
    if (existingIndex >= 0) {
      isUpdate = true;
      db.wellness[existingIndex] = {
        ...db.wellness[existingIndex],
        ...record,
        updatedAt: new Date().toISOString(),
      };
    } else {
      const now = new Date().toISOString();
      db.wellness.push({
        ...record,
        recordId: record.recordId || `DW_${record.athleteId}_${record.date}`,
        createdAt: record.createdAt || now,
        updatedAt: now,
      });
    }

    saveDatabase(db);

    const savedRecord = existingIndex >= 0 ? db.wellness[existingIndex] : db.wellness[db.wellness.length - 1];

    // Find athlete token and metadata for Google Apps Script forward
    const athlete = db.athletes.find((a) => a.athleteId === record.athleteId);

    // Forward to Google Apps Script Web App (using server URL or client-provided fallback)
    let gasSyncResult: any = null;
    const targetGasUrl = (db.settings.appsScriptUrl || record.appsScriptUrl || '').trim();
    if (targetGasUrl && targetGasUrl.startsWith('http')) {
      // Auto-heal: If server didn't have appsScriptUrl saved yet, store it permanently
      if (!db.settings.appsScriptUrl) {
        db.settings.appsScriptUrl = targetGasUrl;
        saveDatabase(db);
      }

      gasSyncResult = await forwardToGoogleAppsScript(targetGasUrl, {
        action: 'saveWellness',
        token: athlete?.accessToken || record.token || '',
        athleteId: record.athleteId,
        playerName: record.playerName || athlete?.displayName || '',
        jerseyNumber: record.jerseyNumber || athlete?.jerseyNumber || '',
        data: savedRecord,
      });
    }

    res.json({
      success: true,
      record: savedRecord,
      isUpdate,
      gasSync: gasSyncResult,
    });
  });

  // --- GAS INTEGRATION UTILITIES ---
  app.post('/api/gas/test', async (req: Request, res: Response) => {
    const db = getDatabase();
    const testUrl = (req.body.url || db.settings.appsScriptUrl || '').trim();

    if (!testUrl || !testUrl.startsWith('http')) {
      res.status(400).json({ success: false, error: 'Укажите корректный URL Google Apps Script Web App' });
      return;
    }

    try {
      console.log(`[GAS Test] Testing connection to ${testUrl}...`);
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping' }),
        redirect: 'follow',
      });

      const text = await response.text();
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        // Not JSON
      }

      res.json({
        success: true,
        httpStatus: response.status,
        reachable: response.ok,
        details: parsed || text.slice(0, 300),
      });
    } catch (err: any) {
      console.error('[GAS Test] Error testing URL:', err);
      res.json({
        success: false,
        error: err?.message || String(err),
      });
    }
  });

  // Send a real test check-in row to verify Google Sheets integration
  app.post('/api/gas/test-checkin', async (req: Request, res: Response) => {
    const db = getDatabase();
    const url = (req.body.url || db.settings.appsScriptUrl || '').trim();
    if (!url || !url.startsWith('http')) {
      res.status(400).json({ success: false, error: 'Google Apps Script URL не настроен' });
      return;
    }

    // Auto-heal: If server didn't have appsScriptUrl saved yet, store it permanently
    if (!db.settings.appsScriptUrl) {
      db.settings.appsScriptUrl = url;
      saveDatabase(db);
    }

    const firstAthlete = db.athletes[0] || DEFAULT_ATHLETES[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const testRecord = {
      recordId: `TEST_${firstAthlete.athleteId}_${todayStr}`,
      date: todayStr,
      timestamp: new Date().toISOString(),
      athleteId: firstAthlete.athleteId,
      playerName: firstAthlete.displayName,
      jerseyNumber: firstAthlete.jerseyNumber,
      sleep: 4,
      fatigue: 4,
      muscleSoreness: 4,
      mood: 5,
      stress: 4,
      wellnessScore: 4.2,
      wellnessPercent: 84,
      painPresent: false,
      painIntensity: 0,
      painLocation: '—',
      illnessSymptoms: false,
      illnessDetails: 'Нет (Тестовая проверка связи)',
      status: 'GREEN',
    };

    const forwardRes = await forwardToGoogleAppsScript(url, {
      action: 'saveWellness',
      token: firstAthlete.accessToken,
      athleteId: firstAthlete.athleteId,
      playerName: firstAthlete.displayName,
      jerseyNumber: firstAthlete.jerseyNumber,
      data: testRecord,
    });

    res.json({
      success: forwardRes.success,
      details: forwardRes,
      athlete: firstAthlete.displayName,
    });
  });

  // Bulk sync all data from server database to Google Sheets
  app.post('/api/gas/sync-all', async (req: Request, res: Response) => {
    const db = getDatabase();
    const url = db.settings.appsScriptUrl?.trim();
    if (!url || !url.startsWith('http')) {
      res.status(400).json({ success: false, error: 'Google Apps Script URL не настроен' });
      return;
    }

    try {
      console.log(`[GAS SyncAll] Syncing ${db.athletes.length} athletes and ${db.wellness.length} wellness records...`);
      const payload = {
        action: 'syncAll',
        athletes: db.athletes,
        wellness: db.wellness,
        settings: db.settings,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      const text = await response.text();
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {}

      res.json({
        success: true,
        httpStatus: response.status,
        result: parsed || text.slice(0, 300),
      });
    } catch (err: any) {
      console.error('[GAS SyncAll] Error during sync-all:', err);
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  // Sync only athletes roster to Google Sheets
  app.post('/api/gas/sync-athletes', async (req: Request, res: Response) => {
    const db = getDatabase();
    const url = db.settings.appsScriptUrl?.trim();
    if (!url || !url.startsWith('http')) {
      res.status(400).json({ success: false, error: 'Google Apps Script URL не настроен' });
      return;
    }

    try {
      console.log(`[GAS SyncAthletes] Syncing ${db.athletes.length} athletes to Google Sheets...`);
      const payload = {
        action: 'syncAthletes',
        athletes: db.athletes,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      const text = await response.text();
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {}

      res.json({
        success: true,
        httpStatus: response.status,
        result: parsed || text.slice(0, 300),
        count: db.athletes.length,
      });
    } catch (err: any) {
      console.error('[GAS SyncAthletes] Error during sync-athletes:', err);
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  // --- REHAB & TRAINING LOAD ---
  app.get('/api/rehab', (req: Request, res: Response) => {
    const db = getDatabase();
    res.json({ success: true, records: db.rehab });
  });

  app.post('/api/rehab', (req: Request, res: Response) => {
    const db = getDatabase();
    const record = req.body;
    const existingIndex = db.rehab.findIndex(
      (r) => r.athleteId === record.athleteId && r.date === record.date
    );
    if (existingIndex >= 0) {
      db.rehab[existingIndex] = { ...db.rehab[existingIndex], ...record, updatedAt: new Date().toISOString() };
    } else {
      db.rehab.push({ ...record, updatedAt: new Date().toISOString() });
    }
    saveDatabase(db);
    res.json({ success: true, record });
  });

  app.get('/api/training-load', (req: Request, res: Response) => {
    const db = getDatabase();
    res.json({ success: true, records: db.trainingLoad });
  });

  app.post('/api/training-load', (req: Request, res: Response) => {
    const db = getDatabase();
    const record = req.body;
    db.trainingLoad.push(record);
    saveDatabase(db);
    res.json({ success: true, record });
  });

  // VITE DEV MIDDLEWARE OR PRODUCTION STATIC FILES
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Caspiy Futsal Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Error]', err);
  process.exit(1);
});
