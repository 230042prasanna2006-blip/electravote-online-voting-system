import React, { useState } from 'react';
import { 
  Vote, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Lock, 
  Sparkles, 
  ArrowRight,
  Info,
  Calendar,
  Building,
  Award,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Election, Candidate, Voter, CastVoteRecord } from '../types';
import { storage } from '../services/storage';
import { playEVMBeep } from '../services/crypto';

interface VotingBoothProps {
  currentUser: Voter | null;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onGoToResults: () => void;
  onGoToVerify: (hash?: string) => void;
  onRefreshData: () => void;
}

export const VotingBooth: React.FC<VotingBoothProps> = ({
  currentUser,
  onGoToLogin,
  onGoToRegister,
  onGoToResults,
  onGoToVerify,
  onRefreshData
}) => {
  const elections = storage.getElections().filter(e => e.status === 'active');
  const allCandidates = storage.getCandidates();
  const allVotes = storage.getVotes();

  const [selectedElectionId, setSelectedElectionId] = useState<string>(
    elections.length > 0 ? elections[0].id : ''
  );
  
  // Selected candidate map: { [positionId]: candidateId }
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activePositionTab, setActivePositionTab] = useState<number>(0);
  const [manifestoModalCandidate, setManifestoModalCandidate] = useState<Candidate | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);

  // Success Receipt State
  const [voteReceipt, setVoteReceipt] = useState<{
    receiptCode: string;
    verificationHash: string;
    timestamp: string;
  } | null>(null);

  const activeElection = elections.find(e => e.id === selectedElectionId) || elections[0];
  const positions = activeElection?.positions || [];
  const currentPosition = positions[activePositionTab] || positions[0];

  const candidatesForPosition = currentPosition 
    ? allCandidates.filter(c => c.electionId === activeElection?.id && c.position === currentPosition.id)
    : [];

  // Check if voter has already voted in this election
  const hasAlreadyVoted = currentUser 
    ? currentUser.hasVotedElections.includes(activeElection?.id)
    : false;

  // Find previous receipt if already voted
  const existingVote = hasAlreadyVoted && currentUser
    ? allVotes.find(v => v.electionId === activeElection?.id)
    : null;

  const handleSelectCandidate = (positionId: string, candidateId: string) => {
    if (soundEnabled) {
      playEVMBeep('click');
    }
    setSelections(prev => ({
      ...prev,
      [positionId]: candidateId
    }));
  };

  const handleOpenConfirmation = () => {
    if (!currentUser) {
      onGoToLogin();
      return;
    }

    if (!currentUser.isApproved) {
      alert('Your voter registration is pending approval by the Election Commission.');
      return;
    }

    if (hasAlreadyVoted) {
      alert('Duplicate vote prohibited! You have already cast your official vote for this election.');
      return;
    }

    // Ensure all positions have a selection
    const unselected = positions.filter(p => !selections[p.id]);
    if (unselected.length > 0) {
      alert(`Please select a candidate for all positions: "${unselected.map(p => p.title).join(', ')}" before proceeding.`);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleCastOfficialVote = async () => {
    if (!currentUser || !activeElection) return;

    try {
      setIsSubmitting(true);
      if (soundEnabled) {
        playEVMBeep('vote'); // Authentic EVM long confirmation beep
      }

      const receipt = await storage.castVote(currentUser.id, activeElection.id, selections);
      setVoteReceipt(receipt);
      setShowConfirmModal(false);
      onRefreshData();

      // Trigger Confetti Celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cast ballot.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      
      {/* Top Banner & Election Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                POLLS OPEN & LIVE
              </span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                ACID JDBC Security Protocol
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Electronic Ballot Box & EVM Booth
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Cast your secret, tamper-proof vote. Every ballot is verified for single-vote eligibility and sealed into an immutable audit chain.
            </p>
          </div>

          {/* Controls: Election Selector & Audio Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Election Dropdown */}
            <div className="flex-1 lg:flex-none">
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                Active Election:
              </label>
              <select
                value={selectedElectionId}
                onChange={(e) => {
                  setSelectedElectionId(e.target.value);
                  setSelections({});
                  setActivePositionTab(0);
                }}
                className="w-full lg:w-72 bg-slate-950 border border-slate-700 text-xs text-white font-medium rounded-xl px-3 py-2 focus:border-cyan-400 focus:outline-none"
              >
                {elections.map(el => (
                  <option key={el.id} value={el.id}>
                    {el.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sound Effects Toggle */}
            <div className="self-end">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  soundEnabled 
                    ? 'bg-blue-600/20 text-cyan-300 border-blue-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={soundEnabled ? 'EVM Sound On' : 'EVM Sound Muted'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4" />}
                <span className="hidden sm:inline">{soundEnabled ? 'EVM Sound: ON' : 'Muted'}</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Voter Authentication Guard Warning */}
      {!currentUser ? (
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/40 rounded-3xl p-8 text-center shadow-xl mb-8">
          <div className="h-14 w-14 bg-blue-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 ring-8 ring-blue-500/10">
            <Lock className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Voter Identification Required to Cast Ballot</h3>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mb-6">
            To ensure genuine democracy and enforce the <strong>One Citizen = One Vote</strong> rule, please sign in with your Voter ID or register.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onGoToLogin}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 text-sm transition-all"
            >
              Sign In as Voter
            </button>
            <button
              onClick={onGoToRegister}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-sm transition-all"
            >
              Register New Voter
            </button>
          </div>
        </div>
      ) : hasAlreadyVoted ? (
        /* ALREADY VOTED STATE - DUPLICATE PROHIBITION FEEDBACK */
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-8 text-center shadow-2xl mb-8">
          <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-500/10">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Your Official Vote Has Been Recorded!
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
            You have already exercised your democratic franchise for <strong>"{activeElection?.title}"</strong>. 
            Under the MySQL single-vote database constraint, additional ballots are locked out.
          </p>

          {existingVote && (
            <div className="max-w-xl mx-auto bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Cryptographic Receipt Hash:</span>
                <span className="text-cyan-400 font-bold">{existingVote.voterReceiptHash.slice(0, 20)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recorded Timestamp:</span>
                <span className="text-slate-300">{existingVote.timestamp}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={onGoToResults}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 text-sm transition-all"
            >
              View Live Election Results
            </button>
            <button
              onClick={() => onGoToVerify(existingVote?.voterReceiptHash)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold rounded-xl text-sm transition-all"
            >
              Verify Ballot in Audit Ledger
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Electronic Ballot Box Unit */}
      {(!hasAlreadyVoted || !currentUser) && (
        <div className="space-y-6">
          
          {/* Position Tabs Navigation */}
          {positions.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {positions.map((pos, idx) => {
                const isSelected = !!selections[pos.id];
                const isActive = activePositionTab === idx;
                return (
                  <button
                    key={pos.id}
                    onClick={() => setActivePositionTab(idx)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' 
                        : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{idx + 1}. {pos.title}</span>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-600"></span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Current Contest Header */}
          {currentPosition && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                  Position Contest {activePositionTab + 1} of {positions.length}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {currentPosition.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {currentPosition.description} • (Select exactly 1 candidate)
                </p>
              </div>

              <div className="text-xs font-medium text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                {selections[currentPosition.id] ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Selected
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Info className="h-4 w-4" /> Selection Required
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Candidates EVM Ballot List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidatesForPosition.map((candidate) => {
              const isSelected = selections[currentPosition.id] === candidate.id;
              
              return (
                <div
                  key={candidate.id}
                  className={`bg-slate-900/90 border rounded-3xl p-5 shadow-xl transition-all duration-300 relative flex flex-col justify-between group ${
                    isSelected 
                      ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-gradient-to-b from-blue-950/60 to-slate-900 shadow-cyan-500/20' 
                      : 'border-slate-800 hover:border-slate-700 hover:shadow-2xl'
                  }`}
                >
                  {/* EVM Active LED Indicator */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full transition-all ${
                        isSelected 
                          ? 'bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-pulse' 
                          : 'bg-slate-700'
                      }`}></span>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        {isSelected ? 'EVM CANDIDATE SELECTED' : 'CANDIDATE READY'}
                      </span>
                    </div>

                    <span className="text-2xl" title={candidate.symbolName}>
                      {candidate.symbol}
                    </span>
                  </div>

                  {/* Candidate Profile Details */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={candidate.avatarUrl}
                      alt={candidate.fullName}
                      className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-colors shadow-md"
                    />
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                        {candidate.fullName}
                      </h4>
                      <p className="text-xs font-semibold text-cyan-400">
                        {candidate.partyName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Symbol: {candidate.symbolName} ({candidate.symbol})
                      </p>
                    </div>
                  </div>

                  {/* Short Bio / Manifesto preview */}
                  <p className="text-xs text-slate-300 line-clamp-2 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    "{candidate.manifesto}"
                  </p>

                  <div className="text-[11px] text-slate-400 mb-4 flex justify-between">
                    <span>Edu: {candidate.education}</span>
                    <span>Age: {candidate.age}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setManifestoModalCandidate(candidate)}
                      className="w-full py-1.5 text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Read Full Manifesto & Bio</span>
                    </button>

                    {/* EVM BLUE VOTING KEYPAD BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleSelectCandidate(currentPosition.id, candidate.id)}
                      className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-cyan-400/40 ring-2 ring-cyan-300 font-extrabold'
                          : 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-slate-950" />
                          <span>Ballot Marked</span>
                        </>
                      ) : (
                        <>
                          <Vote className="h-4 w-4" />
                          <span>Press to Cast for {candidate.fullName.split(' ')[0]}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation between positions & Final Submit Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            
            <div className="text-xs text-slate-400 text-center sm:text-left">
              <span>Marked {Object.keys(selections).length} of {positions.length} contested positions.</span>
              <p className="text-slate-500 text-[11px]">Your ballot will be signed with an anonymous SHA-256 cryptographic verification token.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {activePositionTab < positions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activePositionTab < positions.length - 1) {
                      setActivePositionTab(activePositionTab + 1);
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Next Position</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleOpenConfirmation}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Vote className="h-5 w-5" />
                <span>Review Ballot & Submit Vote</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* CONFIRMATION & REVIEW BALLOT MODAL */}
      {showConfirmModal && activeElection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-fade-in text-white">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="h-10 w-10 bg-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center">
                <Vote className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Review & Confirm Your Ballot</h3>
                <p className="text-xs text-slate-400">Election: {activeElection.title}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
              {positions.map((pos) => {
                const candId = selections[pos.id];
                const cand = allCandidates.find(c => c.id === candId);
                return (
                  <div key={pos.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">{pos.title}</span>
                      <span className="text-sm font-bold text-cyan-300">{cand?.fullName || 'Not Selected'}</span>
                      <p className="text-[10px] text-slate-400">{cand?.partyName}</p>
                    </div>
                    <span className="text-2xl">{cand?.symbol}</span>
                  </div>
                );
              })}
            </div>

            {/* Secret Ballot Disclaimer */}
            <div className="bg-blue-950/50 border border-blue-500/30 rounded-xl p-3 mb-6 text-xs text-blue-200 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Secret Ballot Guarantee:</strong> Your vote choice is cryptographically separated from your identity. Once submitted, your vote is permanent and cannot be modified.
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
              >
                Change Choices
              </button>
              <button
                type="button"
                onClick={handleCastOfficialVote}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Sealing Ballot...</span>
                  </>
                ) : (
                  <>
                    <Vote className="h-4 w-4" />
                    <span>Confirm & Cast Vote</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CANDIDATE MANIFESTO MODAL */}
      {manifestoModalCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl animate-fade-in">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4 mb-4">
              <img
                src={manifestoModalCandidate.avatarUrl}
                alt={manifestoModalCandidate.fullName}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-cyan-400/50"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{manifestoModalCandidate.fullName}</h3>
                  <span className="text-xl">{manifestoModalCandidate.symbol}</span>
                </div>
                <p className="text-xs text-cyan-400 font-semibold">{manifestoModalCandidate.partyName}</p>
                <p className="text-[11px] text-slate-400">Symbol: {manifestoModalCandidate.symbolName}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Official Manifesto</span>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed italic text-cyan-100">
                  "{manifestoModalCandidate.manifesto}"
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Biography & Credentials</span>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {manifestoModalCandidate.bio}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950 p-2 rounded-lg">
                  <span className="text-slate-400 block">Education:</span>
                  <span className="font-semibold text-slate-200">{manifestoModalCandidate.education}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg">
                  <span className="text-slate-400 block">Candidate Age:</span>
                  <span className="font-semibold text-slate-200">{manifestoModalCandidate.age} Years</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setManifestoModalCandidate(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all"
            >
              Close Manifesto
            </button>
          </div>
        </div>
      )}

      {/* OFFICIAL VOTE RECEIPT POPUP AFTER SUBMISSION */}
      {voteReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl animate-fade-in text-center">
            <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 ring-8 ring-emerald-500/10">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-black text-white mb-1">
              Official Ballot Cast Successfully!
            </h3>
            <p className="text-xs text-slate-300 mb-5">
              Your ballot has been sealed into the cryptographic audit ledger. Keep your receipt token for tally verification.
            </p>

            {/* Receipt Card */}
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 mb-5 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Receipt Code:</span>
                <span className="font-bold text-emerald-400">{voteReceipt.receiptCode}</span>
              </div>

              <div className="border-b border-slate-800 pb-2">
                <span className="text-slate-400 block text-[10px] mb-1">SHA-256 Verification Hash:</span>
                <div className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded-lg">
                  <span className="text-[10px] text-cyan-300 truncate">{voteReceipt.verificationHash}</span>
                  <button
                    onClick={() => copyToClipboard(voteReceipt.verificationHash)}
                    className="text-slate-400 hover:text-white p-1"
                    title="Copy hash"
                  >
                    {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-[11px] pt-1">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">{voteReceipt.timestamp}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  const hash = voteReceipt.verificationHash;
                  setVoteReceipt(null);
                  onGoToVerify(hash);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Verify My Ballot in Audit Ledger</span>
              </button>

              <button
                onClick={() => {
                  setVoteReceipt(null);
                  onGoToResults();
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
              >
                View Live Results Tabulation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
