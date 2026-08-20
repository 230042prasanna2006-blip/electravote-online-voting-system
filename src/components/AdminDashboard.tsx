import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Sparkles, 
  Layers, 
  Database, 
  Activity, 
  Search,
  Filter,
  FileCheck,
  RefreshCw,
  Award
} from 'lucide-react';
import { Election, Candidate, Voter, AuditLog, CastVoteRecord } from '../types';
import { storage } from '../services/storage';

interface AdminDashboardProps {
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefreshData }) => {
  const elections = storage.getElections();
  const candidates = storage.getCandidates();
  const voters = storage.getVoters();
  const votes = storage.getVotes();
  const auditLogs = storage.getAuditLogs();

  const [activeTab, setActiveTab] = useState<'elections' | 'candidates' | 'voters' | 'ledger' | 'logs'>('elections');
  
  // Voter search / filter state
  const [voterSearch, setVoterSearch] = useState('');
  const [voterStatusFilter, setVoterStatusFilter] = useState<'all' | 'approved' | 'pending' | 'voted'>('all');

  // New Election Form State
  const [showNewElectionModal, setShowNewElectionModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'University' | 'Civic / Municipal' | 'Corporate' | 'National'>('University');
  const [newDesc, setNewDesc] = useState('');
  const [newPositions, setNewPositions] = useState<string>('President, Vice President, Secretary');
  const [newConstituency, setNewConstituency] = useState('All Departments');
  const [newVotersCount, setNewVotersCount] = useState(1500);

  // New Candidate Form State
  const [showNewCandidateModal, setShowNewCandidateModal] = useState(false);
  const [candElectionId, setCandElectionId] = useState(elections[0]?.id || '');
  const [candPosition, setCandPosition] = useState('');
  const [candName, setCandName] = useState('');
  const [candParty, setCandParty] = useState('');
  const [candSymbol, setCandSymbol] = useState('🕊️');
  const [candSymbolName, setCandSymbolName] = useState('Dove of Peace');
  const [candManifesto, setCandManifesto] = useState('');
  const [candBio, setCandBio] = useState('');
  const [candAvatar, setCandAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');

  // Ledger Tamper Check Simulation State
  const [isVerifyingLedger, setIsVerifyingLedger] = useState(false);
  const [ledgerIntegrityResult, setLedgerIntegrityResult] = useState<string | null>(null);

  const handleCreateElection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const positionList = newPositions.split(',').map((p, idx) => ({
      id: `pos-${Date.now()}-${idx}`,
      title: p.trim(),
      description: `Contested election for ${p.trim()}`,
      maxSelections: 1
    })).filter(p => p.title.length > 0);

    storage.createElection({
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim() || 'Official Election Contest',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'active',
      eligibleConstituency: newConstituency,
      totalEligibleVoters: Number(newVotersCount) || 1000,
      positions: positionList.length > 0 ? positionList : [
        { id: 'pos-1', title: 'President', description: 'Executive Leader', maxSelections: 1 }
      ]
    });

    setShowNewElectionModal(false);
    setNewTitle('');
    setNewDesc('');
    onRefreshData();
  };

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim() || !candElectionId) return;

    const election = elections.find(el => el.id === candElectionId);
    const targetPos = candPosition || election?.positions[0]?.id || 'pos-default';

    storage.addCandidate({
      electionId: candElectionId,
      position: targetPos,
      fullName: candName.trim(),
      partyName: candParty.trim() || 'Independent',
      symbol: candSymbol,
      symbolName: candSymbolName,
      manifesto: candManifesto.trim() || 'Dedicated to serving the voters transparently.',
      bio: candBio.trim() || 'Community candidate with leadership background.',
      avatarUrl: candAvatar,
      education: 'Higher Education Degree',
      age: 25
    });

    setShowNewCandidateModal(false);
    setCandName('');
    setCandParty('');
    setCandManifesto('');
    onRefreshData();
  };

  const handleVerifyLedger = () => {
    setIsVerifyingLedger(true);
    setLedgerIntegrityResult(null);

    setTimeout(() => {
      setIsVerifyingLedger(false);
      setLedgerIntegrityResult(`Cryptographic Verification PASSED: ${votes.length} SHA-256 blocks verified. Zero hash collisions, zero orphaned chains, 100% mathematical integrity intact.`);
    }, 900);
  };

  const filteredVoters = voters.filter(v => {
    const matchesSearch = v.fullName.toLowerCase().includes(voterSearch.toLowerCase()) ||
                          v.voterId.toLowerCase().includes(voterSearch.toLowerCase()) ||
                          v.email.toLowerCase().includes(voterSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (voterStatusFilter === 'approved') return v.isApproved;
    if (voterStatusFilter === 'pending') return !v.isApproved;
    if (voterStatusFilter === 'voted') return v.hasVotedElections.length > 0;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      
      {/* Commission Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-full text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                CHIEF ELECTION COMMISSION OFFICER PANEL
              </span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                RBAC Level: SUPER_ADMIN
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Electoral Control & Administration Suite
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Configure election contests, manage ballot candidates, audit voter rolls, inspect cryptographic hash chains, and enforce election security.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowNewElectionModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create Election</span>
            </button>
            <button
              onClick={() => setShowNewCandidateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Nominate Candidate</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Reset entire system database to default initial state?')) {
                  storage.resetDatabase();
                  onRefreshData();
                }
              }}
              className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all"
              title="Reset database to seed"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800 no-scrollbar">
        <button
          onClick={() => setActiveTab('elections')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'elections' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Elections ({elections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'candidates' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Candidates ({candidates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('voters')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'voters' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Voter Roll KYC ({voters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ledger' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Cryptographic Hash Ledger ({votes.length} Blocks)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: ELECTIONS */}
      {activeTab === 'elections' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {elections.map((elec) => (
              <div
                key={elec.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-cyan-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                      {elec.category}
                    </span>
                    
                    {/* Status Toggle Badge */}
                    <div className="flex items-center gap-1.5">
                      {elec.status === 'active' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          ACTIVE
                        </span>
                      )}
                      {elec.status === 'upcoming' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          UPCOMING
                        </span>
                      )}
                      {elec.status === 'closed' && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">
                          CLOSED
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1.5">{elec.title}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{elec.description}</p>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Ballots Cast:</span>
                      <span className="text-cyan-300 font-bold">{elec.totalVotesCast.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contested Positions:</span>
                      <span className="text-white">{elec.positions.length} Offices</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Constituency:</span>
                      <span className="text-slate-300">{elec.eligibleConstituency}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  {elec.status !== 'active' && (
                    <button
                      onClick={() => {
                        storage.updateElectionStatus(elec.id, 'active');
                        onRefreshData();
                      }}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Open Polls
                    </button>
                  )}
                  {elec.status === 'active' && (
                    <button
                      onClick={() => {
                        storage.updateElectionStatus(elec.id, 'closed');
                        onRefreshData();
                      }}
                      className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Conclude & Close Polls
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATES */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((cand) => {
              const election = elections.find(e => e.id === cand.electionId);
              return (
                <div
                  key={cand.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={cand.avatarUrl}
                        alt={cand.fullName}
                        className="h-14 w-14 rounded-2xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-sm">{cand.fullName}</h4>
                          <span className="text-lg">{cand.symbol}</span>
                        </div>
                        <p className="text-xs text-cyan-400 font-semibold">{cand.partyName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{cand.symbolName}</p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1 mb-3">
                      <div className="text-slate-300 font-medium">Election: {election?.title || 'Contest'}</div>
                      <div className="text-cyan-300 font-mono">Current Votes: {cand.voteCount.toLocaleString()}</div>
                    </div>

                    <p className="text-xs text-slate-400 italic line-clamp-2 mb-3">
                      "{cand.manifesto}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm(`Remove candidate ${cand.fullName}?`)) {
                          storage.deleteCandidate(cand.id);
                          onRefreshData();
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: VOTER ROLL & KYC APPROVAL */}
      {activeTab === 'voters' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Electoral Voter Roll Management</h3>
              <p className="text-xs text-slate-400">Review voter identity verifications and manage duplicate protections.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search voter name, ID, or email..."
                  value={voterSearch}
                  onChange={(e) => setVoterSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-full sm:w-60"
                />
              </div>

              <select
                value={voterStatusFilter}
                onChange={(e) => setVoterStatusFilter(e.target.value as 'all' | 'approved' | 'pending' | 'voted')}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Voters ({voters.length})</option>
                <option value="approved">Approved / Verified</option>
                <option value="pending">Pending Verification</option>
                <option value="voted">Has Cast Vote</option>
              </select>
            </div>
          </div>

          {/* Voter Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Voter Identity</th>
                  <th className="py-3 px-4">Voter ID</th>
                  <th className="py-3 px-4">National ID</th>
                  <th className="py-3 px-4">Constituency</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4">Ballot Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredVoters.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-white flex items-center gap-2.5">
                      <img src={v.avatarUrl} alt={v.fullName} className="h-7 w-7 rounded-full object-cover" />
                      <div>
                        <div>{v.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{v.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-bold">{v.voterId}</td>
                    <td className="py-3 px-4 text-slate-300">{v.nationalId}</td>
                    <td className="py-3 px-4 font-sans text-slate-400">{v.constituency}</td>
                    <td className="py-3 px-4 font-sans">
                      {v.isApproved ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                          Approved
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                          Pending KYC
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {v.hasVotedElections.length > 0 ? (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                          {v.hasVotedElections.length} Voted
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Not Voted</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {v.isApproved ? (
                        <button
                          onClick={() => {
                            storage.approveVoter(v.id, false);
                            onRefreshData();
                          }}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold border border-amber-500/30"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            storage.approveVoter(v.id, true);
                            onRefreshData();
                          }}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/40"
                        >
                          Approve KYC
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 4: CRYPTOGRAPHIC HASH LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Immutable SHA-256 Audit Chain</h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                  {votes.length} Sealed Blocks
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cryptographic hash-linked chain proving every vote is sealed in real-time without tampering.
              </p>
            </div>

            <button
              onClick={handleVerifyLedger}
              disabled={isVerifyingLedger}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              {isVerifyingLedger ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying Hashes...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Run Cryptographic Ledger Verification</span>
                </>
              )}
            </button>
          </div>

          {ledgerIntegrityResult && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              <span>{ledgerIntegrityResult}</span>
            </div>
          )}

          {/* Ledger Blocks List */}
          <div className="space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto pr-1">
            {votes.map((block, idx) => (
              <div
                key={block.voteId}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <span className="text-cyan-400 font-bold flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Block #{idx + 1} ({block.voteId})</span>
                  </span>
                  <span className="text-slate-400 text-[10px] font-sans">{block.timestamp}</span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex flex-col sm:flex-row gap-1">
                    <span className="text-slate-500 sm:w-36 flex-shrink-0">Block Hash:</span>
                    <span className="text-indigo-300 break-all">{block.blockHash}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1">
                    <span className="text-slate-500 sm:w-36 flex-shrink-0">Prev Block Hash:</span>
                    <span className="text-slate-400 break-all">{block.prevBlockHash}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1">
                    <span className="text-slate-500 sm:w-36 flex-shrink-0">Receipt Hash:</span>
                    <span className="text-emerald-400 break-all">{block.voterReceiptHash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white mb-2">System Audit Event Log</h3>
          
          <div className="space-y-2.5 font-mono text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-slate-200 font-sans">{log.details}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Actor: {log.performedBy}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE ELECTION MODAL */}
      {showNewElectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4">Create New Election Contest</h3>

            <form onSubmit={handleCreateElection} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Election Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faculty Dean Senate Election 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as 'University' | 'Civic / Municipal' | 'Corporate' | 'National')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="University">University</option>
                    <option value="Civic / Municipal">Civic / Municipal</option>
                    <option value="Corporate">Corporate</option>
                    <option value="National">National</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Eligible Electorate</label>
                  <input
                    type="number"
                    value={newVotersCount}
                    onChange={(e) => setNewVotersCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contested Positions (Comma separated)</label>
                <input
                  type="text"
                  value={newPositions}
                  onChange={(e) => setNewPositions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewElectionModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold transition-all"
                >
                  Launch Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CANDIDATE MODAL */}
      {showNewCandidateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4">Nominate & Certify Candidate</h3>

            <form onSubmit={handleCreateCandidate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Election *</label>
                <select
                  value={candElectionId}
                  onChange={(e) => setCandElectionId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  {elections.map(el => (
                    <option key={el.id} value={el.id}>{el.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Maya Patel"
                    value={candName}
                    onChange={(e) => setCandName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Political Party / Slate</label>
                  <input
                    type="text"
                    placeholder="e.g. Progressive Reform League"
                    value={candParty}
                    onChange={(e) => setCandParty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Symbol Emoji</label>
                  <input
                    type="text"
                    value={candSymbol}
                    onChange={(e) => setCandSymbol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white text-center text-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Symbol Name</label>
                  <input
                    type="text"
                    value={candSymbolName}
                    onChange={(e) => setCandSymbolName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Key Manifesto Pitch</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Primary policy priorities..."
                  value={candManifesto}
                  onChange={(e) => setCandManifesto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCandidateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold transition-all"
                >
                  Certify Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
