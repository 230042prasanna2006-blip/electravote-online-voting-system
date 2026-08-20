import React, { useState } from 'react';
import { 
  LogIn, 
  ShieldCheck, 
  AlertCircle, 
  UserCheck, 
  ArrowRight, 
  KeyRound, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Voter } from '../types';
import { storage } from '../services/storage';

interface VoterLoginProps {
  onLoginSuccess: (voter: Voter) => void;
  onGoToRegister: () => void;
  onSelectAdmin: () => void;
}

export const VoterLogin: React.FC<VoterLoginProps> = ({
  onLoginSuccess,
  onGoToRegister,
  onSelectAdmin
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const voters = storage.getVoters();

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const match = voters.find(
      v => (v.voterId.toLowerCase() === identifier.trim().toLowerCase() || 
            v.email.toLowerCase() === identifier.trim().toLowerCase())
    );

    if (!match) {
      setError('Voter credentials not found. Please check your Voter ID / Email or register.');
      return;
    }

    onLoginSuccess(match);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-semibold mb-3">
          <KeyRound className="h-3.5 w-3.5" />
          <span>Voter Authentication Portal</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Sign In to Cast Your Ballot
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Authenticate using your registered Voter Identification Number or Email address.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Login Form */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LogIn className="h-5 w-5 text-cyan-400" />
            <span>Voter Credentials Login</span>
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Voter ID or Registered Email
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VOT-2026-1001 or alexander@..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password / Access PIN
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Authenticate & Enter Booth</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-2">Not registered in the official voter roll yet?</p>
            <button
              onClick={onGoToRegister}
              className="text-xs text-cyan-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Enroll as a New Eligible Voter</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Instant Demo Personas Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Instant Demo Personas</span>
              </span>
              <span className="text-[10px] bg-blue-500/20 text-cyan-300 px-2 py-0.5 rounded font-semibold">
                Click to Test
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Switch between different voter states to test the voting booth, duplicate vote protection, and approval checks:
            </p>

            <div className="space-y-2.5">
              {voters.map((v) => {
                const hasVoted = v.hasVotedElections.length > 0;
                return (
                  <div
                    key={v.id}
                    onClick={() => onLoginSuccess(v)}
                    className="p-3 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={v.avatarUrl}
                        alt={v.fullName}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-cyan-400"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {v.fullName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {v.voterId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{v.constituency}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {hasVoted ? (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                          Already Voted
                        </span>
                      ) : v.isApproved ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Ready to Vote
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending KYC
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Quick Switch */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={onSelectAdmin}
                className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Switch to Chief Election Officer / Admin Mode</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
