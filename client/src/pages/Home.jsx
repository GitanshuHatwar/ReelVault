import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, AlertCircle, Link as LinkIcon } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  
  // URL mock states
  const [urlError, setUrlError] = useState(''); // 'empty', 'invalid', 'unsupported', 'private', ''
  
  const navigate = useNavigate();

  const recentAnalyses = [
    {
      id: 'mock-1',
      title: 'AICTE Pragati Scholarship',
      category: 'Scholarship',
      status: 'Partially Supported',
      date: 'Analyzed recently'
    },
    {
      id: 'mock-2',
      title: 'Google Summer of Code',
      category: 'Program / Internship',
      status: 'Supported',
      date: 'Analyzed recently'
    },
    {
      id: 'mock-3',
      title: '₹25,000 Government Student Grant',
      category: 'Scheme',
      status: 'Contradicted',
      date: 'Analyzed recently'
    }
  ];

  const getVerificationColor = (status) => {
    switch(status) {
      case 'Supported': return 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]';
      case 'Partially Supported': return 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]';
      case 'Contradicted': return 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';
      case 'Insufficient Evidence': return 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Supported': return <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>;
      case 'Partially Supported': return <span className="w-3 h-3 rounded-full border-[1.5px] border-current flex items-center justify-center text-[7px] font-black pb-[0.5px]">!</span>;
      case 'Contradicted': return <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>;
      case 'Insufficient Evidence': return <div className="w-2 h-2 rounded-full bg-gray-400"></div>;
      default: return null;
    }
  };

  const validateUrl = (url) => {
    if (!url.trim()) return 'empty';
    if (!/^https?:\/\//i.test(url)) return 'invalid';
    
    const isSupported = /instagram\.com|youtube\.com|youtu\.be|facebook\.com/i.test(url);
    if (!isSupported) return 'unsupported';
    
    // Mock random private video state (for UI testing)
    if (url.includes('private')) return 'private';
    
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const error = validateUrl(inputValue);
    setUrlError(error);
    if (error) return;
    
    // Route to new Processing experience, passing the URL
    navigate(`/processing?url=${encodeURIComponent(inputValue)}`);
  };

  return (
    <div className="w-full space-y-12 pb-8">
      {/* Header */}
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-[#1a1a1a] mb-3">
          VERIFY AN<br className="sm:hidden" /> OPPORTUNITY
        </h1>
        <p className="text-gray-600 font-medium text-lg">
          Paste the Reel or Short where you found the opportunity. ReelVault will check its claims against reliable sources.
        </p>
      </header>

      {/* Main Submission Workspace */}
      <section className="w-full">
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                    onChange={(e) => { setInputValue(e.target.value); setUrlError(''); }}
                    className={`w-full pl-12 pr-5 py-4 bg-[#fdfdfc] border ${urlError && urlError !== 'empty' ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#114b43] focus:ring-[#114b43]'} rounded-2xl text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors text-base font-medium`}
                  />
                </div>
                
                {/* Error States */}
                {urlError === 'invalid' && (
                  <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium mt-2 ml-1">
                    <AlertCircle size={14} /> Enter a valid Reel or Short URL.
                  </div>
                )}
                {urlError === 'unsupported' && (
                  <div className="flex items-center gap-1.5 text-amber-600 text-sm font-medium mt-2 ml-1">
                    <AlertCircle size={14} /> This link isn't supported yet.
                  </div>
                )}
                {urlError === 'private' && (
                  <div className="flex items-center gap-1.5 text-amber-600 text-sm font-medium mt-2 ml-1">
                    <AlertCircle size={14} /> We couldn't access this content. It may be private, deleted, or unavailable.
                  </div>
                )}

                <p className="text-xs text-gray-400 font-medium pt-1 ml-1">
                  Paste a public Reel or Short link.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-[#d4f954] text-[#1a1a1a] hover:bg-[#c5f042] hover:shadow-md font-bold py-4 md:py-4.5 rounded-xl text-lg flex items-center justify-center gap-2 transition-all"
              >
                ANALYZE & VERIFY <ArrowRight size={20} strokeWidth={2.5} />
              </Button>
            </div>
          </form>
        </div>

        {/* Small explanation / Trust message */}
        <div className="mt-8 flex flex-col items-center">
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex-wrap justify-center text-center">
            <span>Reel</span>
            <ArrowRight size={14} className="text-gray-300" />
            <span>Claims</span>
            <ArrowRight size={14} className="text-gray-300" />
            <span>Official Sources</span>
            <ArrowRight size={14} className="text-gray-300" />
            <span className="text-[#114b43]">Verdict</span>
          </div>
          
          <div className="flex items-center gap-2.5 text-sm text-[#114b43] font-bold bg-[#114b43]/5 px-5 py-2.5 rounded-full border border-[#114b43]/10">
            <ShieldCheck size={18} className="text-[#114b43]" />
            ReelVault shows the evidence behind each verdict.
          </div>
        </div>
      </section>

      {/* Recent Analyses */}
      <section className="pt-8 border-t border-black/5">
        <div className="mb-6">
          <h2 className="text-sm font-display uppercase tracking-widest text-gray-400">Recent Analyses</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {recentAnalyses.map(analysis => (
            <div 
              key={analysis.id} 
              onClick={() => navigate(`/results/${analysis.id}`)}
              className="bg-white rounded-[1.25rem] p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group flex flex-col h-full min-h-[160px]"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {analysis.category}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {analysis.date}
                  </span>
                </div>
                <h3 className="text-[#1a1a1a] font-bold text-base mb-4 line-clamp-2 leading-snug">
                  {analysis.title}
                </h3>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between">
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${getVerificationColor(analysis.status)}`}>
                    {getStatusIcon(analysis.status)}
                    {analysis.status}
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-[#114b43] transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
