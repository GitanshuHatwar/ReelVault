import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Bookmark,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Clock,
  ArrowRight,
  Layers,
  Settings,
  Shield,
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { api } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, session, signOut } = useAuth();

  const [copiedId, setCopiedId] = useState(false);
  const [reels, setReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // User customizable preferences with localStorage persistence
  const [autoResearch, setAutoResearch] = useState(() => {
    return localStorage.getItem('reelvault_pref_auto_research') === 'true';
  });
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem('reelvault_pref_tz') || 'Asia/Kolkata (IST)';
  });
  const [exportFormat, setExportFormat] = useState(() => {
    return localStorage.getItem('reelvault_pref_export') || 'iCalendar (.ics)';
  });

  const displayEmail = user?.email || session?.user?.email || 'Signed in';
  const displayName = displayEmail.includes('@')
    ? displayEmail.split('@')[0].charAt(0).toUpperCase() + displayEmail.split('@')[0].slice(1)
    : 'User';
  const userId = user?.id || session?.user?.id || 'usr_' + Math.random().toString(36).substring(2, 10);

  // Load user's reels to calculate real-time stats
  const fetchUserVault = async () => {
    setLoadingReels(true);
    try {
      const data = await api.listReels();
      setReels(Array.isArray(data) ? data : []);
    } catch {
      setReels([]);
    } finally {
      setLoadingReels(false);
    }
  };

  useEffect(() => {
    fetchUserVault();
  }, []);

  // Compute live stats
  const stats = useMemo(() => {
    const total = reels.length;
    const platforms = new Set(reels.map((r) => r.platform).filter(Boolean));
    const withTranscript = reels.filter((r) => r.transcript && r.transcript.trim().length > 0).length;
    return {
      total,
      platformsCount: platforms.size || (total > 0 ? 1 : 0),
      withTranscript,
      platformNames: Array.from(platforms),
    };
  }, [reels]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleToggleAutoResearch = () => {
    const next = !autoResearch;
    setAutoResearch(next);
    localStorage.setItem('reelvault_pref_auto_research', String(next));
  };

  const handleTimezoneChange = (e) => {
    const val = e.target.value;
    setTimezone(val);
    localStorage.setItem('reelvault_pref_tz', val);
  };

  const handleExportFormatChange = (e) => {
    const val = e.target.value;
    setExportFormat(val);
    localStorage.setItem('reelvault_pref_export', val);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/auth');
    } catch {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-16 space-y-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#114b43]/10 text-[#114b43] text-xs font-bold uppercase tracking-wider mb-2">
            <User size={13} />
            <span>Account Dashboard</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-[#1a1a1a] uppercase leading-none">
            Your Profile
          </h1>
          <p className="text-gray-600 font-medium text-base mt-2">
            Manage your ReelVault credentials, preferences, and opportunity vault activity.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUserVault}
          disabled={loadingReels}
          className="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#114b43] bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          title="Refresh statistics"
        >
          <RefreshCw size={14} className={loadingReels ? 'animate-spin text-[#114b43]' : ''} />
          <span>Sync Data</span>
        </button>
      </header>

      {/* Hero Profile Card */}
      <div className="relative overflow-hidden bg-[#114b43] rounded-[2rem] p-6 sm:p-8 text-white shadow-xl">
        {/* Glow ambient background accents */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#d4f954]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-48 h-48 bg-[#d4f954]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar badge */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#d4f954] text-[#114b43] flex items-center justify-center font-display text-3xl sm:text-4xl shadow-md font-bold uppercase tracking-wider">
                {displayName.charAt(0)}
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[#114b43] rounded-full"
                title="Active Session"
              />
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                  {displayName}
                </h2>
                <span className="bg-[#d4f954] text-[#114b43] text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest flex items-center gap-1">
                  <ShieldCheck size={11} strokeWidth={3} /> Verified
                </span>
                <span className="bg-white/10 text-gray-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider border border-white/15">
                  Early Adopter
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                <Mail size={14} className="text-[#d4f954]" />
                <span>{displayEmail}</span>
              </div>

              {/* User ID with Copy Action */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-gray-400 font-mono bg-black/20 px-2 py-1 rounded-md border border-white/10">
                  ID: {userId.length > 20 ? `${userId.slice(0, 12)}...${userId.slice(-6)}` : userId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                  title="Copy User ID"
                >
                  {copiedId ? <Check size={13} className="text-[#d4f954]" /> : <Copy size={13} />}
                </button>
                {copiedId && (
                  <span className="text-[11px] font-medium text-[#d4f954] animate-fade-in">
                    Copied!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Jump Action */}
          <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
            <div className="text-left md:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Session Status
              </span>
              <span className="text-sm font-semibold text-[#d4f954] flex items-center gap-1.5 md:justify-end">
                <span className="w-2 h-2 rounded-full bg-[#d4f954] animate-pulse" />
                Authenticated
              </span>
            </div>

            <Link
              to="/vault"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/15 hover:border-white/30"
            >
              <Bookmark size={15} />
              <span>Go to Vault</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Activity & Performance Metrics Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#114b43]" />
            <h2 className="font-display text-xl uppercase tracking-wide text-[#1a1a1a]">
              Vault & AI Statistics
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">Real-time usage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Saved */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Saved</span>
              <div className="w-8 h-8 rounded-lg bg-[#F5F3E9] text-[#114b43] flex items-center justify-center">
                <Bookmark size={16} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-display text-[#1a1a1a]">
                {loadingReels ? '—' : stats.total}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {stats.total === 1 ? '1 reel stored in vault' : `${stats.total} reels stored in vault`}
              </p>
            </div>
          </div>

          {/* Card 2: Extracted Transcripts */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Transcripts</span>
              <div className="w-8 h-8 rounded-lg bg-[#F5F3E9] text-[#114b43] flex items-center justify-center">
                <Layers size={16} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-display text-[#1a1a1a]">
                {loadingReels ? '—' : stats.withTranscript}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Verbatim audio extractions
              </p>
            </div>
          </div>

          {/* Card 3: Platforms Tracked */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Platforms</span>
              <div className="w-8 h-8 rounded-lg bg-[#F5F3E9] text-[#114b43] flex items-center justify-center">
                <ExternalLink size={16} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-display text-[#1a1a1a]">
                {loadingReels ? '—' : stats.platformsCount || 3}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {stats.platformNames.length > 0
                  ? stats.platformNames.join(', ')
                  : 'Instagram, YouTube, TikTok'}
              </p>
            </div>
          </div>

          {/* Card 4: AI Model Tier */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Verification</span>
              <div className="w-8 h-8 rounded-lg bg-[#d4f954]/40 text-[#114b43] flex items-center justify-center">
                <Sparkles size={16} />
              </div>
            </div>
            <div>
              <div className="text-xl font-display text-[#114b43] uppercase tracking-wide">
                Opportunity Engine
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Official source verification
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Grid: Preferences & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferences Section */}
        <section className="bg-white rounded-[2rem] p-6 sm:p-7 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Settings size={18} className="text-[#114b43]" />
            <h2 className="font-display text-xl uppercase tracking-wide text-[#1a1a1a]">
              Pipeline Preferences
            </h2>
          </div>

          <div className="space-y-5">
            {/* Timezone Setting */}
            <div className="space-y-1.5">
              <label htmlFor="pref-timezone" className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Default Timezone
              </label>
              <p className="text-xs text-gray-500">
                Used to resolve ambiguous deadlines extracted from reels (e.g. "this Friday").
              </p>
              <select
                id="pref-timezone"
                value={timezone}
                onChange={handleTimezoneChange}
                className="w-full mt-1 px-3.5 py-2.5 bg-[#fbfbfa] border border-gray-200 rounded-xl text-sm font-semibold text-[#1a1a1a] focus:outline-none focus:border-[#114b43] focus:ring-1 focus:ring-[#114b43]"
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST) — Default</option>
                <option value="UTC (Coordinated Universal Time)">UTC (Universal)</option>
                <option value="America/New_York (EST/EDT)">America/New_York (EST)</option>
                <option value="Europe/London (GMT/BST)">Europe/London (GMT)</option>
              </select>
            </div>

            {/* Calendar Export Format */}
            <div className="space-y-1.5 pt-2 border-t border-gray-50">
              <label htmlFor="pref-export" className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Calendar Integration
              </label>
              <p className="text-xs text-gray-500">
                Standard file format for confirmed opportunity deadlines.
              </p>
              <select
                id="pref-export"
                value={exportFormat}
                onChange={handleExportFormatChange}
                className="w-full mt-1 px-3.5 py-2.5 bg-[#fbfbfa] border border-gray-200 rounded-xl text-sm font-semibold text-[#1a1a1a] focus:outline-none focus:border-[#114b43] focus:ring-1 focus:ring-[#114b43]"
              >
                <option value="iCalendar (.ics)">iCalendar (.ics) format</option>
                <option value="Google Calendar Link">Google Calendar URL Link</option>
              </select>
            </div>

            {/* Auto Verification Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <div className="space-y-0.5 pr-4">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Instant Deep Research
                </span>
                <span className="block text-xs text-gray-500">
                  Trigger automated web verification as soon as a reel transcript is saved.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoResearch}
                onClick={handleToggleAutoResearch}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoResearch ? 'bg-[#114b43]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    autoResearch ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Security & Authentication Info */}
        <section className="bg-white rounded-[2rem] p-6 sm:p-7 border border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-5">
              <Shield size={18} className="text-[#114b43]" />
              <h2 className="font-display text-xl uppercase tracking-wide text-[#1a1a1a]">
                Security & Session
              </h2>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F3E9]/50 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1a1a1a]">Auth Token Active</div>
                    <div className="text-[11px] text-gray-500">Secure JWT Bearer Session</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                  Encrypted
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F3E9]/50 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#114b43]/10 text-[#114b43] flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1a1a1a]">Automatic Refresh</div>
                    <div className="text-[11px] text-gray-500">Session kept alive securely</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#114b43] bg-teal-50 px-2 py-1 rounded-md">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F3E9]/50 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1a1a1a]">Opportunity Retention</div>
                    <div className="text-[11px] text-gray-500">Per-user isolated vault data</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-1 rounded-md">
                  Private
                </span>
              </div>
            </div>
          </div>

          {/* Sign Out Card Button */}
          <div className="pt-4 border-t border-gray-100">
            {!showLogoutConfirm ? (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out of ReelVault</span>
              </button>
            ) : (
              <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-red-900 text-center">
                  Are you sure you want to end your current session?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-60"
                  >
                    {isLoggingOut ? 'Signing out...' : 'Yes, Sign Out'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    disabled={isLoggingOut}
                    className="flex-1 py-2 px-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Quick Navigation Footer Banner */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4f954] text-[#114b43] flex items-center justify-center font-bold">
            <Bookmark size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1a1a1a]">Ready to save another opportunity?</h4>
            <p className="text-xs text-gray-500 font-medium">Paste Instagram, YouTube, or TikTok short links anytime.</p>
          </div>
        </div>

        <Link
          to="/home"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#114b43] text-white hover:bg-[#0e3f38] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
        >
          <span>Save a Reel</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
