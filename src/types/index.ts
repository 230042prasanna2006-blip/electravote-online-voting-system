export type Role = 'voter' | 'admin';

export interface Voter {
  id: string;
  voterId: string; // e.g. VOT-2026-1042
  fullName: string;
  email: string;
  phone: string;
  age: number;
  nationalId: string;
  constituency: string;
  passwordHash?: string;
  isApproved: boolean;
  hasVotedElections: string[]; // election IDs voter has voted in
  registrationDate: string;
  avatarUrl?: string;
}

export interface Candidate {
  id: string;
  electionId: string;
  position: string;
  fullName: string;
  partyName: string;
  symbol: string; // emoji or icon code
  symbolName: string;
  manifesto: string;
  bio: string;
  avatarUrl: string;
  voteCount: number;
  education: string;
  age: number;
}

export interface ElectionPosition {
  id: string;
  title: string;
  description: string;
  maxSelections: number;
}

export interface Election {
  id: string;
  title: string;
  category: 'University' | 'Civic / Municipal' | 'Corporate' | 'National';
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'closed';
  positions: ElectionPosition[];
  eligibleConstituency: string; // 'All' or specific region
  totalEligibleVoters: number;
  totalVotesCast: number;
  bannerUrl?: string;
}

export interface CastVoteRecord {
  voteId: string;
  electionId: string;
  positionId: string;
  candidateId: string;
  voterReceiptHash: string; // Cryptographic hash for voter self-verification
  timestamp: string;
  blockHash: string;
  prevBlockHash: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface JavaFile {
  name: string;
  path: string;
  type: 'java' | 'sql' | 'xml' | 'md';
  description: string;
  content: string;
}
