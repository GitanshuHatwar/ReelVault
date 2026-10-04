import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  X,
  Bookmark,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import SavedCalendar, { dateKey, formatReadableDate } from './SavedCalendar';
import { api } from '../../services/api';

export default function CalendarModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');

  // Fetch reels when modal is opened
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    api.listReels()
      .then((data) => {
        if (active) setReels(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setReels([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter reels for selected day
  const selectedReels = useMemo(() => {
    if (!selectedKey) return [];
    return reels.filter((r) => dateKey(r.created_at) === selectedKey);
  }, [reels, selectedKey]);

  if (!isOpen) return null;

  const handleOpenVaultForDate = (dayKey) => {
    onClose();
    navigate('/vault');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl bg-[#F5F3E9] rounded-[2rem] shadow-2xl border border-black/10 overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#114b43] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4f954] text-[#114b43] flex items-center justify-center shadow-xs">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-white leading-none">
                Saved Reels Calendar
              </h2>
              <p className="text-xs text-gray-300 font-medium mt-1">
                Timeline of opportunities and content saved in your vault
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close calendar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Calendar Widget */}
          <SavedCalendar
            reels={reels}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />

          {/* Selected Date Reel Previews */}
          {selectedKey ? (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#114b43]">
                  {formatReadableDate(selectedKey)}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {selectedReels.length === 1
                    ? '1 reel saved'
                    : `${selectedReels.length} reels saved`}
                </span>
              </div>

              {selectedReels.length === 0 ? (
                <p className="text-xs text-gray-500 font-medium py-2">
                  No reels were saved on this specific date. Select a highlighted date above to view saved opportunities.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedReels.map((reel) => (
                    <div
                      key={reel.reel_id}
                      className="p-3 rounded-xl bg-[#F5F3E9]/60 hover:bg-[#F5F3E9] border border-gray-100 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-[#114b43]/10 text-[#114b43]">
                            {reel.platform || 'Reel'}
                          </span>
                          {reel.author && (
                            <span className="text-[11px] text-gray-500 font-medium truncate">
                              @{reel.author}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#1a1a1a] line-clamp-1">
                          {reel.title || 'Untitled Reel'}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenVaultForDate(selectedKey)}
                        className="text-xs font-bold text-[#114b43] hover:underline shrink-0 flex items-center gap-1 mt-1"
                      >
                        <span>View</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/80 rounded-2xl p-4 border border-dashed border-gray-200 text-center">
              <p className="text-xs text-gray-500 font-medium">
                💡 Click on any highlighted date in lime to see reels and opportunities saved on that day.
              </p>
            </div>
          )}

          {/* Quick Footer Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500 font-medium">
              Total reels in vault: <strong className="text-[#1a1a1a]">{reels.length}</strong>
            </span>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/vault');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#114b43] text-white hover:bg-[#0d3b34] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Bookmark size={14} />
              <span>Open Vault</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
