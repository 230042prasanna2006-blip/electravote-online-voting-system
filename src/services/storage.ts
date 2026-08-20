import { Voter, Candidate, Election, CastVoteRecord, AuditLog } from '../types';
import { generateSHA256, generateVoterId, generateReceiptCode } from './crypto';

const STORAGE_KEYS = {
  VOTERS: 'electra_voters_v1',
  ELECTIONS: 'electra_elections_v1',
  CANDIDATES: 'electra_candidates_v1',
  VOTES: 'electra_votes_v1',
  AUDIT_LOGS: 'electra_audit_logs_v1',
  CURRENT_USER: 'electra_current_user_v1',
};

const INITIAL_ELECTIONS: Election[] = [
  {
    id: 'elec-2026-01',
    title: 'National University Student Council Election 2026',
    category: 'University',
    description: 'Annual election for the Central Student Council leadership across all academic faculties.',
    startDate: '2026-08-15T09:00:00Z',
    endDate: '2026-08-25T18:00:00Z',
    status: 'active',
    eligibleConstituency: 'All Departments',
    totalEligibleVoters: 2500,
    totalVotesCast: 1420,
    positions: [
      { id: 'pos-pres', title: 'Council President', description: 'Leads student body, represents students to administration', maxSelections: 1 },
      { id: 'pos-vp', title: 'Vice President', description: 'Oversees campus welfare and student community initiatives', maxSelections: 1 },
      { id: 'pos-sec', title: 'General Secretary', description: 'Directs communications, budget oversight, and resolutions', maxSelections: 1 }
    ]
  },
  {
    id: 'elec-2026-02',
    title: 'Metropolitan Civic District Council Election 2026',
    category: 'Civic / Municipal',
    description: 'Electing municipal ward representatives and community development trustees.',
    startDate: '2026-08-10T08:00:00Z',
    endDate: '2026-08-30T17:00:00Z',
    status: 'active',
    eligibleConstituency: 'District North & South',
    totalEligibleVoters: 18500,
    totalVotesCast: 9640,
    positions: [
      { id: 'pos-mayor', title: 'District Mayor', description: 'Executive leadership of municipal zoning, transport & green energy', maxSelections: 1 },
      { id: 'pos-com', title: 'Civic Development Commissioner', description: 'Manages public parks, infrastructure & waste automation', maxSelections: 1 }
    ]
  },
  {
    id: 'elec-2026-03',
    title: 'National Technology Guild Executive Assembly 2026',
    category: 'Corporate',
    description: 'Biennial governance election for the National Engineering & Software Guild.',
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2026-09-15T23:59:00Z',
    status: 'upcoming',
    eligibleConstituency: 'Certified Engineers',
    totalEligibleVoters: 8200,
    totalVotesCast: 0,
    positions: [
      { id: 'pos-chair', title: 'Board Chairperson', description: 'Strategic tech governance and standardizations', maxSelections: 1 }
    ]
  }
];

const INITIAL_CANDIDATES: Candidate[] = [
  // Election 1: Student Council - President
  {
    id: 'cand-101',
    electionId: 'elec-2026-01',
    position: 'pos-pres',
    fullName: 'Elena Rostova',
    partyName: 'Student Renaissance Coalition',
    symbol: '🦅',
    symbolName: 'Eagle of Progress',
    manifesto: '24/7 AI-equipped digital library, 100% transparent student activity fund allocation, and mental health crisis response squad.',
    bio: 'Senior Computer Science major, Debate Society President, 3x Dean’s List honoree.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    voteCount: 684,
    education: 'B.Sc. Computer Science (Final Year)',
    age: 21
  },
  {
    id: 'cand-102',
    electionId: 'elec-2026-01',
    position: 'pos-pres',
    fullName: 'Marcus Vance',
    partyName: 'Alliance for Campus Equity (ACE)',
    symbol: '⚡',
    symbolName: 'Lightning Bolt of Innovation',
    manifesto: 'Free universal campus transit pass, heavily subsidized healthy dining options, and expanded career incubator funding.',
    bio: 'Junior Economics & Public Policy major, campus sustainability coordinator, track athlete.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    voteCount: 542,
    education: 'B.A. Economics & International Affairs',
    age: 22
  },
  {
    id: 'cand-103',
    electionId: 'elec-2026-01',
    position: 'pos-pres',
    fullName: 'Aria Chen',
    partyName: 'Independent Voice Forward',
    symbol: '🌱',
    symbolName: 'Sprout of New Horizons',
    manifesto: 'Direct democratic student voting on major policies, non-profit book exchange, zero single-use plastic campus.',
    bio: 'Biomedical Engineering researcher, peer counseling founder, student mentor.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    voteCount: 194,
    education: 'B.S. Biomedical Engineering',
    age: 21
  },

  // Election 1: Student Council - Vice President
  {
    id: 'cand-104',
    electionId: 'elec-2026-01',
    position: 'pos-vp',
    fullName: 'Devon Wright',
    partyName: 'Student Renaissance Coalition',
    symbol: '🔥',
    symbolName: 'Torch of Unity',
    manifesto: 'Renovated recreational halls, high-speed WiFi coverage in residential courtyards, sports team travel endowments.',
    bio: 'Business Administration major, varsity basketball captain.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    voteCount: 780,
    education: 'B.B.A. Marketing & Finance',
    age: 22
  },
  {
    id: 'cand-105',
    electionId: 'elec-2026-01',
    position: 'pos-vp',
    fullName: 'Priya Sharma',
    partyName: 'Alliance for Campus Equity (ACE)',
    symbol: '🌟',
    symbolName: 'Rising Star',
    manifesto: 'International student integration support, emergency relief grants, transparent academic grading reviews.',
    bio: 'Cognitive Science scholar, multilingual peer ombudsman.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    voteCount: 640,
    education: 'B.Sc. Cognitive Science',
    age: 20
  },

  // Election 1: Student Council - General Secretary
  {
    id: 'cand-106',
    electionId: 'elec-2026-01',
    position: 'pos-sec',
    fullName: 'Liam O’Connor',
    partyName: 'Student Renaissance Coalition',
    symbol: '🛡️',
    symbolName: 'Shield of Integrity',
    manifesto: 'Real-time open ledger for all student expenditure, weekly audio-broadcasted council meetings, open grievance portal.',
    bio: 'Law & Governance minor, student newspaper editor-in-chief.',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    voteCount: 812,
    education: 'B.A. Political Science',
    age: 21
  },
  {
    id: 'cand-107',
    electionId: 'elec-2026-01',
    position: 'pos-sec',
    fullName: 'Sofia Morales',
    partyName: 'Independent Voice Forward',
    symbol: '🧭',
    symbolName: 'Compass of Truth',
    manifesto: 'Streamlined club funding approval within 48 hours, digital room booking system, campus arts fellowship.',
    bio: 'Software Engineering student, hackathon organizer.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    voteCount: 608,
    education: 'B.S. Software Engineering',
    age: 20
  },

  // Election 2: Civic District Council - District Mayor
  {
    id: 'cand-201',
    electionId: 'elec-2026-02',
    position: 'pos-mayor',
    fullName: 'Hon. Arthur Pendelton',
    partyName: 'Civic Forward League',
    symbol: '🏛️',
    symbolName: 'Civic Pillar',
    manifesto: 'Rapid public transit expansion, 15-minute neighborhood zoning, zero-carbon smart municipal grid by 2030.',
    bio: 'Former urban planning director, 12 years municipal leadership.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    voteCount: 5210,
    education: 'M.P.A. Urban Administration, Harvard Kennedy School',
    age: 48
  },
  {
    id: 'cand-202',
    electionId: 'elec-2026-02',
    position: 'pos-mayor',
    fullName: 'Dr. Evelyn Martinez',
    partyName: 'Green Metropolitan Party',
    symbol: '🌳',
    symbolName: 'Evergreen Oak',
    manifesto: 'Clean air zones, community solar cooperatives, youth recreational centers, small enterprise tax relief.',
    bio: 'Environmental epidemiologist, neighborhood health coalition chair.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    voteCount: 4430,
    education: 'Ph.D. Environmental Health Sciences',
    age: 42
  },

  // Election 2: Civic District Council - Commissioner
  {
    id: 'cand-203',
    electionId: 'elec-2026-02',
    position: 'pos-com',
    fullName: 'Kofi Mensah',
    partyName: 'Civic Forward League',
    symbol: '⚙️',
    symbolName: 'Progress Gear',
    manifesto: 'Pothole detection AI, transparent municipal procurement, automated smart streetlighting.',
    bio: 'Civil engineer, infrastructure consultant.',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    voteCount: 5120,
    education: 'M.Sc. Civil & Structural Engineering',
    age: 39
  },
  {
    id: 'cand-204',
    electionId: 'elec-2026-02',
    position: 'pos-com',
    fullName: 'Clara Johansson',
    partyName: 'United Citizens Guild',
    symbol: '🤝',
    symbolName: 'Unity Handshake',
    manifesto: 'Affordable family housing initiatives, protected cycling networks, senior community daycare services.',
    bio: 'Housing rights advocate, civic board organizer.',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    voteCount: 4520,
    education: 'B.A. Social Work & Public Policy',
    age: 36
  }
];

const INITIAL_VOTERS: Voter[] = [
  {
    id: 'voter-001',
    voterId: 'VOT-2026-1001',
    fullName: 'Alexander Drake',
    email: 'alexander.drake@university.edu',
    phone: '+1 (555) 234-8901',
    age: 22,
    nationalId: 'NAT-99882211',
    constituency: 'All Departments',
    isApproved: true,
    hasVotedElections: [], // Can vote immediately
    registrationDate: '2026-08-10',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'voter-002',
    voterId: 'VOT-2026-1002',
    fullName: 'Samantha Rivera',
    email: 'samantha.r@university.edu',
    phone: '+1 (555) 876-4321',
    age: 20,
    nationalId: 'NAT-44332211',
    constituency: 'All Departments',
    isApproved: true,
    hasVotedElections: ['elec-2026-01'], // Already voted demo
    registrationDate: '2026-08-12',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'voter-003',
    voterId: 'VOT-2026-1003',
    fullName: 'Jordan Sterling',
    email: 'jordan.sterling@apex.org',
    phone: '+1 (555) 345-6789',
    age: 19,
    nationalId: 'NAT-77665544',
    constituency: 'All Departments',
    isApproved: false, // Pending KYC approval demo
    hasVotedElections: [],
    registrationDate: '2026-08-19',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'voter-004',
    voterId: 'VOT-2026-1004',
    fullName: 'Maya Lin',
    email: 'maya.lin@metrodistrict.gov',
    phone: '+1 (555) 901-2345',
    age: 34,
    nationalId: 'NAT-11223344',
    constituency: 'District North & South',
    isApproved: true,
    hasVotedElections: ['elec-2026-02'],
    registrationDate: '2026-08-01',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
  }
];

const INITIAL_VOTES: CastVoteRecord[] = [
  {
    voteId: 'VOTE-REC-001',
    electionId: 'elec-2026-01',
    positionId: 'pos-pres',
    candidateId: 'cand-101',
    voterReceiptHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    timestamp: '2026-08-16T10:14:22Z',
    blockHash: '0000a4b987c6543210feebda88112233445566778899aabbccddeeff00112233',
    prevBlockHash: '0000000000000000000000000000000000000000000000000000000000000000'
  },
  {
    voteId: 'VOTE-REC-002',
    electionId: 'elec-2026-01',
    positionId: 'pos-vp',
    candidateId: 'cand-104',
    voterReceiptHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    timestamp: '2026-08-16T10:14:23Z',
    blockHash: '0000b5c112233445566778899aabbccddeeff00112233445566778899aabbccd',
    prevBlockHash: '0000a4b987c6543210feebda88112233445566778899aabbccddeeff00112233'
  },
  {
    voteId: 'VOTE-REC-003',
    electionId: 'elec-2026-01',
    positionId: 'pos-sec',
    candidateId: 'cand-106',
    voterReceiptHash: '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b',
    timestamp: '2026-08-16T10:14:24Z',
    blockHash: '0000c6d2233445566778899aabbccddeeff00112233445566778899aabbccdde',
    prevBlockHash: '0000b5c112233445566778899aabbccddeeff00112233445566778899aabbccd'
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-15T09:00:00Z',
    action: 'ELECTION_OPENED',
    performedBy: 'Chief Election Commissioner',
    details: 'Election elec-2026-01 successfully transitioned to ACTIVE state. Polls opened.',
    status: 'SUCCESS'
  },
  {
    id: 'log-2',
    timestamp: '2026-08-16T10:14:22Z',
    action: 'VOTE_BALLOT_CAST',
    performedBy: 'Voter System Node #4',
    details: 'Anonymized cryptographic ballot securely recorded with SHA-256 chained block #3.',
    status: 'SUCCESS'
  },
  {
    id: 'log-3',
    timestamp: '2026-08-19T14:30:00Z',
    action: 'VOTER_REGISTERED',
    performedBy: 'Self-Service Portal',
    details: 'Voter application received for Jordan Sterling (VOT-2026-1003). Pending verification.',
    status: 'WARNING'
  }
];

class StorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error', e);
    }
  }

  // Voters
  getVoters(): Voter[] {
    return this.get<Voter[]>(STORAGE_KEYS.VOTERS, INITIAL_VOTERS);
  }

  saveVoters(voters: Voter[]): void {
    this.set(STORAGE_KEYS.VOTERS, voters);
  }

  registerVoter(data: Omit<Voter, 'id' | 'voterId' | 'isApproved' | 'hasVotedElections' | 'registrationDate'>): Voter {
    const voters = this.getVoters();
    
    // Check if national ID or email already registered
    const existing = voters.find(v => v.nationalId.toLowerCase() === data.nationalId.toLowerCase() || v.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error(`A voter with this National ID or Email is already registered (Voter ID: ${existing.voterId}).`);
    }

    const newVoter: Voter = {
      ...data,
      id: 'voter-' + Date.now(),
      voterId: generateVoterId(),
      isApproved: true, // Auto-approved or officer approved
      hasVotedElections: [],
      registrationDate: new Date().toISOString().split('T')[0],
      avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.fullName)}`
    };

    voters.push(newVoter);
    this.saveVoters(voters);

    this.addAuditLog({
      action: 'VOTER_REGISTERED',
      performedBy: 'Voter Portal',
      details: `New voter registered: ${newVoter.fullName} (${newVoter.voterId}) in ${newVoter.constituency}`,
      status: 'SUCCESS'
    });

    return newVoter;
  }

  approveVoter(voterId: string, approve: boolean): void {
    const voters = this.getVoters();
    const idx = voters.findIndex(v => v.id === voterId);
    if (idx !== -1) {
      voters[idx].isApproved = approve;
      this.saveVoters(voters);
      this.addAuditLog({
        action: approve ? 'VOTER_APPROVED' : 'VOTER_REJECTED',
        performedBy: 'Election Officer',
        details: `Voter ${voters[idx].fullName} (${voters[idx].voterId}) approval status updated to: ${approve ? 'APPROVED' : 'REJECTED'}`,
        status: approve ? 'SUCCESS' : 'WARNING'
      });
    }
  }

  // Elections
  getElections(): Election[] {
    return this.get<Election[]>(STORAGE_KEYS.ELECTIONS, INITIAL_ELECTIONS);
  }

  saveElections(elections: Election[]): void {
    this.set(STORAGE_KEYS.ELECTIONS, elections);
  }

  createElection(election: Omit<Election, 'id' | 'totalVotesCast'>): Election {
    const elections = this.getElections();
    const newElection: Election = {
      ...election,
      id: 'elec-' + Date.now(),
      totalVotesCast: 0
    };
    elections.push(newElection);
    this.saveElections(elections);

    this.addAuditLog({
      action: 'ELECTION_CREATED',
      performedBy: 'Election Commissioner',
      details: `Created election: "${newElection.title}" (${newElection.category})`,
      status: 'SUCCESS'
    });

    return newElection;
  }

  updateElectionStatus(electionId: string, status: 'active' | 'upcoming' | 'closed'): void {
    const elections = this.getElections();
    const idx = elections.findIndex(e => e.id === electionId);
    if (idx !== -1) {
      elections[idx].status = status;
      this.saveElections(elections);

      this.addAuditLog({
        action: `ELECTION_STATUS_${status.toUpperCase()}`,
        performedBy: 'Election Commissioner',
        details: `Election "${elections[idx].title}" status set to ${status.toUpperCase()}`,
        status: 'SUCCESS'
      });
    }
  }

  // Candidates
  getCandidates(): Candidate[] {
    return this.get<Candidate[]>(STORAGE_KEYS.CANDIDATES, INITIAL_CANDIDATES);
  }

  saveCandidates(candidates: Candidate[]): void {
    this.set(STORAGE_KEYS.CANDIDATES, candidates);
  }

  addCandidate(candidate: Omit<Candidate, 'id' | 'voteCount'>): Candidate {
    const candidates = this.getCandidates();
    const newCand: Candidate = {
      ...candidate,
      id: 'cand-' + Date.now(),
      voteCount: 0
    };
    candidates.push(newCand);
    this.saveCandidates(candidates);

    this.addAuditLog({
      action: 'CANDIDATE_ADDED',
      performedBy: 'Election Commissioner',
      details: `Nominated candidate: ${newCand.fullName} for position ${newCand.position}`,
      status: 'SUCCESS'
    });

    return newCand;
  }

  deleteCandidate(candidateId: string): void {
    const candidates = this.getCandidates();
    const filtered = candidates.filter(c => c.id !== candidateId);
    this.saveCandidates(filtered);

    this.addAuditLog({
      action: 'CANDIDATE_REMOVED',
      performedBy: 'Election Commissioner',
      details: `Candidate record ID ${candidateId} removed from ballot.`,
      status: 'WARNING'
    });
  }

  // Votes Ledger
  getVotes(): CastVoteRecord[] {
    return this.get<CastVoteRecord[]>(STORAGE_KEYS.VOTES, INITIAL_VOTES);
  }

  saveVotes(votes: CastVoteRecord[]): void {
    this.set(STORAGE_KEYS.VOTES, votes);
  }

  // CAST VOTE TRANSACTION (Strict 1-Vote Enforcement & Cryptographic Ledger Entry)
  async castVote(
    voterId: string,
    electionId: string,
    selections: Record<string, string> // positionId -> candidateId
  ): Promise<{ receiptCode: string; verificationHash: string; timestamp: string }> {
    const voters = this.getVoters();
    const voter = voters.find(v => v.id === voterId || v.voterId === voterId);

    if (!voter) {
      throw new Error('Voter record not found in system database.');
    }

    if (!voter.isApproved) {
      throw new Error('Voter identity is pending approval by the Election Commission.');
    }

    if (voter.hasVotedElections.includes(electionId)) {
      throw new Error('DUPLICATE VOTE PROHIBITED: You have already cast your official vote for this election.');
    }

    const elections = this.getElections();
    const election = elections.find(e => e.id === electionId);
    if (!election || election.status !== 'active') {
      throw new Error('This election is not currently open for live voting.');
    }

    const candidates = this.getCandidates();
    const votes = this.getVotes();
    const timestamp = new Date().toISOString();
    const receiptCode = generateReceiptCode();
    
    // Anonymized receipt hash using SHA-256
    const verificationHash = await generateSHA256(
      `${voter.nationalId}-${electionId}-${receiptCode}-${timestamp}`
    );

    let lastBlockHash = votes.length > 0 ? votes[votes.length - 1].blockHash : '0000000000000000000000000000000000000000000000000000000000000000';

    // Increment candidate counts and create immutable records for each position
    for (const [positionId, candidateId] of Object.entries(selections)) {
      const cand = candidates.find(c => c.id === candidateId);
      if (cand) {
        cand.voteCount += 1;
      }

      const blockPayload = `${lastBlockHash}-${electionId}-${positionId}-${candidateId}-${timestamp}-${Math.random()}`;
      const newBlockHash = await generateSHA256(blockPayload);

      const voteRecord: CastVoteRecord = {
        voteId: `VOTE-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        electionId,
        positionId,
        candidateId,
        voterReceiptHash: verificationHash,
        timestamp,
        blockHash: newBlockHash,
        prevBlockHash: lastBlockHash
      };

      votes.push(voteRecord);
      lastBlockHash = newBlockHash;
    }

    // Mark voter as voted for this election
    voter.hasVotedElections.push(electionId);
    election.totalVotesCast += 1;

    // Persist all state updates atomically
    this.saveCandidates(candidates);
    this.saveVoters(voters);
    this.saveElections(elections);
    this.saveVotes(votes);

    // Audit log
    this.addAuditLog({
      action: 'VOTE_CAST_VERIFIED',
      performedBy: `Voter Receipt ${receiptCode}`,
      details: `Ballot cast for Election "${election.title}". Receipt Hash: ${verificationHash.slice(0, 16)}...`,
      status: 'SUCCESS'
    });

    return {
      receiptCode,
      verificationHash,
      timestamp
    };
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 150));
  }

  // Current session
  getCurrentUser(): Voter | null {
    return this.get<Voter | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_VOTERS[0]);
  }

  setCurrentUser(voter: Voter | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, voter);
  }

  // Reset database to initial seed
  resetDatabase(): void {
    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(INITIAL_VOTERS));
    localStorage.setItem(STORAGE_KEYS.ELECTIONS, JSON.stringify(INITIAL_ELECTIONS));
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(INITIAL_VOTES));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_VOTERS[0]));
  }
}

export const storage = new StorageService();
