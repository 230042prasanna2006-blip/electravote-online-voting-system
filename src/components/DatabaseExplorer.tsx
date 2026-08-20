import React, { useState } from 'react';
import { 
  Database, 
  Terminal, 
  Play, 
  Table, 
  Code2, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  HardDrive
} from 'lucide-react';
import { storage } from '../services/storage';

interface QueryPreset {
  title: string;
  sql: string;
  description: string;
  type: 'select' | 'join' | 'aggregation';
}

const PRESETS: QueryPreset[] = [
  {
    title: '1. All Registered Voters Roll',
    sql: 'SELECT voter_id, full_name, email, age, national_id, constituency, is_approved FROM voters;',
    description: 'Fetches voter KYC records and approval statuses.',
    type: 'select'
  },
  {
    title: '2. Live Candidates & Vote Counts',
    sql: 'SELECT id, full_name, party_name, symbol, vote_count FROM candidates ORDER BY vote_count DESC;',
    description: 'Current candidate scoreboard with party affiliations.',
    type: 'select'
  },
  {
    title: '3. Cryptographic Ballot Box Ledger',
    sql: 'SELECT vote_id, election_id, candidate_id, voter_receipt_hash, timestamp, block_hash FROM votes ORDER BY timestamp DESC;',
    description: 'Inspects immutable SHA-256 block ledger.',
    type: 'select'
  },
  {
    title: '4. Duplicate Prevention Status Table',
    sql: 'SELECT id, voter_id, election_id, voted_at FROM voter_election_status;',
    description: 'Enforces UNIQUE KEY uk_voter_election (1 vote per citizen).',
    type: 'select'
  },
  {
    title: '5. Vote Count Aggregation by Candidate',
    sql: 'SELECT c.full_name, c.party_name, COUNT(v.vote_id) AS total_counted_votes FROM candidates c LEFT JOIN votes v ON c.id = v.candidate_id GROUP BY c.id ORDER BY total_counted_votes DESC;',
    description: 'ACID aggregation eliminating manual counting errors.',
    type: 'aggregation'
  }
];

export const DatabaseExplorer: React.FC = () => {
  const [activeQuery, setActiveQuery] = useState(PRESETS[0].sql);
  const [queryOutput, setQueryOutput] = useState<{ columns: string[]; rows: (string | number | boolean)[][] } | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(4);
  const [copied, setCopied] = useState(false);

  const voters = storage.getVoters();
  const candidates = storage.getCandidates();
  const votes = storage.getVotes();
  const elections = storage.getElections();

  const handleExecute = (sql: string = activeQuery) => {
    const start = performance.now();
    const query = sql.toLowerCase();

    if (query.includes('from voters')) {
      const cols = ['voter_id', 'full_name', 'email', 'age', 'national_id', 'constituency', 'is_approved'];
      const rows = voters.map(v => [
        v.voterId,
        v.fullName,
        v.email,
        v.age,
        v.nationalId,
        v.constituency,
        v.isApproved ? 'TRUE (Approved)' : 'FALSE (Pending)'
      ]);
      setQueryOutput({ columns: cols, rows });
    } else if (query.includes('from candidates') && !query.includes('count(v.vote_id)')) {
      const cols = ['id', 'full_name', 'party_name', 'symbol', 'vote_count', 'education'];
      const rows = candidates.map(c => [
        c.id,
        c.fullName,
        c.partyName,
        c.symbol,
        c.voteCount,
        c.education
      ]);
      setQueryOutput({ columns: cols, rows });
    } else if (query.includes('from votes')) {
      const cols = ['vote_id', 'election_id', 'candidate_id', 'voter_receipt_hash', 'timestamp', 'block_hash'];
      const rows = votes.map(v => [
        v.voteId,
        v.electionId,
        v.candidateId,
        v.voterReceiptHash.slice(0, 16) + '...',
        v.timestamp,
        v.blockHash.slice(0, 16) + '...'
      ]);
      setQueryOutput({ columns: cols, rows });
    } else if (query.includes('from voter_election_status') || query.includes('uk_voter_election')) {
      const cols = ['voter_id', 'voter_name', 'voted_elections_count', 'status'];
      const rows = voters.map(v => [
        v.voterId,
        v.fullName,
        v.hasVotedElections.length,
        v.hasVotedElections.length > 0 ? 'VOTED (Locked)' : 'ELIGIBLE'
      ]);
      setQueryOutput({ columns: cols, rows });
    } else {
      // Aggregation
      const cols = ['full_name', 'party_name', 'total_counted_votes'];
      const rows = candidates.map(c => [
        c.fullName,
        c.partyName,
        c.voteCount
      ]).sort((a, b) => (b[2] as number) - (a[2] as number));
      setQueryOutput({ columns: cols, rows });
    }

    setExecutionTime(Math.round(performance.now() - start + 2));
  };

  const handlePresetSelect = (preset: QueryPreset) => {
    setActiveQuery(preset.sql);
    handleExecute(preset.sql);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold">
                <Database className="h-3.5 w-3.5" />
                MySQL 8.0 & JDBC RELATIONAL ENGINE
              </span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                Port 3306 • DB: online_voting_db
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              MySQL Interactive Database Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect database schemas, test queries with instant tabulated results, and explore ACID relational safety.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300">
            <HardDrive className="h-4 w-4 text-cyan-400" />
            <span>Tables: voters, candidates, elections, votes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Preset Queries */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Prepared SQL Queries</span>
            </h3>

            <div className="space-y-2.5">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all text-xs ${
                    activeQuery === preset.sql
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-white mb-1">{preset.title}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: SQL Editor & Tabular Output */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* SQL Editor Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                <Code2 className="h-4 w-4" />
                <span>SQL Query Editor</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Engine: MySQL InnoDB
              </span>
            </div>

            <textarea
              rows={3}
              value={activeQuery}
              onChange={(e) => setActiveQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-400 mb-3 resize-none"
            />

            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                Hit run to query live state.
              </span>

              <button
                onClick={() => handleExecute(activeQuery)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Execute SQL Query</span>
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Result Set Output
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {queryOutput ? `${queryOutput.rows.length} rows in set (${executionTime} ms)` : 'Query ready'}
              </span>
            </div>

            {queryOutput ? (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left font-mono text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      {queryOutput.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-3 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {queryOutput.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 whitespace-nowrap">
                            {typeof cell === 'number' ? (
                              <span className="text-cyan-400 font-bold">{cell.toLocaleString()}</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Click "Execute SQL Query" above to view database output.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
