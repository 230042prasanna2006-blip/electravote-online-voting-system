/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VotingBooth } from './components/VotingBooth';
import { ResultsDashboard } from './components/ResultsDashboard';
import { VoterIDCard } from './components/VoterIDCard';
import { VoteVerification } from './components/VoteVerification';
import { VoterRegistration } from './components/VoterRegistration';
import { VoterLogin } from './components/VoterLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { JavaCodeHub } from './components/JavaCodeHub';
import { Voter } from './types';
import { storage } from './services/storage';
import { 
  Vote, 
  ShieldCheck, 
  BarChart3, 
  FileCode2, 
  Database, 
  Search, 
  UserCheck, 
  Github, 
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'vote' | 'results' | 'verify' | 'register' | 'card' | 'admin' | 'db' | 'java'
  >('vote');
  
  const [currentUser, setCurrentUser] = useState<Voter | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [verificationHashTarget, setVerificationHashTarget] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const voters = storage.getVoters();

  useEffect(() => {
    const savedUser = storage.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectVoter = (v: Voter) => {
    setCurrentUser(v);
    storage.setCurrentUser(v);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.setCurrentUser(null);
  };

  const handleGoToVerify = (hash?: string) => {
    if (hash) {
      setVerificationHashTarget(hash);
    }
    setActiveTab('verify');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'admin') setIsAdmin(true);
          else setIsAdmin(false);
        }}
        currentUser={currentUser}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        voters={voters}
        onSelectVoter={handleSelectVoter}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 py-4">
        {activeTab === 'vote' && !isAdmin && (
          <VotingBooth
            currentUser={currentUser}
            onGoToLogin={() => setShowLoginModal(true)}
            onGoToRegister={() => setActiveTab('register')}
            onGoToResults={() => setActiveTab('results')}
            onGoToVerify={handleGoToVerify}
            onRefreshData={handleRefresh}
          />
        )}

        {activeTab === 'results' && !isAdmin && (
          <ResultsDashboard
            onGoToBooth={() => setActiveTab('vote')}
          />
        )}

        {activeTab === 'card' && !isAdmin && (
          <VoterIDCard
            voter={currentUser}
            onGoToRegister={() => setActiveTab('register')}
            onGoToVote={() => setActiveTab('vote')}
          />
        )}

        {activeTab === 'verify' && !isAdmin && (
          <VoteVerification
            initialHash={verificationHashTarget}
            onGoToBooth={() => setActiveTab('vote')}
            onGoToResults={() => setActiveTab('results')}
          />
        )}

        {activeTab === 'register' && !isAdmin && (
          <VoterRegistration
            onRegistered={(newVoter) => {
              handleSelectVoter(newVoter);
              setActiveTab('card');
              handleRefresh();
            }}
            onGoToLogin={() => setShowLoginModal(true)}
          />
        )}

        {activeTab === 'admin' && isAdmin && (
          <AdminDashboard
            onRefreshData={handleRefresh}
          />
        )}

        {activeTab === 'db' && !isAdmin && (
          <DatabaseExplorer />
        )}

        {activeTab === 'java' && !isAdmin && (
          <JavaCodeHub />
        )}
      </main>

      {/* LOGIN MODAL OVERLAY */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-2 relative shadow-2xl animate-fade-in">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-2 rounded-full z-10"
            >
              ✕
            </button>
            <VoterLogin
              onLoginSuccess={(voter) => {
                handleSelectVoter(voter);
                setShowLoginModal(false);
              }}
              onGoToRegister={() => {
                setShowLoginModal(false);
                setActiveTab('register');
              }}
              onSelectAdmin={() => {
                setShowLoginModal(false);
                setIsAdmin(true);
                setActiveTab('admin');
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Vote className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-white">ElectraVote Enterprise Electoral System</p>
              <p className="text-[11px] text-slate-500">Built with Java 17 + MySQL 8.0 + JDBC + React & Tailwind CSS</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <button onClick={() => { setIsAdmin(false); setActiveTab('vote'); }} className="hover:text-white">Voting Booth</button>
            <button onClick={() => { setIsAdmin(false); setActiveTab('results'); }} className="hover:text-white">Live Results</button>
            <button onClick={() => { setIsAdmin(false); setActiveTab('verify'); }} className="hover:text-white">Ballot Verifier</button>
            <button onClick={() => { setIsAdmin(false); setActiveTab('java'); }} className="hover:text-emerald-400">Java Architecture</button>
            <button onClick={() => { setIsAdmin(false); setActiveTab('db'); }} className="hover:text-amber-400">MySQL Console</button>
            <button onClick={() => { setIsAdmin(true); setActiveTab('admin'); }} className="hover:text-indigo-400">Admin Commission</button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>Single-Vote Guaranteed & Cryptographically Audited</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
