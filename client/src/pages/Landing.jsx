import { Link } from 'react-router-dom';
import { Play, Link as LinkIcon, ScanSearch, Archive, Check } from 'lucide-react';

export default function Landing() {
  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F5F3E9] text-[#1a1a1a] font-sans selection:bg-[#d4f954]/50 overflow-x-hidden">
      {/* Navigation */}
      <div className="p-4 md:p-6 sticky top-0 z-50">
        <header className="max-w-[1400px] 2xl:max-w-[1600px] w-full mx-auto bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 md:py-4 flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-black/5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#114b43] rounded-full flex items-center justify-center">
              <Play className="text-[#d4f954] w-4 h-4 md:w-5 md:h-5 ml-0.5" fill="currentColor" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl md:text-2xl tracking-wide uppercase mt-1">ReelVault</span>
              <span className="bg-[#d4f954] text-[#114b43] text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">AI</span>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
            <a href="#how-it-works" onClick={scrollToHowItWorks} className="text-sm font-semibold hover:text-[#114b43] transition-colors">
              How it works
            </a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            <Link to="/auth" className="hidden md:block text-sm font-semibold hover:text-[#114b43] transition-colors">
              Log in
            </Link>
            <Link to="/auth" className="bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-2.5 md:py-3 rounded-full hover:bg-black transition-colors">
              Get started
            </Link>
          </div>
        </header>
      </div>

      <main>
        {/* HERO SECTION */}
        <section className="max-w-[1400px] w-full mx-auto px-6 lg:px-16 xl:px-24 pt-4 md:pt-16 pb-20 md:pb-32 flex flex-col lg:flex-row items-center lg:items-start gap-16 lg:gap-12">
          
          {/* LEFT: Copy */}
          <div className="flex-1 w-full lg:max-w-2xl flex flex-col items-start pt-4 lg:pt-8">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="text-[#114b43] text-[10px]">●</span>
              <span className="text-[#114b43] text-xs md:text-sm font-bold tracking-[0.2em] uppercase">AI FACT-CHECK FOR OPPORTUNITY REELS</span>
            </div>

            <h1 className="font-display text-[4.5rem] leading-[0.85] md:text-[6.5rem] lg:text-[7.5rem] md:leading-[0.85] uppercase tracking-wide mb-8">
              <span className="block text-[#1a1a1a]">DON'T APPLY</span>
              <span className="block text-[#1a1a1a]">TO A REEL.</span>
              <span className="block text-[#114b43]">VERIFY IT FIRST.</span>
            </h1>

            <p className="text-base md:text-xl text-gray-700 font-medium leading-relaxed max-w-lg md:max-w-xl mb-10">
              Paste a scholarship, internship or hackathon reel. ReelVault pulls out every claim, checks it against official sources, and tells you what's real, what's off, and what's a scam.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-12">
              <Link to="/home" className="bg-[#d4f954] text-[#1a1a1a] px-8 py-4 md:py-4.5 rounded-full font-bold text-base md:text-lg flex items-center justify-center gap-2 hover:bg-[#c5f042] transition-colors shadow-sm">
                Check a reel <span className="text-xl leading-none font-normal">→</span>
              </Link>
              <a href="#how-it-works" onClick={scrollToHowItWorks} className="bg-white text-[#1a1a1a] px-8 py-4 md:py-4.5 rounded-full font-bold text-base md:text-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                How it works
              </a>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-y-3 gap-x-6">
              <div className="flex items-center gap-2.5">
                <div className="w-[1.125rem] h-[1.125rem] rounded-full bg-[#114b43] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#d4f954]" strokeWidth={4} />
                </div>
                <span className="text-sm font-semibold text-[#1a1a1a]">Checks every claim, not just the vibe</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-[1.125rem] h-[1.125rem] rounded-full bg-[#114b43] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#d4f954]" strokeWidth={4} />
                </div>
                <span className="text-sm font-semibold text-[#1a1a1a]">Official sources only</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-[1.125rem] h-[1.125rem] rounded-full bg-[#114b43] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#d4f954]" strokeWidth={4} />
                </div>
                <span className="text-sm font-semibold text-[#1a1a1a]">Flags scams before you pay</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Mockup */}
          <div className="flex-1 w-full flex justify-center lg:justify-center relative mt-12 lg:mt-0">
            {/* The Reel Container */}
            <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px] relative">
              
              {/* Outer Device Frame */}
              <div className="w-full aspect-[9/16] bg-[#1a1a1a] rounded-[2rem] md:rounded-[2.25rem] p-2 md:p-2.5 shadow-xl relative flex flex-col">
                
                {/* Inner Screen */}
                <div className="bg-[#164E44] flex-1 w-full rounded-[1.5rem] md:rounded-[1.75rem] relative overflow-hidden flex flex-col border border-white/5">
                  
                  {/* Film strip dots top */}
                  <div className="w-full h-8 flex items-center justify-between px-6 bg-[#1a1a1a] shrink-0">
                    {[...Array(7)].map((_, i) => (
                      <div key={`t-${i}`} className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                    ))}
                  </div>

                  {/* Reel Content Wrapper */}
                  <div className="flex-1 flex flex-col justify-between pt-6 pb-6 px-5 relative z-10">
                    
                    {/* Header */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#d4f954] shrink-0"></div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-[11px] md:text-xs leading-tight">@scholarship.daily</span>
                        <span className="text-white/80 text-[9px] md:text-[10px] mt-0.5">Sponsored · 0:48</span>
                      </div>
                    </div>

                    {/* Main Claim */}
                    <div className="font-display uppercase tracking-wide w-full flex flex-col justify-center">
                      <div className="text-white text-[1.75rem] sm:text-[2rem] md:text-[2.25rem] leading-[0.9]">₹80,000 FOR</div>
                      <div className="text-[#d4f954] text-[1.75rem] sm:text-[2rem] md:text-[2.25rem] leading-[0.9] mt-1">EVERY 12TH PASS</div>
                      <div className="text-white text-[1.75rem] sm:text-[2rem] md:text-[2.25rem] leading-[0.9] mt-1">STUDENT</div>
                    </div>

                    {/* Caption */}
                    <div className="">
                      <p className="text-white/90 text-[10px] md:text-xs leading-relaxed max-w-[180px]">
                        Apply before the deadline. Link in bio.
                      </p>
                    </div>

                  </div>

                  {/* Film strip dots bottom */}
                  <div className="w-full h-8 flex items-center justify-between px-6 bg-[#1a1a1a] shrink-0">
                    {[...Array(7)].map((_, i) => (
                      <div key={`b-${i}`} className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overlay Verdict Card */}
              {/* On mobile: negative margin to stack just below with slight overlap, on desktop: absolute positioning */}
              <div className="relative md:absolute mt-[-2rem] md:mt-0 md:-bottom-4 md:-right-8 lg:-right-12 w-[280px] sm:w-[300px] md:w-[320px] bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-5 z-30 mx-auto md:mx-0">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
                  <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] text-gray-500 uppercase">VERDICT</span>
                  <div className="bg-[#fff8ea] border border-[#f5e3c3] text-[#b47a18] px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <span className="w-[12px] h-[12px] rounded-full border-[1.5px] border-current flex items-center justify-center text-[7px] font-black pb-[0.5px]">!</span>
                    Partially Supported
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-[#f8f9f7] p-2 md:p-2.5 rounded-xl flex items-center justify-between border border-black/5">
                    <span className="text-[11px] md:text-xs font-semibold text-[#1a1a1a]">Pays ₹80,000 per year</span>
                    <div className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0 ml-2"></div>
                  </div>
                  <div className="bg-[#f8f9f7] p-2 md:p-2.5 rounded-xl flex items-center justify-between border border-black/5">
                    <span className="text-[11px] md:text-xs font-semibold text-[#1a1a1a] truncate pr-2">Every 12th pass student can ap...</span>
                    <div className="w-2 h-2 rounded-full bg-[#dc2626] shrink-0 ml-2"></div>
                  </div>
                  <div className="bg-[#f8f9f7] p-2 md:p-2.5 rounded-xl flex items-center justify-between border border-black/5">
                    <span className="text-[11px] md:text-xs font-semibold text-[#1a1a1a]">Last date is 31 October</span>
                    <div className="w-2 h-2 rounded-full bg-[#d97706] shrink-0 ml-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="max-w-[1400px] 2xl:max-w-[1600px] w-full mx-auto px-6 py-20 md:py-32">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[#114b43] text-[10px]">●</span>
            <span className="text-[#114b43] text-xs md:text-sm font-bold tracking-[0.2em] uppercase">HOW IT WORKS</span>
          </div>

          <h2 className="font-display text-[3.5rem] md:text-[5.5rem] leading-[0.9] uppercase tracking-wide mb-12 md:mb-16">
            THREE STEPS. ZERO GUESSWORK.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Card 1 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100 relative min-h-[300px] flex flex-col">
              <div className="text-[5rem] md:text-[6rem] font-display text-gray-100 absolute top-4 right-8 leading-none select-none">01</div>
              <div className="w-14 h-14 bg-[#114b43] rounded-2xl flex items-center justify-center mb-16 relative z-10 shadow-sm">
                <LinkIcon className="text-[#d4f954] w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4 relative z-10">Paste the link</h3>
              <p className="text-gray-500 font-medium leading-relaxed relative z-10">
                Paste the public link to the Reel or Short you want to verify.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100 relative min-h-[300px] flex flex-col">
              <div className="text-[5rem] md:text-[6rem] font-display text-gray-100 absolute top-4 right-8 leading-none select-none">02</div>
              <div className="w-14 h-14 bg-[#114b43] rounded-2xl flex items-center justify-center mb-16 relative z-10 shadow-sm">
                <ScanSearch className="text-[#d4f954] w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4 relative z-10">We check every claim</h3>
              <p className="text-gray-500 font-medium leading-relaxed relative z-10">
                Amounts, eligibility, deadlines and fees are each matched against official websites.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100 relative min-h-[300px] flex flex-col">
              <div className="text-[5rem] md:text-[6rem] font-display text-gray-100 absolute top-4 right-8 leading-none select-none">03</div>
              <div className="w-14 h-14 bg-[#114b43] rounded-2xl flex items-center justify-center mb-16 relative z-10 shadow-sm">
                <Archive className="text-[#d4f954] w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4 relative z-10">Save what's real</h3>
              <p className="text-gray-500 font-medium leading-relaxed relative z-10">
                Verified opportunities go into your vault with the real deadline and a reminder.
              </p>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
