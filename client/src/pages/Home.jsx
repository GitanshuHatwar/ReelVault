import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, CalendarDays, CheckCircle2, EyeOff, Link as LinkIcon, XCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { api, ApiError } from '../services/api';
import { useLanguage } from '../preferences/LanguageContext';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [urlError, setUrlError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentReels, setRecentReels] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [hiddenRecentIds, setHiddenRecentIds] = useState(() => new Set());
  const navigate = useNavigate();
  const { language } = useLanguage();

  const loadRecent = () => {
    api.listReels()
      .then((reels) => setRecentReels(reels.slice(0, 5)))
      .catch(() => setRecentReels([]));
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const validateUrl = (url) => {
    if (!url.trim()) return 'empty';
    if (!/^https?:\/\//i.test(url)) return 'invalid';
    if (!/instagram\.com|youtube\.com|youtu\.be|tiktok\.com/i.test(url)) return 'unsupported';
    return '';
  };

  const visibleRecentReels = recentReels
    .filter((reel) => !hiddenRecentIds.has(reel.reel_id))
    .filter((reel) => {
      if (dateFilter === 'all') return true;
      const createdAt = new Date(reel.created_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateFilter === 'today') return createdAt >= today;
      if (dateFilter === '7days') return createdAt >= new Date(today.getTime() - 6 * 86400000);
      if (dateFilter === '30days') return createdAt >= new Date(today.getTime() - 29 * 86400000);
      if (dateFilter === 'custom-start' && customStart) return createdAt >= new Date(`${customStart}T00:00:00`);
      if (dateFilter === 'custom-end' && customEnd) return createdAt <= new Date(`${customEnd}T23:59:59`);
      if (dateFilter === 'custom-range' && customStart && customEnd) {
        return createdAt >= new Date(`${customStart}T00:00:00`) && createdAt <= new Date(`${customEnd}T23:59:59`);
      }
      return true;
    })
    .sort((a, b) => {
      const difference = new Date(a.created_at) - new Date(b.created_at);
      return sortOrder === 'oldest' ? difference : -difference;
    });

  const hideFromRecent = (reelId) => {
    setHiddenRecentIds((current) => new Set([...current, reelId]));
  };

  const transcriptionState = (reel) => {
    const status = reel.transcript_status || (reel.transcript ? 'verified' : reel.caption ? 'ambiguous' : 'unavailable');
    if (status === 'verified') return { label: 'Transcript verified', Icon: CheckCircle2, className: 'text-emerald-600', title: 'A transcript was found.' };
    if (status === 'ambiguous') return { label: 'Transcript ambiguous', Icon: CheckCircle2, className: 'text-amber-500', title: 'Only partial or caption text was available.' };
    return { label: 'Cannot transcribe this type of content', Icon: XCircle, className: 'text-red-500', title: 'This type of content cannot be transcribed.' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateUrl(inputValue);
    setUrlError(error);
    if (error) return;
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await api.saveReel(inputValue.trim());
      setInputValue('');
      loadRecent();
      navigate('/vault');
    } catch (requestError) {
      setSubmitError(requestError instanceof ApiError ? requestError.message : 'Unable to save this reel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-12 pb-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-[#1a1a1a] mb-3">
          SAVE A REEL
        </h1>
        <p className="text-gray-600 font-medium text-lg">
          Paste a public Instagram, YouTube, or TikTok link. We fetch the title and transcript and store it in your vault.
        </p>
      </header>

      <section className="w-full">
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                REEL / SHORT LINK
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <LinkIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/reel/..."
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setUrlError(''); setSubmitError(''); }}
                  className={`w-full pl-12 pr-5 py-4 bg-[#fdfdfc] border ${urlError && urlError !== 'empty' ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#114b43] focus:ring-[#114b43]'} rounded-2xl text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors text-base font-medium`}
                />
              </div>
              {urlError === 'invalid' && (
                <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium mt-2 ml-1">
                  <AlertCircle size={14} /> Enter a valid URL.
                </div>
              )}
              {urlError === 'unsupported' && (
                <div className="flex items-center gap-1.5 text-amber-600 text-sm font-medium mt-2 ml-1">
                  <AlertCircle size={14} /> This link isn't supported yet.
                </div>
              )}
              {submitError && (
                <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium mt-2 ml-1">
                  <AlertCircle size={14} /> {submitError}
                </div>
              )}
            </div>

            <Button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-[#d4f954] text-[#1a1a1a] hover:bg-[#c5f042] hover:shadow-md font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isSubmitting ? 'SAVING REEL…' : 'SAVE TRANSCRIPT'} <ArrowRight size={20} strokeWidth={2.5} />
            </Button>
          </form>
        </div>
      </section>

      <section className="pt-8 border-t border-black/5">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-display uppercase tracking-widest text-gray-400">Recent</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest saved reels, sorted by date.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="recent-date-filter">Filter recent reels by date</label>
            <div className="relative">
              <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <select id="recent-date-filter" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm font-semibold text-gray-700 focus:border-[#114b43] focus:outline-none focus:ring-1 focus:ring-[#114b43]">
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="custom-range">Custom range</option>
              </select>
            </div>
            <label className="sr-only" htmlFor="recent-sort">Sort recent reels</label>
            <select id="recent-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 focus:border-[#114b43] focus:outline-none focus:ring-1 focus:ring-[#114b43]">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
        {dateFilter === 'custom-range' && (
          <div className="flex flex-wrap gap-3 mb-6 rounded-2xl bg-[#f4f7f2] p-4">
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-gray-500">From<input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 normal-case tracking-normal" /></label>
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-gray-500">To<input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 normal-case tracking-normal" /></label>
          </div>
        )}
        {recentReels.length === 0 ? (
          <p className="text-gray-500 font-medium">No reels yet. Paste a link above to get started.</p>
        ) : visibleRecentReels.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-gray-500 font-medium">No recent reels match this date filter.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {visibleRecentReels.map((reel) => {
              const verification = transcriptionState(reel);
              const VerificationIcon = verification.Icon;
              return (
                <article key={reel.reel_id} className="bg-white rounded-[1.25rem] p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-gray-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{reel.platform}</span>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 text-[10px] font-bold ${verification.className}`} title={verification.title}>
                        <VerificationIcon size={15} aria-hidden="true" />
                        <span className="sr-only">{verification.label}</span>
                        <span className="text-gray-400 font-semibold ml-1">{new Date(reel.created_at).toLocaleDateString()}</span>
                      </div>
                      <button type="button" onClick={() => hideFromRecent(reel.reel_id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#114b43]" aria-label={`Remove ${reel.title} from recent reels`} title="Remove from recent">
                        <EyeOff size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <button type="button" onClick={() => navigate('/vault')} className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#114b43] focus-visible:ring-offset-2 rounded-lg">
                    <h3 className="text-[#1a1a1a] font-bold text-base mb-2 line-clamp-2 leading-snug">{reel.title}</h3>
                    {reel.transcript_status === 'verified' && reel.analysis?.summary ? (
                      <><p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43] mb-1">{language === 'english' ? 'Reel summary' : 'Original transcript'}</p><p className="text-sm text-gray-600 line-clamp-3 leading-6">{language === 'english' ? reel.analysis.summary : reel.transcript}</p></>
                    ) : <p className="text-sm text-gray-500 line-clamp-3">{language === 'native' ? (reel.transcript || reel.caption || 'This type of content cannot be transcribed.') : 'English transcription is unavailable for this reel.'}</p>}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
