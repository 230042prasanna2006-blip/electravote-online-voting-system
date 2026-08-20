import React from 'react';
import { 
  Vote, 
  ShieldCheck, 
  UserCheck, 
  BarChart3, 
  FileCode2, 
  Database, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  UserPlus, 
  LogIn,
  Search
} from 'lucide-react';
import { Voter } from '../types';

interface NavbarProps {
  activeTab: 'vote' | 'results' | 'verify' | 'register' | 'card' | 'admin' | 'db' | 'java';
  setActiveTab: (tab: 'vote' | 'results' | 'verify' | 'register' | 'card' | 'admin' | 'db' | 'java') => void;
  currentUser: Voter | null;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  voters: Voter[];
  onSelectVoter: (v: Voter) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isAdmin,
  setIsAdmin,
  onOpenLogin,
  onLogout,
  voters,
  onSelectVoter
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 px-4 py-1.5 text-xs text-white flex justify-between items-center">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Official Election Commission Server Active</span>
          <span className="hidden sm:inline text-blue-200">| 100% Cryptographically Audited & Duplicate-Protected</span>
        </div>
        
        {/* Quick Persona Demo Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-blue-100 hidden md:inline text-[11px]">Quick Switch Voter:</span>
          <select 
            className="bg-slate-900/80 text-white text-xs border border-blue-400/40 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            value={currentUser?.id || ''}
            onChange={(e) => {
              const selected = voters.find(v => v.id === e.target.value);
              if (selected) {
                setIsAdmin(false);
                onSelectVoter(selected);
              }
            }}
          >
            {voters.map(v => (
              <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                {v.fullName} ({v.voterId}) {v.hasVotedElections.length > 0 ? '• [Voted]' : v.isApproved ? '• [Ready]' : '• [Pending]'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('vote')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white ring-2 ring-blue-400/30">
              <Vote className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
                  ElectraVote
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold px-1.5 py-0.5 rounded">
                  v2.6
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Online Voting & Election System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => { setIsAdmin(false); setActiveTab('vote'); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !isAdmin && activeTab === 'vote'
                  ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Vote className="h-4 w-4" />
              <span>Voting Booth</span>
            </button>

            <button
              onClick={() => { setIsAdmin(false); setActiveTab('results'); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !isAdmin && activeTab === 'results'
                  ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Live Results</span>
            </button>

            <button
              onClick={() => { setIsAdmin(false); setActiveTab('card'); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !isAdmin && activeTab === 'card'
                  ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>My Voter ID</span>
            </button>

            <button
              onClick={() => { setIsAdmin(false); setActiveTab('verify'); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !isAdmin && activeTab === 'verify'
                  ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Verify Ballot</span>
            </button>

            <div className="h-5 w-px bg-slate-700 mx-1"></div>

            <button
              onClick={() => { setIsAdmin(true); setActiveTab('admin'); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isAdmin && activeTab === 'admin'
                  ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Admin Portal</span>
            </button>

            <button
              onClick={() => { setIsAdmin(false); setActiveTab('java'); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !isAdmin && activeTab === 'java'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode2 className="h-4 w-4 text-emerald-400" />
              <span>Java + JDBC Code</span>
            </button>

            <button
              onClick={() => { setIsAdmin(false); setActiveTab('db'); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !isAdmin && activeTab === 'db'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="h-4 w-4 text-amber-400" />
              <span>MySQL Console</span>
            </button>
          </nav>

          {/* User Profile / Status / Auth Actions */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => setActiveTab('card')}
                  className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 cursor-pointer transition-all"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={currentUser.fullName}
                    className="h-7 w-7 rounded-full object-cover ring-2 ring-blue-400/50"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-100 leading-tight">
                      {currentUser.fullName}
                    </p>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="font-mono text-cyan-400">{currentUser.voterId}</span>
                      {currentUser.isApproved ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg transition-all"
                >
                  <LogIn className="h-4 w-4 text-cyan-400" />
                  <span>Voter Login</span>
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-3.5 py-2 rounded-lg shadow-lg shadow-blue-500/25 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80 text-xs no-scrollbar">
          <button
            onClick={() => { setIsAdmin(false); setActiveTab('vote'); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${!isAdmin && activeTab === 'vote' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Vote Booth
          </button>
          <button
            onClick={() => { setIsAdmin(false); setActiveTab('results'); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${!isAdmin && activeTab === 'results' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Live Results
          </button>
          <button
            onClick={() => { setIsAdmin(false); setActiveTab('card'); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${!isAdmin && activeTab === 'card' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Voter Card
          </button>
          <button
            onClick={() => { setIsAdmin(false); setActiveTab('verify'); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${!isAdmin && activeTab === 'verify' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Verify Ballot
          </button>
          <button
            onClick={() => { setIsAdmin(true); setActiveTab('admin'); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${isAdmin ? 'bg-indigo-600 text-white font-bold' : 'text-indigo-300'}`}
          >
            Admin Commission
          </button>
          <button
            onClick={() => { setIsAdmin(false); setActiveTab('java'); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${!isAdmin && activeTab === 'java' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-300'}`}
          >
            Java+MySQL
          </button>
          <button
            onClick={() => { setIsAdmin(false); setActiveTab('db'); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${!isAdmin && activeTab === 'db' ? 'bg-amber-600 text-white font-bold' : 'text-amber-300'}`}
          >
            SQL Console
          </button>
        </div>
      </div>
    </header>
  );
};
