import React, { useState } from 'react';
import { 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Fingerprint,
  Upload
} from 'lucide-react';
import { Voter } from '../types';
import { storage } from '../services/storage';

interface VoterRegistrationProps {
  onRegistered: (newVoter: Voter) => void;
  onGoToLogin: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
];

export const VoterRegistration: React.FC<VoterRegistrationProps> = ({ onRegistered, onGoToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [nationalId, setNationalId] = useState('');
  const [constituency, setConstituency] = useState('All Departments');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  
  const [error, setError] = useState<string | null>(null);
  const [successVoter, setSuccessVoter] = useState<Voter | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a valid contact phone number.');
      return;
    }
    if (!age || Number(age) < 18) {
      setError('Age Eligibility Error: You must be at least 18 years of age to register to vote.');
      return;
    }
    if (!nationalId.trim()) {
      setError('National Identification Number (or Student ID) is required.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Security Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      const voter = storage.registerVoter({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        age: Number(age),
        nationalId: nationalId.trim().toUpperCase(),
        constituency,
        passwordHash: 'hash_' + password,
        avatarUrl: selectedAvatar
      });

      setSuccessVoter(voter);
      onRegistered(voter);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-cyan-400 rounded-full text-xs font-semibold mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Official E-Voter Roll Enrollment</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Voter Registration & Verification
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Enroll into the decentralized electoral registry. Fill in your verified credentials to obtain an authorized digital Voter ID and cast your ballot.
        </p>
      </div>

      {successVoter ? (
        <div className="max-w-xl mx-auto bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-8 text-center shadow-2xl animate-fade-in">
          <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-500/10">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">Registration Successful!</h3>
          <p className="text-sm text-slate-300 mb-6">
            Your voter record has been securely created in the MySQL database and verified by the Election Commission.
          </p>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 mb-6 text-left space-y-2.5 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Assigned Voter ID:</span>
              <span className="font-bold text-cyan-400 text-sm">{successVoter.voterId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Full Legal Name:</span>
              <span className="text-white font-sans font-semibold">{successVoter.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">National ID:</span>
              <span className="text-slate-200">{successVoter.nationalId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Constituency:</span>
              <span className="text-slate-200">{successVoter.constituency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ballot Eligibility:</span>
              <span className="text-emerald-400 font-bold">100% Eligible (1 Vote Allowed)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onRegistered(successVoter)}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <span>View My Voter ID Card</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setSuccessVoter(null);
                setFullName('');
                setEmail('');
                setNationalId('');
              }}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all"
            >
              Register Another Voter
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Column */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            {error && (
              <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Sterling"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="voter@domain.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Age & National ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Age (Years) *
                    </label>
                    <span className={`text-[11px] font-semibold ${age && Number(age) >= 18 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {age && Number(age) >= 18 ? '✓ Eligible (≥18)' : 'Min. 18 Years Required'}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    required
                    placeholder="e.g. 21"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    National ID / Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NAT-88991122"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 uppercase font-mono focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Constituency & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Constituency / Division *
                  </label>
                  <select
                    value={constituency}
                    onChange={(e) => setConstituency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                  >
                    <option value="All Departments">All Departments (University-wide)</option>
                    <option value="District North & South">District North & South (Civic)</option>
                    <option value="Engineering Faculty">Engineering Faculty</option>
                    <option value="Medical & Health Sciences">Medical & Health Sciences</option>
                    <option value="Business & Law Faculty">Business & Law Faculty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Security Password *
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
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Photo for Voter ID Card
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative rounded-xl overflow-hidden p-0.5 transition-all ${
                        selectedAvatar === url 
                          ? 'ring-2 ring-cyan-400 scale-105 shadow-md shadow-cyan-500/30' 
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="h-12 w-12 object-cover rounded-lg" />
                      {selectedAvatar === url && (
                        <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>{isSubmitting ? 'Registering...' : 'Complete Voter Enrollment'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already registered as an eligible voter? </span>
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="text-xs text-cyan-400 font-semibold hover:underline"
                >
                  Log in here
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Card Preview */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Live Card Generator Preview</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                Auto-Draft
              </span>
            </div>

            {/* Mini Card Representation */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 border border-blue-500/30 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-700/60 pb-2 mb-3">
                <span className="text-[10px] font-bold text-cyan-300 uppercase">ELECTION COMMISSION</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                  VERIFIED CARD
                </span>
              </div>

              <div className="flex gap-3 items-center mb-3">
                <img
                  src={selectedAvatar}
                  alt="Preview"
                  className="h-16 w-14 object-cover rounded-xl border border-cyan-400/40"
                />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white truncate max-w-[170px]">
                    {fullName || 'Your Legal Name'}
                  </p>
                  <p className="text-[10px] font-mono text-cyan-400">
                    ID: VOT-2026-XXXX
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {constituency}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 rounded-lg p-2 flex justify-between items-center text-[10px]">
                <div className="font-mono text-slate-300">
                  NAT-ID: {nationalId ? nationalId.toUpperCase() : 'NAT-XXXXXXXX'}
                </div>
                <div className="text-cyan-400 font-mono">
                  AGE: {age || '--'}
                </div>
              </div>
            </div>

            {/* System Objectives Info List */}
            <div className="mt-6 space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Enforces strict single-vote casting per registered citizen.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Prevents duplicate registration by National ID / Email constraint.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Issues cryptographically secure receipt hash upon ballot casting.</span>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
