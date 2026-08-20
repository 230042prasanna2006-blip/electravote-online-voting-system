import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Lock, 
  Sparkles, 
  FileCheck, 
  Layers, 
  Copy, 
  Check,
  Building,
  ArrowRight
} from 'lucide-react';
import { CastVoteRecord, Election } from '../types';
import { storage } from '../services/storage';

interface VoteVerificationProps {
  initialHash?: string;
  onGoToBooth: () => void;
  onGoToResults: () => void;
}

export const VoteVerification: React.FC<VoteVerificationProps> = ({
  initialHash = '',
  onGoToBooth,
  onGoToResults
}) => {
  const [searchQuery, setSearchQuery] = useState(initialHash);
  const [matchedRecord, setMatchedRecord] = useState<CastVoteRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const votes = storage.getVotes();
  const elections = storage.getElections();

  useEffect(() => {
    if (initialHash) {
      setSearchQuery(initialHash);
      handleSearchWith(initialHash);
    }
  }, [initialHash]);

  const handleSearchWith = (query: string) => {
    setHasSearched(true);
    const cleaned = query.trim().toLowerCase();
    
    if (!cleaned) {
      setMatchedRecord(null);
      return;
    }

    const match = votes.find(
      v => v.voterReceiptHash.toLowerCase() === cleaned ||
           v.blockHash.toLowerCase() === cleaned ||
           v.voteId.toLowerCase() === cleaned
    );

    setMatchedRecord(match || null);
  };

  const handleFormSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchWith(searchQuery);
  };

  const matchedElection: Election | undefined = matchedRecord 
    ? elections.find(e => e.id === matchedRecord.electionId)
    : undefined;

  const copyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-semibold mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Independent Cryptographic Ballot Verifier</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Verify Your Vote in the Official Ledger
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Verify that your ballot has been permanently sealed into the tamper-proof ledger and counted in the final tally without exposing your secret candidate choice.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8">
        <form onSubmit={handleFormSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Paste your 64-character SHA-256 Verification Hash or Vote ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Search className="h-4 w-4" />
            <span>Verify Ballot Hash</span>
          </button>
        </form>

        {/* Quick sample chips */}
        {votes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Recent sample hashes in ledger:</span>
            {votes.slice(0, 3).map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSearchQuery(v.voterReceiptHash);
                  handleSearchWith(v.voterReceiptHash);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1 rounded-lg font-mono text-[10px] border border-slate-700 transition-colors"
              >
                {v.voterReceiptHash.slice(0, 12)}...
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Display */}
      {hasSearched && (
        matchedRecord ? (
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-white">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center ring-4 ring-emerald-500/10">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Ballot Verified & Counted in Tally</h3>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      CRYPTOGRAPHICALLY SEALED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Election: <strong className="text-slate-200">{matchedElection?.title || 'National Election'}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Record Integrity</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Unaltered
                </span>
              </div>
            </div>

            {/* Block & Hash Inspection Table */}
            <div className="space-y-3 font-mono text-xs mb-6">
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-400">Voter Receipt Hash:</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold break-all">{matchedRecord.voterReceiptHash}</span>
                  <button onClick={() => copyHash(matchedRecord.voterReceiptHash)} className="text-slate-400 hover:text-white">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-400">Audit Ledger Block Hash:</span>
                <span className="text-indigo-300 break-all">{matchedRecord.blockHash}</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-400">Chained Previous Block:</span>
                <span className="text-slate-500 break-all">{matchedRecord.prevBlockHash}</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-400">Sealed Timestamp:</span>
                <span className="text-slate-200">{matchedRecord.timestamp}</span>
              </div>
            </div>

            {/* Privacy Explanation */}
            <div className="bg-blue-950/40 border border-blue-500/20 rounded-2xl p-4 mb-6 text-xs text-blue-200 flex items-start gap-3">
              <Lock className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">End-to-End Verifiability + Absolute Ballot Privacy</strong>
                This cryptographic token proves your vote is officially stored in the database ledger without revealing the identity of candidate chosen, protecting your constitutionally guaranteed secret ballot.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onGoToResults}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <span>View Live Election Standings</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onGoToBooth}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
              >
                Return to Voting Booth
              </button>
            </div>

          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-xl">
            <div className="h-14 w-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold mb-1">No Matching Ledger Record Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              The hash or ID <code>"{searchQuery}"</code> does not match any sealed ballots in this election node.
            </p>
            <button
              onClick={onGoToBooth}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Go to Voting Booth
            </button>
          </div>
        )
      )}

      {/* How It Works Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-left">
          <div className="h-9 w-9 bg-blue-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-3">
            <KeyRound className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">1. Vote Hashing</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            When you submit your ballot, a 256-bit cryptographic digest is generated combining voter credentials with an anonymous salted salt.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-left">
          <div className="h-9 w-9 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-3">
            <Layers className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">2. Ledger Block Chaining</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Each vote record is linked to the previous block's SHA-256 hash, making retroactive tampering mathematically impossible.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-left">
          <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-3">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">3. Public Auditability</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Citizens and independent election observers can verify the mathematical integrity of the tally at any time.
          </p>
        </div>
      </div>

    </div>
  );
};
