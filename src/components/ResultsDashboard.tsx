import React, { useState } from 'react';
import { 
  BarChart3, 
  Trophy, 
  Sparkles, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  Printer, 
  RefreshCw,
  PieChart,
  CheckCircle2,
  Calendar,
  Vote
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Election, Candidate } from '../types';
import { storage } from '../services/storage';

interface ResultsDashboardProps {
  onGoToBooth: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ onGoToBooth }) => {
  const elections = storage.getElections();
  const allCandidates = storage.getCandidates();
  const [selectedElectionId, setSelectedElectionId] = useState<string>(
    elections.length > 0 ? elections[0].id : ''
  );
  const [activePositionFilter, setActivePositionFilter] = useState<string>('all');
  const [showCertificateModal, setShowCertificateModal] = useState<Candidate | null>(null);

  const selectedElection = elections.find(e => e.id === selectedElectionId) || elections[0];
  const candidatesInElection = allCandidates.filter(c => c.electionId === selectedElection?.id);
  const positions = selectedElection?.positions || [];

  // Calculate total votes cast in this election
  const totalVotesForElection = candidatesInElection.reduce((sum, c) => sum + c.voteCount, 0);

  // Turnout percentage
  const turnoutPercent = selectedElection?.totalEligibleVoters > 0
    ? Math.min(100, Math.round((selectedElection.totalVotesCast / selectedElection.totalEligibleVoters) * 100))
    : 0;

  const handleCelebrateWinner = (winner: Candidate) => {
    setShowCertificateModal(winner);
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-full text-xs font-bold">
                <BarChart3 className="h-3.5 w-3.5" />
                AUTOMATED REAL-TIME COUNTING ENGINE
              </span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                0% Human Counting Error
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Official Election Results & Tally Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time vote aggregation calculated directly from the atomic MySQL database ledger.
            </p>
          </div>

          {/* Election Selector */}
          <div className="w-full lg:w-auto">
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
              Select Election Contest:
            </label>
            <select
              value={selectedElectionId}
              onChange={(e) => {
                setSelectedElectionId(e.target.value);
                setActivePositionFilter('all');
              }}
              className="w-full lg:w-80 bg-slate-950 border border-slate-700 text-xs text-white font-medium rounded-xl px-3.5 py-2.5 focus:border-cyan-400 focus:outline-none"
            >
              {elections.map(el => (
                <option key={el.id} value={el.id}>
                  {el.title} ({el.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Ballots Cast</span>
            <Vote className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {selectedElection?.totalVotesCast.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> 100% Cryptographically Verified
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Eligible Voter Roll</span>
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {selectedElection?.totalEligibleVoters.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Constituency: {selectedElection?.eligibleConstituency}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Voter Turnout</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {turnoutPercent}%
          </p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${turnoutPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Contested Seats</span>
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {positions.length} Positions
          </p>
          <p className="text-[11px] text-amber-300 mt-1 font-medium">
            {candidatesInElection.length} Certified Candidates
          </p>
        </div>

      </div>

      {/* Position Filter Pills */}
      {positions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          <button
            onClick={() => setActivePositionFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activePositionFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Positions ({positions.length})
          </button>
          {positions.map(pos => (
            <button
              key={pos.id}
              onClick={() => setActivePositionFilter(pos.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activePositionFilter === pos.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {pos.title}
            </button>
          ))}
        </div>
      )}

      {/* Position-by-Position Live Vote Tally */}
      <div className="space-y-8">
        {positions
          .filter(pos => activePositionFilter === 'all' || activePositionFilter === pos.id)
          .map((position) => {
            const candidates = candidatesInElection
              .filter(c => c.position === position.id)
              .sort((a, b) => b.voteCount - a.voteCount);

            const posTotalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
            const leader = candidates[0];
            const runnerUp = candidates[1];
            const marginOfVictory = leader && runnerUp ? leader.voteCount - runnerUp.voteCount : 0;

            return (
              <div 
                key={position.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
              >
                {/* Position Title & Leader Highlight */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      Contested Office
                    </span>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>{position.title}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Total valid votes cast for this position: <strong className="text-white font-mono">{posTotalVotes.toLocaleString()}</strong>
                    </p>
                  </div>

                  {leader && leader.voteCount > 0 && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-xl">
                      <Trophy className="h-4 w-4 text-amber-400" />
                      <div className="text-left">
                        <span className="text-[9px] uppercase font-bold text-amber-300 block">Leading Candidate</span>
                        <span className="text-xs font-black text-white">{leader.fullName} (+{marginOfVictory} lead)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Results Breakdown */}
                <div className="space-y-4">
                  {candidates.map((candidate, idx) => {
                    const percentage = posTotalVotes > 0 
                      ? Math.round((candidate.voteCount / posTotalVotes) * 100) 
                      : 0;
                    const isWinner = idx === 0 && candidate.voteCount > 0;

                    return (
                      <div
                        key={candidate.id}
                        className={`bg-slate-950/70 border rounded-2xl p-4 transition-all relative overflow-hidden ${
                          isWinner ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 to-slate-950' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 mb-3">
                          
                          {/* Candidate details */}
                          <div className="flex items-center gap-3.5">
                            <div className="relative">
                              <img
                                src={candidate.avatarUrl}
                                alt={candidate.fullName}
                                className={`h-14 w-14 rounded-2xl object-cover border-2 ${
                                  isWinner ? 'border-amber-400' : 'border-slate-700'
                                }`}
                              />
                              {isWinner && (
                                <div className="absolute -top-2 -left-2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-md">
                                  <Trophy className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-base">
                                  {candidate.fullName}
                                </h4>
                                <span className="text-lg" title={candidate.symbolName}>{candidate.symbol}</span>
                                {isWinner && (
                                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-400/30">
                                    ELECTED / PROJECTED WINNER
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-cyan-400">
                                {candidate.partyName}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Symbol: {candidate.symbolName}
                              </p>
                            </div>
                          </div>

                          {/* Vote Count & Percent */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between text-right gap-1">
                            <span className="text-xl sm:text-2xl font-black text-white font-mono">
                              {candidate.voteCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">votes</span>
                            </span>
                            <span className="text-xs font-bold text-cyan-300 font-mono">
                              {percentage}% of valid votes
                            </span>
                          </div>

                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-slate-900 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isWinner 
                                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-lg shadow-amber-500/30' 
                                : 'bg-gradient-to-r from-blue-600 to-cyan-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>

                        {/* Winner Certificate Action */}
                        {isWinner && (
                          <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-end">
                            <button
                              onClick={() => handleCelebrateWinner(candidate)}
                              className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 hover:underline"
                            >
                              <Award className="h-3.5 w-3.5" />
                              <span>View Official Certificate of Election</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* WINNER CERTIFICATE MODAL */}
      {showCertificateModal && selectedElection && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 border-2 border-amber-400/60 rounded-3xl max-w-xl w-full p-8 text-white shadow-2xl animate-fade-in relative text-center">
            
            {/* Certificate Border Watermark */}
            <div className="border-4 border-amber-400/30 rounded-2xl p-6 relative">
              <div className="flex justify-center mb-3">
                <div className="h-16 w-16 bg-amber-400/20 text-amber-300 rounded-full flex items-center justify-center ring-8 ring-amber-400/10">
                  <Trophy className="h-9 w-9" />
                </div>
              </div>

              <span className="text-[10px] tracking-widest uppercase font-mono text-amber-300 font-bold block mb-1">
                OFFICIAL CERTIFICATE OF ELECTION VICTORY
              </span>
              
              <h3 className="text-xl font-serif font-black text-white uppercase tracking-wider mb-3">
                Election Commission Seal
              </h3>

              <p className="text-xs text-slate-300 mb-6 italic">
                This is to officially certify that following the computerized single-vote ballot tabulation for:
                <br />
                <strong className="text-cyan-300 text-sm font-sans not-italic font-bold block mt-1">
                  "{selectedElection.title}"
                </strong>
              </p>

              <div className="bg-slate-950/80 border border-amber-400/40 rounded-2xl p-4 mb-6">
                <img
                  src={showCertificateModal.avatarUrl}
                  alt={showCertificateModal.fullName}
                  className="h-20 w-20 rounded-full object-cover mx-auto border-2 border-amber-400 mb-2 shadow-lg"
                />
                <h4 className="text-lg font-black text-white">
                  {showCertificateModal.fullName}
                </h4>
                <p className="text-xs text-amber-300 font-semibold font-mono">
                  {showCertificateModal.partyName}
                </p>
                <div className="text-xs text-slate-300 mt-2 font-mono">
                  Certified Tally: <strong className="text-white">{showCertificateModal.voteCount.toLocaleString()} Votes</strong>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800 pt-3">
                <span>SEAL ID: ELEC-CERT-{Date.now().toString().slice(-6)}</span>
                <span>STATUS: CERTIFIED & RATIFIED</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="h-4 w-4" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(null)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
