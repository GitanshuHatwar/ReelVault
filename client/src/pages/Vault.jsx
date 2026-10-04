import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bookmark, Trash2, Search, AlertCircle } from 'lucide-react';
import { api, ApiError } from '../services/api';

export default function Vault() {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState('');
  const [openId, setOpenId] = useState(null);

  const loadReels = () => {
    api.listReels()
      .then(setReels)
      .catch((error) => {
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load your vault.');
        setReels([]);
      });
  };

  useEffect(() => {
    loadReels();
  }, []);

  const filtered = reels.filter((reel) => {
    const q = searchQuery.toLowerCase();
    return (
      reel.title.toLowerCase().includes(q) ||
      (reel.transcript || '').toLowerCase().includes(q) ||
      (reel.author || '').toLowerCase().includes(q)
    );
  });

  const handleDelete = async (reelId) => {
    try {
      await api.deleteReel(reelId);
      setReels((current) => current.filter((reel) => reel.reel_id !== reelId));
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : 'Could not delete this reel.');
    }
  };

  return (
    <div className="w-full pb-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-[#1a1a1a] uppercase mb-3">
          YOUR VAULT
        </h1>
        <p className="text-gray-600 font-medium text-lg">
          Every reel you saved, with its real title and transcript.
        </p>
      </header>

      {loadError && (
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-4">
          <AlertCircle size={16} /> {loadError}
        </div>
      )}

      {reels.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-10 sm:p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-[#F5F3E9] rounded-3xl flex items-center justify-center mb-6">
            <Bookmark size={32} className="text-[#114b43]" />
          </div>
          <h2 className="font-display text-2xl tracking-wide text-[#1a1a1a] uppercase mb-2">YOUR VAULT IS EMPTY</h2>
          <p className="text-gray-500 font-medium mb-8 max-w-sm">
            Paste a reel link on Home and the transcript will show up here.
          </p>
          <button onClick={() => navigate('/home')} className="bg-[#114b43] text-white hover:bg-[#0d3b34] font-bold py-4 px-8 rounded-xl shadow-sm flex items-center gap-2">
            SAVE A REEL <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search titles or transcripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#114b43] focus:ring-1 focus:ring-[#114b43]"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-500 font-medium">No reels match that search.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((reel) => {
                const open = openId === reel.reel_id;
                return (
                  <article key={reel.reel_id} className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                          {reel.platform}{reel.author ? ` · ${reel.author}` : ''}
                        </div>
                        <h3 className="text-[#1a1a1a] font-bold text-xl leading-snug">{reel.title}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(reel.reel_id)}
                        className="text-gray-300 hover:text-red-500 p-1"
                        title="Remove from vault"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className={`text-sm text-gray-600 whitespace-pre-wrap ${open ? '' : 'line-clamp-4'}`}>
                      {reel.transcript || reel.caption || 'No transcript available.'}
                    </p>
                    {(reel.transcript || reel.caption) && (
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : reel.reel_id)}
                        className="mt-3 text-xs font-bold uppercase tracking-widest text-[#114b43]"
                      >
                        {open ? 'Show less' : 'Show full transcript'}
                      </button>
                    )}
                    <a
                      href={reel.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#114b43]"
                    >
                      Open original
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
