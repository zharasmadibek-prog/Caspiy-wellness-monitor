/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerView } from './components/PlayerView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { PlayerPortal } from './components/PlayerPortal';
import { AppStorage } from './services/storage';
import { Athlete } from './types';
import { Shield, ArrowLeft, Lock } from 'lucide-react';

export default function App() {
  const [currentToken, setCurrentToken] = useState<string>('');
  const [currentAthlete, setCurrentAthlete] = useState<Athlete | null>(null);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [openedByDoctor, setOpenedByDoctor] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initialize storage
    AppStorage.init();

    // 2. Read URL search parameters
    const params = new URLSearchParams(window.location.search);
    const playerToken = params.get('player');
    const adminParam = params.get('admin');

    const nameParam = params.get('name');
    const numParam = params.get('num');
    const fnParam = params.get('fn');
    const lnParam = params.get('ln');
    const idParam = params.get('id');

    if (playerToken) {
      // Synchronize with URL parameters (ensures edited nickname/name appears immediately on any device)
      let athlete = AppStorage.syncAthleteFromUrl(playerToken, {
        name: nameParam,
        num: numParam,
        fn: fnParam,
        ln: lnParam,
        id: idParam,
      }) || AppStorage.findAthleteByToken(playerToken);

      if (athlete) {
        setCurrentToken(athlete.accessToken);
        setCurrentAthlete(athlete);
        setIsAdminView(false);
      } else {
        setCurrentToken(playerToken);
        setCurrentAthlete(null);
      }
    } else if (adminParam === 'true') {
      setIsAdminView(true);
    }

    setIsInitialized(true);
  }, []);

  // Listen for real-time updates when an athlete is edited or deleted
  useEffect(() => {
    const handleSync = () => {
      if (currentToken) {
        const refreshed = AppStorage.findAthleteByToken(currentToken);
        if (refreshed) {
          setCurrentAthlete(refreshed);
        }
      }
    };

    window.addEventListener('caspiy_athlete_updated', handleSync);
    window.addEventListener('caspiy_athlete_deleted', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('caspiy_athlete_updated', handleSync);
      window.removeEventListener('caspiy_athlete_deleted', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [currentToken]);

  const handleOpenPlayerFromAdmin = (token: string) => {
    const athlete = AppStorage.findAthleteByToken(token);
    setCurrentToken(token);
    setCurrentAthlete(athlete);
    setOpenedByDoctor(true);
    setIsAdminView(false);

    const newUrl = `${window.location.pathname}?player=${token}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleReturnToAdmin = () => {
    setIsAdminView(true);
    setOpenedByDoctor(false);
  };

  const handleAthleteResolvedFromPortal = (token: string) => {
    const athlete = AppStorage.findAthleteByToken(token);
    if (athlete) {
      setCurrentToken(athlete.accessToken);
      setCurrentAthlete(athlete);
      setIsAdminView(false);
      const newUrl = `${window.location.pathname}?player=${athlete.accessToken}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  if (!isInitialized) {
    return <div className="min-h-screen bg-[#070b14]" />;
  }

  // 1. Admin mode (Protected)
  if (isAdminView) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        {isAdminAuthenticated ? (
          <AdminDashboard
            onLogout={() => {
              setIsAdminAuthenticated(false);
              setIsAdminView(false);
            }}
            onOpenPlayerView={handleOpenPlayerFromAdmin}
          />
        ) : (
          <AdminLogin
            onSuccess={() => setIsAdminAuthenticated(true)}
            onCancel={() => setIsAdminView(false)}
          />
        )}
      </div>
    );
  }

  // 2. Player has a valid or specified token -> Render isolated questionnaire
  if (currentToken) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        {/* Top Minimal Header (Hidden in print) */}
        <div className="no-print bg-[#090f1b] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-white text-xs tracking-wide">
              МФК «КАСПИЙ» (АКТАУ)
            </span>
            {currentAthlete && (
              <span className="text-slate-400 hidden sm:inline">
                · Персональная анкета: #{currentAthlete.jerseyNumber} {currentAthlete.displayName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {openedByDoctor ? (
              <button
                onClick={handleReturnToAdmin}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-600/25"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Вернуться в панель врача</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAdminView(true)}
                title="Вход для врача и тренерского штаба"
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3 h-3 text-blue-400" />
                <span>Медштаб</span>
              </button>
            )}
          </div>
        </div>

        {/* Player View (No access to other players) */}
        <div className="flex-1 flex flex-col">
          <PlayerView
            key={currentToken + (currentAthlete?.displayName || '') + (currentAthlete?.jerseyNumber || '')}
            token={currentToken}
            onNavigateToAdmin={() => setIsAdminView(true)}
          />
        </div>
      </div>
    );
  }

  // 3. No token specified -> Show secure Player Portal
  return (
    <PlayerPortal
      onAthleteResolved={handleAthleteResolvedFromPortal}
      onOpenAdmin={() => setIsAdminView(true)}
    />
  );
}
