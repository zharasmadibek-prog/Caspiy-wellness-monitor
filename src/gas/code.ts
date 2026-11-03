/**
 * Complete, production-ready Google Apps Script backend code
 * for Caspiy Futsal Club Wellness & Recovery Monitor.
 *
 * This code can be copied directly into script.google.com editor.
 */

export const GAS_CODE_GS = `/**
 * ============================================================================
 * CASPIY FUTSAL CLUB — WELLNESS & RECOVERY MONITOR BACKEND
 * ============================================================================
 * Google Apps Script Web App for daily player wellness and coach reporting.
 * Completely free: uses Google Sheets as database and Google Drive for PDF.
 * Timezone: Asia/Aqtau (UTC+5)
 * ============================================================================
 */

// CONFIGURATION & CONSTANTS
var TIMEZONE = "Asia/Aqtau";
var SPREADSHEET_ID = ""; // Leave blank if script is bound to sheet, or paste Sheet ID

var SHEETS = {
  ATHLETES: "ATHLETES",
  DAILY_WELLNESS: "DAILY_WELLNESS",
  MEDICAL_REHAB: "MEDICAL_REHAB",
  TRAINING_LOAD: "TRAINING_LOAD",
  REPORT_SETTINGS: "REPORT_SETTINGS"
};

/**
 * Returns the active spreadsheet instance
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Formats a Date object to YYYY-MM-DD in Asia/Aqtau
 */
function getAqtauDateString(date) {
  var d = date || new Date();
  return Utilities.formatDate(d, TIMEZONE, "yyyy-MM-dd");
}

function getAlmatyDateString(date) {
  return getAqtauDateString(date);
}

/**
 * ============================================================================
 * 1. SPREADSHEET INITIALIZATION (Run once)
 * ============================================================================
 */
function setupSpreadsheet() {
  var ss = getSpreadsheet();
  
  // 1. ATHLETES SHEET
  var athletesSheet = ss.getSheetByName(SHEETS.ATHLETES);
  if (!athletesSheet) {
    athletesSheet = ss.insertSheet(SHEETS.ATHLETES);
  }
  athletesSheet.clear();
  var athletesHeaders = [
    "athleteId", "firstName", "lastName", "displayName",
    "jerseyNumber", "accessToken", "active", "createdAt"
  ];
  athletesSheet.appendRow(athletesHeaders);
  formatHeaderRow(athletesSheet, athletesHeaders.length, "#1e3a8a");

  // 2. DAILY_WELLNESS SHEET
  var wellnessSheet = ss.getSheetByName(SHEETS.DAILY_WELLNESS);
  if (!wellnessSheet) {
    wellnessSheet = ss.insertSheet(SHEETS.DAILY_WELLNESS);
  }
  if (wellnessSheet.getLastRow() === 0) {
    var wellnessHeaders = [
      "recordId", "date", "timestamp", "athleteId", "playerName",
      "jerseyNumber", "sleep", "fatigue", "muscleSoreness", "mood",
      "stress", "wellnessScore", "wellnessPercent", "painPresent",
      "painIntensity", "painLocation", "illnessSymptoms", "illnessDetails",
      "status", "createdAt", "updatedAt"
    ];
    wellnessSheet.appendRow(wellnessHeaders);
    formatHeaderRow(wellnessSheet, wellnessHeaders.length, "#0f766e");
  }

  // 3. MEDICAL_REHAB SHEET
  var rehabSheet = ss.getSheetByName(SHEETS.MEDICAL_REHAB);
  if (!rehabSheet) {
    rehabSheet = ss.insertSheet(SHEETS.MEDICAL_REHAB);
  }
  if (rehabSheet.getLastRow() === 0) {
    var rehabHeaders = [
      "date", "athleteId", "playerName", "injury", "bodyPart",
      "pain", "painWithLoad", "restriction", "modifiedTraining",
      "rehabStatus", "returnToPlay", "medicalComment", "updatedAt"
    ];
    rehabSheet.appendRow(rehabHeaders);
    formatHeaderRow(rehabSheet, rehabHeaders.length, "#b45309");
  }

  // 4. TRAINING_LOAD SHEET
  var loadSheet = ss.getSheetByName(SHEETS.TRAINING_LOAD);
  if (!loadSheet) {
    loadSheet = ss.insertSheet(SHEETS.TRAINING_LOAD);
  }
  if (loadSheet.getLastRow() === 0) {
    var loadHeaders = [
      "date", "athleteId", "playerName", "trainingDuration",
      "sRPE", "sRPELoad", "HRmean", "HRpeak", "HRmax",
      "percentHRmax", "TRIMP", "comment"
    ];
    loadSheet.appendRow(loadHeaders);
    formatHeaderRow(loadSheet, loadHeaders.length, "#4338ca");
  }

  // 5. REPORT_SETTINGS SHEET
  var settingsSheet = ss.getSheetByName(SHEETS.REPORT_SETTINGS);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SHEETS.REPORT_SETTINGS);
  }
  settingsSheet.clear();
  settingsSheet.appendRow(["settingKey", "settingValue", "description"]);
  formatHeaderRow(settingsSheet, 3, "#334155");
  settingsSheet.appendRow(["teamName", "МФК КАСПИЙ (CASPIY FUTSAL CLUB)", "Название команды"]);
  settingsSheet.appendRow(["timezone", "Asia/Almaty", "Часовой пояс команды"]);
  settingsSheet.appendRow(["wellnessGreen", "80", "Порог Wellness GREEN (в %)"]);
  settingsSheet.appendRow(["wellnessYellow", "70", "Порог Wellness YELLOW (в %)"]);
  settingsSheet.appendRow(["wellnessOrange", "60", "Порог Wellness ORANGE (в %)"]);
  settingsSheet.appendRow(["painWarning", "4", "Порог боли для внимания (0-10)"]);
  settingsSheet.appendRow(["painSevere", "7", "Порог сильной боли (0-10)"]);
  settingsSheet.appendRow(["adminPassword", "caspiy2026", "Пароль для входа в Dashboard"]);

  Logger.log("База данных Google Sheets успешно инициализирована!");
}

/**
 * Styling helper for table headers in Google Sheets
 */
function formatHeaderRow(sheet, numColumns, bgColorHex) {
  var range = sheet.getRange(1, 1, 1, numColumns);
  range.setBackground(bgColorHex);
  range.setFontColor("#ffffff");
  range.setFontWeight("bold");
  range.setFontFamily("Arial");
  range.setFontSize(10);
  range.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

/**
 * Adds default Caspiy Futsal players with permanent tokens
 */
function addTestAthletes() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.ATHLETES);
  if (!sheet) {
    setupSpreadsheet();
    sheet = ss.getSheetByName(SHEETS.ATHLETES);
  }

  var now = new Date().toISOString();
  var defaultAthletes = [
    ["A001", "Narun", "Serikov", "Serikov Narun", "2", "tok_eyJpIjoiQTAwMSIsImQiOiJTZXJpa292IE5hcnVuIiwiaiI6IjIiLCJmIjoiTmFydW4iLCJsIjoiU2VyaWtvdiJ9", true, now],
    ["A002", "Arnold", "Knaub", "Arnold Knaub", "3", "tok_eyJpIjoiQTAwMiIsImQiOiJBcm5vbGQgS25hdWIiLCJqIjoiMyIsImYiOiJBcm5vbGQiLCJsIjoiS25hdWIifQ", true, now],
    ["A003", "Sabit", "Uzakbaev", "Uzakbaev Sabit", "6", "tok_eyJpIjoiQTAwMyIsImQiOiJVemFrYmFldiBTYWJpdCIsImoiOiI2IiwiZiI6IlNhYml0IiwibCI6IlV6YWtiYWV2In0", true, now],
    ["A004", "Gaziz", "Nagashybay", "Nagashybay Gaziz", "8", "tok_eyJpIjoiQTAwNCIsImQiOiJOYWdhc2h5YmF5IEdheml6IiwiaiI6IjgiLCJmIjoiR2F6aXoiLCJsIjoiTmFnYXNoeWJheSJ9", true, now],
    ["A005", "Raymbek", "Zhuma", "Zhuma Raymbek", "10", "tok_eyJpIjoiQTAwNSIsImQiOiJaaHVtYSBSYXltYmVrIiwiaiI6IjEwIiwiZiI6IlJheW1iZWsiLCJsIjoiWmh1bWEifQ", true, now],
    ["A006", "Damir", "Qairbay", "Qairbay Damir", "11", "tok_eyJpIjoiQTAwNiIsImQiOiJRYWlyYmF5IERhbWlyIiwiaiI6IjExIiwiZiI6IkRhbWlyIiwibCI6IlFhaXJiYXkifQ", true, now],
    ["A007", "Allbergen", "Tanataruly", "Tanataruly Allbergen", "13", "tok_eyJpIjoiQTAwNyIsImQiOiJUYW5hdGFydWx5IEFsbGJlcmdlbiIsImoiOiIxMyIsImYiOiJBbGxiZXJnZW4iLCJsIjoiVGFuYXRhcnVseSJ9", true, now],
    ["A008", "Rasul", "Nurbai", "Nurbai Rasul", "14", "tok_eyJpIjoiQTAwOCIsImQiOiJOdXJiYWkgUmFzdWwiLCJqIjoiMTQiLCJmIjoiUmFzdWwiLCJsIjoiTnVyYmFpIn0", true, now],
    ["A009", "Adlet", "Bulatov", "Bulatov Adlet", "16", "tok_eyJpIjoiQTAwOSIsImQiOiJCdWxhdG92IEFkbGV0IiwiaiI6IjE2IiwiZiI6IkFkbGV0IiwibCI6IkJ1bGF0b3YifQ", true, now],
    ["A010", "Rakhat", "Tolegen", "Tolegen Rakhat", "17", "tok_eyJpIjoiQTAxMCIsImQiOiJUb2xlZ2VuIFJha2hhdCIsImoiOiIxNyIsImYiOiJSYWtoYXQiLCJsIjoiVG9sZWdlbiJ9", true, now],
    ["A011", "Adaybek", "Altynbek", "Altynbek Adaybek", "21", "tok_eyJpIjoiQTAxMSIsImQiOiJBbHR5bmJlayBBZGF5YmVrIiwiaiI6IjIxIiwiZiI6IkFkYXliZWsiLCJsIjoiQWx0eW5iZWsifQ", true, now],
    ["A012", "Ali", "Niknam", "Niknam Ali", "22", "tok_eyJpIjoiQTAxMiIsImQiOiJOaWtuYW0gQWxpIiwiaiI6IjIyIiwiZiI6IkFsaSIsImwiOiJOaWtuYW0ifQ", true, now],
    ["A013", "Erbol", "Sauyrbaev", "Sauyrbaev Erbol", "23", "tok_eyJpIjoiQTAxMyIsImQiOiJTYXV5cmJhZXYgRXJib2wiLCJqIjoiMjMiLCJmIjoiRXJib2wiLCJsIjoiU2F1eXJiYWV2In0", true, now],
    ["A014", "Maksat", "Orysbai", "Orysbai Maksat", "26", "tok_eyJpIjoiQTAxNCIsImQiOiJPcnlzYmFpIE1ha3NhdCIsImoiOiIyNiIsImYiOiJNYWtzYXQiLCJsIjoiT3J5c2JhaSJ9", true, now],
    ["A015", "Erzhan", "Karmenov", "Karmenov Erzhan", "77", "tok_eyJpIjoiQTAxNSIsImQiOiJLYXJtZW5vdiBFcnpoYW4iLCJqIjoiNzciLCJmIjoiRXJ6aGFuIiwibCI6Ikthcm1lbm92In0", true, now],
    ["A016", "Nursultan", "Tanatuly", "Tanatuly Nursultan", "79", "tok_eyJpIjoiQTAxNiIsImQiOiJUYW5hdHVseSBOdXJzdWx0YW4iLCJqIjoiNzkiLCJmIjoiTnVyc3VsdGFuIiwibCI6IlRhbmF0dWx5In0", true, now]
  ];

  // Check if athletes already exist
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    sheet.getRange(2, 1, defaultAthletes.length, 8).setValues(defaultAthletes);
    Logger.log("Добавлено " + defaultAthletes.length + " игроков Caspiy!");
  } else {
    Logger.log("Список игроков уже заполнен.");
  }
}

/**
 * ============================================================================
 * 2. WEB APP HTTP HANDLERS (doGet / doPost)
 * ============================================================================
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
  
  if (action === "ping") {
    return createJsonResponse({
      success: true,
      message: "Google Apps Script connection OK",
      time: new Date().toISOString(),
      timezone: TIMEZONE
    });
  }

  // Return JSON response for API queries
  if (action === "getAthletes") {
    return createJsonResponse({ success: true, athletes: getAllAthletes() });
  }
  if (action === "getAthleteByToken") {
    var token = e.parameter.token;
    var athlete = findAthleteByToken(token);
    if (!athlete) {
      return createJsonResponse({ success: false, error: "Игрок не найден по токену" });
    }
    // Also fetch today's record if exists
    var todayStr = getAlmatyDateString();
    var todayRecord = getAthleteRecordForDate(athlete.athleteId, todayStr);
    return createJsonResponse({
      success: true,
      athlete: athlete,
      serverDate: todayStr,
      todayRecord: todayRecord
    });
  }
  if (action === "getDailyWellness") {
    var date = e.parameter.date || getAlmatyDateString();
    var records = getWellnessForDate(date);
    return createJsonResponse({ success: true, date: date, records: records });
  }
  if (action === "getAthleteHistory") {
    var athleteId = e.parameter.athleteId;
    var days = parseInt(e.parameter.days || "28", 10);
    var history = getAthleteHistory(athleteId, days);
    return createJsonResponse({ success: true, athleteId: athleteId, history: history });
  }
  if (action === "getSettings") {
    return createJsonResponse({ success: true, settings: getSettings() });
  }
  if (action === "downloadCsv") {
    var csvDate = e.parameter.date || getAlmatyDateString();
    var csvData = generateCsvForDate(csvDate);
    return ContentService.createTextOutput(csvData)
      .setMimeType(ContentService.MimeType.CSV)
      .downloadAsFile("caspiy_wellness_" + csvDate + ".csv");
  }

  // Default web app page
  return createJsonResponse({
    success: true,
    service: "CASPIY FUTSAL MONITORING API",
    status: "online",
    time: new Date().toISOString()
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.tryLock(10000);
  } catch (lockErr) {}

  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        body = e.parameter || {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    var action = body.action || "saveWellness";

    if (action === "ping") {
      return createJsonResponse({
        success: true,
        message: "Google Apps Script connection OK",
        time: new Date().toISOString()
      });
    }

    if (action === "saveWellness") {
      var recordData = body.data || body;
      var explicitToken = body.token || (body.data ? body.data.token : "");
      var result = handleSaveWellness(recordData, explicitToken);
      return createJsonResponse(result);
    }

    if (action === "updateAthlete") {
      var updateAthleteResult = handleUpdateAthlete(body.athlete || body.data || body);
      return createJsonResponse(updateAthleteResult);
    }

    if (action === "syncAthletes") {
      var syncAthletesResult = handleSyncAthletes(body.athletes || body.data || body);
      return createJsonResponse(syncAthletesResult);
    }

    if (action === "deleteAthlete") {
      var deleteResult = handleDeleteAthlete(body.athleteId);
      return createJsonResponse(deleteResult);
    }

    if (action === "syncAll") {
      var syncResult = handleSyncAll(body);
      return createJsonResponse(syncResult);
    }

    if (action === "generatePdf") {
      var pdfResult = createPdfReport(body.date || getAlmatyDateString());
      return createJsonResponse(pdfResult);
    }

    return createJsonResponse({ success: false, error: "Неизвестное действие: " + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

/**
 * ============================================================================
 * 3. BUSINESS LOGIC & SHEET ACCESS
 * ============================================================================
 */

function getAllAthletes() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.ATHLETES);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var athletes = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0]) {
      athletes.push({
        athleteId: String(row[0]),
        firstName: String(row[1] || ""),
        lastName: String(row[2] || ""),
        displayName: String(row[3] || ""),
        jerseyNumber: String(row[4] || ""),
        accessToken: String(row[5] || ""),
        active: Boolean(row[6] !== false),
        createdAt: String(row[7] || "")
      });
    }
  }
  return athletes;
}

function findAthleteByToken(token) {
  if (!token) return null;
  var clean = String(token).trim().toLowerCase();
  var athletes = getAllAthletes();
  for (var i = 0; i < athletes.length; i++) {
    if (String(athletes[i].accessToken).trim().toLowerCase() === clean) {
      return athletes[i];
    }
  }
  return null;
}

function findAthleteById(athleteId) {
  if (!athleteId) return null;
  var clean = String(athleteId).trim().toLowerCase();
  var athletes = getAllAthletes();
  for (var i = 0; i < athletes.length; i++) {
    if (String(athletes[i].athleteId).trim().toLowerCase() === clean) {
      return athletes[i];
    }
  }
  return null;
}

function findAthleteByName(name) {
  if (!name) return null;
  var clean = String(name).trim().toUpperCase();
  var athletes = getAllAthletes();
  for (var i = 0; i < athletes.length; i++) {
    if (String(athletes[i].displayName).trim().toUpperCase() === clean) {
      return athletes[i];
    }
  }
  return null;
}

function getWellnessForDate(dateStr) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.DAILY_WELLNESS);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var records = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowDate = String(row[1]);
    if (rowDate === dateStr) {
      records.push(rowToWellnessRecord(row));
    }
  }
  return records;
}

function getAthleteRecordForDate(athleteId, dateStr) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.DAILY_WELLNESS);
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[3]) === athleteId && String(row[1]) === dateStr) {
      return rowToWellnessRecord(row);
    }
  }
  return null;
}

function getAthleteHistory(athleteId, days) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.DAILY_WELLNESS);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();

  var records = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[3]) === athleteId) {
      records.push(rowToWellnessRecord(row));
    }
  }
  // Sort descending by date
  records.sort(function(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  return records.slice(0, days);
}

/**
 * Saves or updates a daily wellness record.
 * GUARANTEES: One check-in per athlete per date.
 * If record exists for (athleteId + date) -> UPDATES in place.
 * If not exists -> APPENDS new row.
 * Old dates are NEVER overwritten.
 * Auto-registers athlete in ATHLETES sheet if not yet present so submissions NEVER fail!
 */
function handleSaveWellness(data, explicitToken) {
  var token = explicitToken || data.token || "";
  var athleteId = data.athleteId || "";
  var playerName = data.playerName || data.displayName || "";
  var jerseyNumber = data.jerseyNumber || "00";

  var athlete = null;
  if (token) {
    athlete = findAthleteByToken(token);
  }
  if (!athlete && athleteId) {
    athlete = findAthleteById(athleteId);
  }
  if (!athlete && playerName) {
    athlete = findAthleteByName(playerName);
  }

  var ss = getSpreadsheet();
  var athSheet = ss.getSheetByName(SHEETS.ATHLETES);
  if (!athSheet) {
    setupSpreadsheet();
    athSheet = ss.getSheetByName(SHEETS.ATHLETES);
  }

  // AUTO-REGISTER athlete in Google Sheets if not found yet
  if (!athlete) {
    athlete = {
      athleteId: athleteId || ("A" + Utilities.formatDate(new Date(), TIMEZONE, "mmss")),
      firstName: playerName || "Игрок",
      lastName: "",
      displayName: playerName || "Игрок",
      jerseyNumber: String(jerseyNumber),
      accessToken: token || ("tok_" + Utilities.getUuid()),
      active: true,
      createdAt: new Date().toISOString()
    };

    athSheet.appendRow([
      athlete.athleteId,
      athlete.firstName,
      athlete.lastName,
      athlete.displayName,
      athlete.jerseyNumber,
      athlete.accessToken,
      true,
      athlete.createdAt
    ]);
  } else if (playerName || jerseyNumber) {
    // AUTOMATIC UPDATE: If coach edited the player's name/number on the site, automatically sync to ATHLETES sheet!
    var latestName = playerName || athlete.displayName;
    var latestJersey = String(jerseyNumber || athlete.jerseyNumber);
    if (athlete.displayName !== latestName || athlete.jerseyNumber !== latestJersey) {
      athlete.displayName = latestName;
      athlete.jerseyNumber = latestJersey;
      var curAthletes = athSheet.getDataRange().getValues();
      for (var rIdx = 1; rIdx < curAthletes.length; rIdx++) {
        if (String(curAthletes[rIdx][0]) === athlete.athleteId) {
          athSheet.getRange(rIdx + 1, 4).setValue(latestName);
          athSheet.getRange(rIdx + 1, 5).setValue(latestJersey);
          break;
        }
      }
    }
  }

  // Date in Asia/Aqtau (UTC+5)
  var todayStr = data.date || getAlmatyDateString();
  var timestamp = data.timestamp || new Date().toISOString();

  // Validate wellness inputs
  var sleep = parseInt(data.sleep || 4, 10);
  var fatigue = parseInt(data.fatigue || 4, 10);
  var muscleSoreness = parseInt(data.muscleSoreness || 4, 10);
  var mood = parseInt(data.mood || 4, 10);
  var stress = parseInt(data.stress || 4, 10);

  var sum = sleep + fatigue + muscleSoreness + mood + stress;
  var wellnessScore = Math.round((sum / 5) * 10) / 10;
  var wellnessPercent = Math.round((wellnessScore / 5) * 100);

  var painPresent = Boolean(data.painPresent);
  var painIntensity = painPresent ? parseInt(data.painIntensity || 0, 10) : 0;
  var painLocation = painPresent ? (data.painLocation || "") : "—";
  if (painLocation === "Другое" && data.painLocationDetails) {
    painLocation = "Другое: " + data.painLocationDetails;
  }

  var illnessSymptoms = Boolean(data.illnessSymptoms);
  var illnessDetails = illnessSymptoms ? (data.illnessDetails || "Есть симптомы") : "Нет";

  // Calculate status
  var status = "GREEN";
  if (wellnessPercent < 60 || painIntensity >= 7 || illnessSymptoms) {
    status = "RED";
  } else if (wellnessPercent < 70 || painIntensity >= 4) {
    status = "ORANGE";
  } else if (wellnessPercent < 80) {
    status = "YELLOW";
  }

  var wellnessSheet = ss.getSheetByName(SHEETS.DAILY_WELLNESS);
  if (!wellnessSheet) {
    setupSpreadsheet();
    wellnessSheet = ss.getSheetByName(SHEETS.DAILY_WELLNESS);
  }

  var values = wellnessSheet.getDataRange().getValues();
  var existingRowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    // Check athleteId + date, or playerName + date
    if ((String(values[i][3]) === athlete.athleteId || String(values[i][4]).toUpperCase() === athlete.displayName.toUpperCase()) && String(values[i][1]) === todayStr) {
      existingRowIndex = i + 1; // 1-indexed row number
      break;
    }
  }

  var recordId = data.recordId || ("DW_" + athlete.athleteId + "_" + todayStr);

  var rowValues = [
    recordId,
    todayStr,
    timestamp,
    athlete.athleteId,
    athlete.displayName,
    athlete.jerseyNumber,
    sleep,
    fatigue,
    muscleSoreness,
    mood,
    stress,
    wellnessScore,
    wellnessPercent,
    painPresent,
    painIntensity,
    painLocation,
    illnessSymptoms,
    illnessDetails,
    status,
    (existingRowIndex > 0 ? values[existingRowIndex - 1][19] : timestamp), // createdAt
    timestamp // updatedAt
  ];

  if (existingRowIndex > 0) {
    // UPDATE existing record for today
    wellnessSheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    return {
      success: true,
      message: "Сегодняшний wellness успешно обновлен в Google Таблице.",
      isUpdate: true,
      record: rowToWellnessRecord(rowValues)
    };
  } else {
    // CREATE new record for today
    wellnessSheet.appendRow(rowValues);
    return {
      success: true,
      message: "Спасибо! Wellness игрока успешно записан в Google Таблицу.",
      isUpdate: false,
      record: rowToWellnessRecord(rowValues)
    };
  }
}

/**
 * Bulk sync all athletes and wellness records into Google Sheets
 */
function handleSyncAll(body) {
  var ss = getSpreadsheet();
  var athletes = body.athletes || [];
  var wellnessRecords = body.wellness || [];

  var athSheet = ss.getSheetByName(SHEETS.ATHLETES);
  if (!athSheet) {
    setupSpreadsheet();
    athSheet = ss.getSheetByName(SHEETS.ATHLETES);
  }

  var existingAthletes = getAllAthletes();
  var existingMap = {};
  for (var a = 0; a < existingAthletes.length; a++) {
    existingMap[existingAthletes[a].athleteId] = true;
  }

  var addedAthletes = 0;
  for (var i = 0; i < athletes.length; i++) {
    var ath = athletes[i];
    if (!existingMap[ath.athleteId]) {
      athSheet.appendRow([
        ath.athleteId,
        ath.firstName || "",
        ath.lastName || "",
        ath.displayName || ath.firstName || "Игрок",
        ath.jerseyNumber || "00",
        ath.accessToken || "",
        true,
        ath.createdAt || new Date().toISOString()
      ]);
      existingMap[ath.athleteId] = true;
      addedAthletes++;
    }
  }

  var syncedWellness = 0;
  for (var w = 0; w < wellnessRecords.length; w++) {
    handleSaveWellness(wellnessRecords[w], wellnessRecords[w].token);
    syncedWellness++;
  }

  return {
    success: true,
    addedAthletes: addedAthletes,
    syncedWellness: syncedWellness,
    message: "Синхронизировано игроков: " + addedAthletes + ", записей wellness: " + syncedWellness
  };
}

/**
 * Updates a single athlete's profile in the ATHLETES sheet and syncs names in DAILY_WELLNESS
 */
function handleUpdateAthlete(athlete) {
  if (!athlete || !athlete.athleteId) {
    return { success: false, error: "Не указан ID игрока" };
  }
  var ss = getSpreadsheet();
  var athSheet = ss.getSheetByName(SHEETS.ATHLETES);
  if (!athSheet) {
    setupSpreadsheet();
    athSheet = ss.getSheetByName(SHEETS.ATHLETES);
  }

  var data = athSheet.getDataRange().getValues();
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toUpperCase() === String(athlete.athleteId).trim().toUpperCase()) {
      targetRow = i + 1;
      break;
    }
  }

  var rowValues = [
    athlete.athleteId,
    athlete.firstName || "",
    athlete.lastName || "",
    athlete.displayName || athlete.firstName || "Игрок",
    String(athlete.jerseyNumber || "00"),
    athlete.accessToken || (targetRow > 0 ? data[targetRow - 1][5] : ("tok_" + Utilities.getUuid())),
    athlete.active !== false,
    athlete.createdAt || (targetRow > 0 ? data[targetRow - 1][7] : new Date().toISOString())
  ];

  if (targetRow > 0) {
    athSheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    athSheet.appendRow(rowValues);
  }

  // Also update player name and jersey number in DAILY_WELLNESS sheet
  var wellnessSheet = ss.getSheetByName(SHEETS.DAILY_WELLNESS);
  if (wellnessSheet && wellnessSheet.getLastRow() > 1) {
    var wData = wellnessSheet.getDataRange().getValues();
    for (var w = 1; w < wData.length; w++) {
      if (String(wData[w][3]) === String(athlete.athleteId)) {
        wellnessSheet.getRange(w + 1, 5).setValue(rowValues[3]); // playerName
        wellnessSheet.getRange(w + 1, 6).setValue(rowValues[4]); // jerseyNumber
      }
    }
  }

  return {
    success: true,
    message: "Игрок #" + rowValues[4] + " " + rowValues[3] + " успешно обновлен в Google Таблице!",
    athlete: athlete
  };
}

/**
 * Replaces the entire roster in the ATHLETES sheet with the exact list from the site
 */
function handleSyncAthletes(athletesList) {
  if (!athletesList || !Array.isArray(athletesList)) {
    return { success: false, error: "Список игроков пуст или некорректен" };
  }
  var ss = getSpreadsheet();
  var athSheet = ss.getSheetByName(SHEETS.ATHLETES);
  if (!athSheet) {
    setupSpreadsheet();
    athSheet = ss.getSheetByName(SHEETS.ATHLETES);
  }

  // Clear existing athlete rows (preserving headers at row 1)
  var lastRow = athSheet.getLastRow();
  if (lastRow > 1) {
    athSheet.getRange(2, 1, lastRow - 1, 8).clearContent();
  }

  var rows = [];
  for (var i = 0; i < athletesList.length; i++) {
    var a = athletesList[i];
    rows.push([
      a.athleteId,
      a.firstName || "",
      a.lastName || "",
      a.displayName || a.firstName || "Игрок",
      String(a.jerseyNumber || "00"),
      a.accessToken || ("tok_" + Utilities.getUuid()),
      a.active !== false,
      a.createdAt || new Date().toISOString()
    ]);
  }

  if (rows.length > 0) {
    athSheet.getRange(2, 1, rows.length, 8).setValues(rows);
  }

  // Also sync player names to DAILY_WELLNESS
  var wellnessSheet = ss.getSheetByName(SHEETS.DAILY_WELLNESS);
  if (wellnessSheet && wellnessSheet.getLastRow() > 1) {
    var wData = wellnessSheet.getDataRange().getValues();
    var athleteMap = {};
    for (var j = 0; j < athletesList.length; j++) {
      athleteMap[String(athletesList[j].athleteId)] = athletesList[j];
    }
    for (var w = 1; w < wData.length; w++) {
      var athId = String(wData[w][3]);
      if (athleteMap[athId]) {
        wellnessSheet.getRange(w + 1, 5).setValue(athleteMap[athId].displayName || "");
        wellnessSheet.getRange(w + 1, 6).setValue(String(athleteMap[athId].jerseyNumber || "00"));
      }
    }
  }

  return {
    success: true,
    count: rows.length,
    message: "Состав из " + rows.length + " игроков успешно синхронизирован с Google Таблицей!"
  };
}

/**
 * Marks athlete inactive in the ATHLETES sheet
 */
function handleDeleteAthlete(athleteId) {
  if (!athleteId) return { success: false, error: "Не указан athleteId" };
  var ss = getSpreadsheet();
  var athSheet = ss.getSheetByName(SHEETS.ATHLETES);
  if (!athSheet) return { success: false, error: "Лист ATHLETES не найден" };

  var data = athSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(athleteId)) {
      athSheet.getRange(i + 1, 7).setValue(false); // active = false
      return { success: true, message: "Игрок отключен в Google Таблице" };
    }
  }
  return { success: false, error: "Игрок не найден в Google Таблице" };
}

function rowToWellnessRecord(row) {
  return {
    recordId: String(row[0]),
    date: String(row[1]),
    timestamp: String(row[2]),
    athleteId: String(row[3]),
    playerName: String(row[4]),
    jerseyNumber: String(row[5]),
    sleep: Number(row[6]),
    fatigue: Number(row[7]),
    muscleSoreness: Number(row[8]),
    mood: Number(row[9]),
    stress: Number(row[10]),
    wellnessScore: Number(row[11]),
    wellnessPercent: Number(row[12]),
    painPresent: Boolean(row[13]),
    painIntensity: Number(row[14]),
    painLocation: String(row[15] || "—"),
    illnessSymptoms: Boolean(row[16]),
    illnessDetails: String(row[17] || ""),
    status: String(row[18]),
    createdAt: String(row[19]),
    updatedAt: String(row[20])
  };
}

function getSettings() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.REPORT_SETTINGS);
  if (!sheet) return {};
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    settings[String(data[i][0])] = String(data[i][1]);
  }
  return settings;
}

/**
 * ============================================================================
 * 4. PDF GENERATOR (Google Drive)
 * ============================================================================
 */
function createPdfReport(dateStr) {
  var records = getWellnessForDate(dateStr);
  var athletes = getAllAthletes();

  var total = athletes.length;
  var completed = records.length;
  var completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  var avgWellness = 0;
  var medReviews = 0;
  if (completed > 0) {
    var sumW = 0;
    for (var r = 0; r < records.length; r++) {
      sumW += records[r].wellnessPercent;
      if (records[r].status === "RED" || records[r].status === "ORANGE") {
        medReviews++;
      }
    }
    avgWellness = Math.round(sumW / completed);
  }

  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">';
  html += '<style>';
  html += 'body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; }';
  html += '.header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }';
  html += '.title { font-size: 20px; font-weight: bold; color: #0f172a; letter-spacing: 0.5px; }';
  html += '.subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }';
  html += '.kpi-grid { display: table; width: 100%; margin-bottom: 16px; }';
  html += '.kpi-cell { display: table-cell; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; text-align: center; }';
  html += '.kpi-val { font-size: 16px; font-weight: bold; color: #0f172a; }';
  html += '.kpi-label { font-size: 11px; color: #64748b; }';
  html += 'table { width: 100%; border-collapse: collapse; font-size: 11px; }';
  html += 'th { background: #1e3a8a; color: white; padding: 6px 8px; text-align: center; }';
  html += 'td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; }';
  html += '.td-name { text-align: left; font-weight: bold; }';
  html += '.badge-green { background: #dcfce7; color: #15803d; font-weight: bold; }';
  html += '.badge-yellow { background: #fef9c3; color: #a16207; font-weight: bold; }';
  html += '.badge-orange { background: #ffedd5; color: #c2410c; font-weight: bold; }';
  html += '.badge-red { background: #fee2e2; color: #b91c1c; font-weight: bold; }';
  html += '</style></head><body>';

  html += '<div class="header">';
  html += '<div class="title">READINESS & RECOVERY REPORT — CASPIY FUTSAL CLUB</div>';
  html += '<div class="subtitle">Отчет готовности команды на дату: ' + dateStr + ' (Asia/Almaty)</div>';
  html += '</div>';

  html += '<div class="kpi-grid">';
  html += '<div class="kpi-cell"><div class="kpi-val">' + completed + ' / ' + total + ' (' + completionRate + '%)</div><div class="kpi-label">Заполнили</div></div>';
  html += '<div class="kpi-cell"><div class="kpi-val">' + avgWellness + '%</div><div class="kpi-label">Средний Wellness</div></div>';
  html += '<div class="kpi-cell"><div class="kpi-val">' + medReviews + '</div><div class="kpi-label">Требует внимания/осмотра</div></div>';
  html += '</div>';

  html += '<table>';
  html += '<thead><tr>';
  html += '<th>Игрок</th><th>#</th><th>Сон</th><th>Утомл</th><th>Мышцы</th><th>Настр</th><th>Стресс</th><th>Wellness</th><th>Боль</th><th>Локализация</th><th>Статус</th>';
  html += '</tr></thead><tbody>';

  for (var i = 0; i < records.length; i++) {
    var rec = records[i];
    var badgeClass = "badge-green";
    var statusTitle = "Норма";
    if (rec.status === "RED") { badgeClass = "badge-red"; statusTitle = "Осмотр"; }
    else if (rec.status === "ORANGE") { badgeClass = "badge-orange"; statusTitle = "Внимание"; }
    else if (rec.status === "YELLOW") { badgeClass = "badge-yellow"; statusTitle = "Снижен"; }

    html += '<tr>';
    html += '<td class="td-name">' + rec.playerName + '</td>';
    html += '<td>' + rec.jerseyNumber + '</td>';
    html += '<td>' + rec.sleep + '</td>';
    html += '<td>' + rec.fatigue + '</td>';
    html += '<td>' + rec.muscleSoreness + '</td>';
    html += '<td>' + rec.mood + '</td>';
    html += '<td>' + rec.stress + '</td>';
    html += '<td style="font-weight:bold;">' + rec.wellnessPercent + '%</td>';
    html += '<td>' + (rec.painPresent ? (rec.painIntensity + '/10') : '0') + '</td>';
    html += '<td>' + (rec.painLocation || '—') + '</td>';
    html += '<td class="' + badgeClass + '">' + statusTitle + '</td>';
    html += '</tr>';
  }
  html += '</tbody></table>';
  html += '<div style="margin-top:20px; font-size:10px; color:#94a3b8; text-align:right;">Сгенерировано автоматически системой Caspiy Monitoring ' + new Date().toLocaleString() + '</div>';
  html += '</body></html>';

  var blob = Utilities.newBlob(html, "text/html", "caspiy_report.html");
  var pdfBlob = blob.getAs("application/pdf").setName("Caspiy_Wellness_Report_" + dateStr + ".pdf");

  // Save to Google Drive
  var folderName = "Caspiy_Futsal_Reports";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  var file = folder.createFile(pdfBlob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    success: true,
    fileId: file.getId(),
    url: file.getUrl(),
    downloadUrl: file.getDownloadUrl(),
    fileName: file.getName(),
    folderName: folderName
  };
}

/**
 * ============================================================================
 * 5. CSV GENERATOR (Excel UTF-8 BOM compatible)
 * ============================================================================
 */
function generateCsvForDate(dateStr) {
  var records = getWellnessForDate(dateStr);
  var headers = [
    "Date", "Player", "Jersey number", "Sleep", "Fatigue",
    "Muscle soreness", "Mood", "Stress", "Wellness score",
    "Wellness percent", "Pain", "Pain location", "Illness symptoms", "Status"
  ];
  
  var rows = [headers.join(";")];
  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    var line = [
      r.date,
      '"' + r.playerName + '"',
      r.jerseyNumber,
      r.sleep,
      r.fatigue,
      r.muscleSoreness,
      r.mood,
      r.stress,
      r.wellnessScore,
      r.wellnessPercent + "%",
      r.painPresent ? r.painIntensity : 0,
      '"' + (r.painLocation || "") + '"',
      '"' + (r.illnessSymptoms ? r.illnessDetails : "Нет") + '"',
      r.status
    ];
    rows.push(line.join(";"));
  }

  // UTF-8 BOM for Microsoft Excel Russian encoding support
  return "\\uFEFF" + rows.join("\\r\\n");
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
