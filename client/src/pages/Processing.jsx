import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2, Link as LinkIcon, ArrowRight, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Processing() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url') || 'https://www.instagram.com/reel/unknown';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  // The analysis steps mapping to ReelVault verification pipeline
  const stages = [
    { title: "Reading the Reel", description: "Understanding the opportunity being discussed." },
    { title: "Extracting claims", description: "Finding amounts, eligibility, deadlines and other checkable claims." },
    { title: "Finding official sources", description: "Looking for authoritative information." },
    { title: "Checking each claim", description: "Comparing the Reel with the available evidence." },
    { title: "Preparing verdict", description: "Organizing the verified opportunity for you." }
  ];

  useEffect(() => {
    // Mock error state if url contains the word 'error'
    if (url.includes('error')) {
      const timer = setTimeout(() => {
        setHasError(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Mock processing progression
    if (currentStep < stages.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1600); // Progress every 1.6 seconds
      return () => clearTimeout(timer);
    } else {
      // Completed, navigate to mock results
      const timer = setTimeout(() => {
        navigate('/results/mock-analysis-1', { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, url, navigate, stages.length]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10 pb-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <header>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-[#1a1a1a] mb-3">
          {hasError ? "WE COULDN'T COMPLETE THIS CHECK." : "CHECKING THE CLAIMS."}
        </h1>
        <p className="text-gray-600 font-medium text-lg">
          {hasError 
            ? "Something went wrong while analyzing this Reel." 
            : "We’re comparing what the Reel says with reliable sources."}
        </p>
      </header>

      {/* Main Processing Container */}
      <section className="bg-white rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100">
        
        {/* Context: Submitted URL */}
        <div className="flex items-center gap-3 bg-[#fdfdfc] border border-gray-100 p-4 rounded-2xl mb-10">
          <div className="w-10 h-10 bg-[#F5F3E9] rounded-xl flex items-center justify-center shrink-0">
            <LinkIcon size={18} className="text-[#114b43]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Analyzing URL</p>
            <p className="text-sm font-medium text-[#1a1a1a] truncate">{url}</p>
          </div>
        </div>

        {hasError ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-[1.25rem] flex items-center justify-center border border-red-100">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm pt-2">
              <Button onClick={() => navigate('/home')} className="flex-1 py-4 bg-[#F5F3E9] text-[#1a1a1a] hover:bg-[#e8e6dc] rounded-xl font-bold shadow-sm">
                Back to Home
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1 py-4 bg-[#114b43] text-white hover:bg-[#0d3b34] rounded-xl font-bold shadow-sm">
                Try again
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 sm:px-4">
            {stages.map((stage, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isPending = index > currentStep;
              
              return (
                <div key={index} className={`flex items-start gap-5 transition-all duration-500 ${isPending ? 'opacity-30 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 shadow-sm ${
                    isCompleted ? 'bg-[#114b43] text-[#d4f954]' :
                    isActive ? 'bg-[#d4f954] text-[#1a1a1a]' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <Check size={16} strokeWidth={3} /> :
                     isActive ? <Loader2 size={16} className="animate-spin" strokeWidth={2.5} /> :
                     <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                  </div>
                  <div>
                    <h3 className={`text-lg transition-colors duration-300 ${
                      isCompleted ? 'text-gray-800 font-bold' :
                      isActive ? 'text-[#1a1a1a] font-bold' :
                      'text-gray-500 font-medium'
                    }`}>
                      {stage.title}
                    </h3>
                    {(isActive || isCompleted) && (
                      <p className="text-sm text-gray-500 font-medium mt-1 animate-in fade-in duration-300">
                        {stage.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Visual Transformation */}
      {!hasError && (
        <div className="flex flex-col items-center pt-4">
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex-wrap justify-center text-center transition-colors duration-300">
            <span className={currentStep >= 0 ? 'text-[#114b43]' : 'text-gray-300'}>Reel</span>
            <ArrowRight size={14} className={currentStep >= 1 ? 'text-[#114b43]/50' : 'text-gray-200'} />
            <span className={currentStep >= 1 ? 'text-[#114b43]' : 'text-gray-300'}>Claims</span>
            <ArrowRight size={14} className={currentStep >= 2 ? 'text-[#114b43]/50' : 'text-gray-200'} />
            <span className={currentStep >= 2 ? 'text-[#114b43]' : 'text-gray-300'}>Sources</span>
            <ArrowRight size={14} className={currentStep >= 4 ? 'text-[#114b43]/50' : 'text-gray-200'} />
            <span className={currentStep >= 4 ? 'text-[#114b43]' : 'text-gray-300'}>Verdict</span>
          </div>
        </div>
      )}
    </div>
  );
}
