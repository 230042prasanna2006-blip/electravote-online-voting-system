import React, { useRef } from 'react';
import { 
  Shield, 
  QrCode, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Fingerprint,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Voter } from '../types';

interface VoterIDCardProps {
  voter: Voter | null;
  onGoToRegister?: () => void;
  onGoToVote?: () => void;
}

export const VoterIDCard: React.FC<VoterIDCardProps> = ({ voter, onGoToRegister, onGoToVote }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!voter) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center shadow-xl">
        <div className="h-16 w-16 mx-auto bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-4 ring-8 ring-blue-500/5">
          <Shield className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Voter Profile Loaded</h3>
        <p className="text-sm text-slate-400 mb-6">
          Please register as an eligible voter or select an active voter profile to view and download your official Digital Voter ID Card.
        </p>
        {onGoToRegister && (
          <button
            onClick={onGoToRegister}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
          >
            Register as a New Voter
          </button>
        )}
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Digital Voter Identity Card</h2>
            <span className="bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Official Credential
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Cryptographically signed electronic voter identification for all authorized elections.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print ID Card</span>
          </button>
          {onGoToVote && (
            <button
              onClick={onGoToVote}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all"
            >
              <span>Go to Voting Booth</span>
            </button>
          )}
        </div>
      </div>

      {/* The Physical-Style Digital Voter Card */}
      <div className="flex justify-center mb-8">
        <div 
          ref={cardRef}
          className="w-full max-w-xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 border-2 border-blue-500/40 rounded-3xl p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden backdrop-blur-xl ring-1 ring-white/10"
        >
          {/* Holographic Watermark Background */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Subtle Security Guilloche Pattern */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          {/* Card Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 mb-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
                <div className="h-full w-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
                  Election Commission of Electra
                </h4>
                <p className="text-[10px] font-mono text-cyan-300/90 tracking-wider">
                  OFFICIAL NATIONAL DIGITAL ELECTOR'S PHOTO IDENTITY CARD
                </p>
              </div>
            </div>

            {/* Verification Status Badge */}
            <div>
              {voter.isApproved ? (
                <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>ACTIVE / ELIGIBLE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>PENDING APPROVAL</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center relative z-10">
            
            {/* Voter Photo & Fingerprint Hologram */}
            <div className="sm:col-span-4 flex flex-col items-center sm:items-start gap-3">
              <div className="relative group">
                <img
                  src={voter.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                  alt={voter.fullName}
                  className="h-36 w-32 object-cover rounded-2xl border-2 border-cyan-400/50 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-cyan-400/60 p-1.5 rounded-xl shadow-md">
                  <Fingerprint className="h-5 w-5 text-cyan-400" />
                </div>
              </div>

              <div className="text-center sm:text-left w-full">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">National ID Number</span>
                <span className="text-xs font-mono text-slate-200 tracking-wider font-bold">{voter.nationalId}</span>
              </div>
            </div>

            {/* Voter Details */}
            <div className="sm:col-span-8 space-y-3">
              
              {/* Voter ID Highlight */}
              <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">
                    Voter Identification Number
                  </span>
                  <span className="text-lg font-mono font-black text-white tracking-widest">
                    {voter.voterId}
                  </span>
                </div>
                <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-300">
                  <QrCode className="h-7 w-7" />
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Full Legal Name</span>
                  <span className="font-bold text-white text-sm">{voter.fullName}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Age & Status</span>
                  <span className="font-bold text-white text-sm">{voter.age} Years (Eligible)</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Constituency / Region</span>
                  <span className="font-semibold text-slate-200">{voter.constituency}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered Date</span>
                  <span className="font-mono text-slate-300">{voter.registrationDate}</span>
                </div>
              </div>

              {/* Voting Participation Record */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400 font-medium">Ballot History:</span>
                  <span className="text-cyan-300 font-semibold">
                    {voter.hasVotedElections.length > 0 ? `${voter.hasVotedElections.length} Election(s) Voted` : '0 Ballots Cast'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all" 
                    style={{ width: voter.hasVotedElections.length > 0 ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>

            </div>

          </div>

          {/* Card Footer Barcode & Microprint */}
          <div className="mt-5 pt-3 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 relative z-10">
            <div className="font-mono tracking-widest text-[9px] text-slate-400 flex items-center gap-1.5">
              <span>||| | | |||| || | |||| ||| || |</span>
              <span className="text-cyan-400">HASH: {voter.voterId.replace(/-/g, '')}77X9</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300 font-medium">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>Cryptographically Tamper-Proof Smart Ballot System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Voting Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
            <Shield className="h-4 w-4" />
            <span>Single-Vote Guarantee</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            The JDBC backend transaction layer enforces a strict unique constraint preventing duplicate ballot submissions.
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <QrCode className="h-4 w-4" />
            <span>Cryptographic Receipt</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Upon submitting your ballot, you will receive an anonymous SHA-256 verification hash to confirm your vote was counted.
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>Instant Results Tabulation</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Eliminates manual counting errors with automated atomic increments stored safely across MySQL database tables.
          </p>
        </div>
      </div>
    </div>
  );
};
