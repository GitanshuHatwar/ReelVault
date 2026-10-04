import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle2, Link as LinkIcon, XCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { api, ApiError } from '../services/api';
import { useLanguage } from '../preferences/LanguageContext';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [urlError, setUrlError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentReels, setRecentReels] = useState([]);
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
        <div className="mb-6">
          <h2 className="text-sm font-display uppercase tracking-widest text-gray-400">Recent</h2>
        </div>
        {recentReels.length === 0 ? (
          <p className="text-gray-500 font-medium">No reels yet. Paste a link above to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {recentReels.map((reel) => {
              const verification = transcriptionState(reel);
              const VerificationIcon = verification.Icon;
              return (
              <button
                key={reel.reel_id}
                type="button"
                onClick={() => navigate('/vault')}
                className="text-left bg-white rounded-[1.25rem] p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{reel.platform}</span>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${verification.className}`} title={verification.title}>
                    <VerificationIcon size={15} aria-hidden="true" />
                    <span className="sr-only">{verification.label}</span>
                    <span className="text-gray-400 font-semibold ml-1">{new Date(reel.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <h3 className="text-[#1a1a1a] font-bold text-base mb-2 line-clamp-2 leading-snug">{reel.title}</h3>
                {reel.transcript_status === 'verified' && reel.analysis?.summary ? (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43] mb-1">{language === 'english' ? 'Reel summary' : 'Original transcript'}</p>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-6">{language === 'english' ? reel.analysis.summary : reel.transcript}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 line-clamp-3">{language === 'native' ? (reel.transcript || reel.caption || 'This type of content cannot be transcribed.') : 'English transcription is unavailable for this reel.'}</p>
                )}
              </button>
            );})}
          </div>
        )}
      </section>
    </div>
  );
}
