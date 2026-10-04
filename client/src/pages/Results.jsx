import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockAnalysis } from '../data/mockAnalysis';
import { 
  Check, AlertTriangle, ShieldCheck, ExternalLink, Bookmark, 
  Bell, Clock, Link as LinkIcon, AlertCircle, Info, ChevronRight, X, CheckSquare
} from 'lucide-react';

import VerificationBadge from '../components/ui/VerificationBadge';
import ReminderModal from '../components/ui/ReminderModal';
import AddTaskModal from '../components/ui/AddTaskModal';
import { useVault } from '../hooks/useVault';
import { formatDate, isExpired, isUnknown } from '../utils/dateUtils';

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------------------------

export default function Results() {
  const { id } = useParams();
  const data = mockAnalysis; // In reality, fetch by ID
  
  if (id !== data.id) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in">
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <h2 className="font-display text-2xl mb-2 text-[#1a1a1a]">Analysis not found</h2>
        <p className="text-gray-500 mb-8 max-w-md">The verification result you are looking for does not exist, has expired, or the URL is incorrect.</p>
        <Link to="/home" className="bg-[#114b43] text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-[#0d3b34] transition-all shadow-sm">
          RETURN TO HOME
        </Link>
      </div>
    );
  }

  const { isSaved, saveToVault, removeFromVault, addTask, updateReminderDate, getOpp } = useVault();
  const savedState = isSaved(data.id);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const expired = isExpired(data.verifiedDetails.deadline);
  const unknown = isUnknown(data.verifiedDetails.deadline);

  const handleSaveToggle = () => {
    if (savedState) {
      removeFromVault(data.id);
    } else {
      saveToVault({
        id: data.id,
        name: data.opportunity,
        organization: data.organization,
        category: data.category,
        verdict: data.overallVerdict,
        deadline: data.verifiedDetails.deadline,
        deadlineUrgency: 'CLOSING SOON',
        reminderDate: null
      });
    }
  };

  return (
    <div className="w-full pb-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="mb-10 sm:mb-12">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#114b43]" />
          Verification Result
        </h2>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-[#1a1a1a] uppercase mb-4 leading-none">
          {data.opportunity}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500 mb-6">
          <span className="font-bold text-gray-700">{data.category}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{data.organization}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1"><Clock size={14} /> {data.lastChecked}</span>
        </div>
        
        <VerificationBadge status={data.overallVerdict} className="text-sm px-4 py-2" />
      </header>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Main Column (Left) */}
        <div className="flex-1 space-y-12">
          
          {/* Opportunity Summary */}
          <section>
            <h3 className="font-display text-xl uppercase tracking-wide text-[#1a1a1a] mb-5">
              What this opportunity actually is
            </h3>
            <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <p className="text-gray-600 font-medium leading-relaxed">
                {data.summary.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Organization</p>
                  <p className="text-sm font-bold text-[#1a1a1a]">{data.organization}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Type</p>
                  <p className="text-sm font-bold text-[#1a1a1a]">{data.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">For</p>
                  <p className="text-sm font-bold text-[#1a1a1a]">{data.summary.forWhom}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status</p>
                  <p className="text-sm font-bold text-[#114b43] bg-[#114b43]/5 inline-flex px-2 py-0.5 rounded">{data.summary.status}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Claims Checked */}
          <section>
            <h3 className="font-display text-2xl uppercase tracking-wide text-[#1a1a1a] mb-6">
              Claims Checked
            </h3>
            <div className="space-y-6">
              {data.claims.map(claim => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          </section>

          {/* Verified Opportunity Details */}
          <section>
            <h3 className="font-display text-2xl uppercase tracking-wide text-[#1a1a1a] mb-6">
              Verified Opportunity Details
            </h3>
            <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                
                <div className="py-4 flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-full sm:w-1/3 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1 sm:mb-0 pt-0.5">Eligibility</div>
                  <div className="w-full sm:w-2/3 text-sm font-medium text-[#1a1a1a] leading-relaxed">{data.verifiedDetails.eligibility}</div>
                </div>
                
                <div className="py-4 flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-full sm:w-1/3 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1 sm:mb-0 pt-0.5">Benefit</div>
                  <div className="w-full sm:w-2/3 text-sm font-bold text-[#114b43]">{data.verifiedDetails.benefit}</div>
                </div>
                
                <div className="py-4 flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-full sm:w-1/3 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1 sm:mb-0 pt-0.5">Deadline</div>
                  <div className="w-full sm:w-2/3 text-sm font-bold text-[#1a1a1a]">{formatDate(data.verifiedDetails.deadline)}</div>
                </div>
                
                <div className="py-4 flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-full sm:w-1/3 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1 sm:mb-0 pt-0.5">Required Documents</div>
                  <div className="w-full sm:w-2/3 text-sm font-medium text-gray-600">
                    <ul className="list-disc pl-4 space-y-1">
                      {data.verifiedDetails.requiredDocuments.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="py-4 flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-full sm:w-1/3 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1 sm:mb-0 pt-0.5">Process</div>
                  <div className="w-full sm:w-2/3 text-sm font-medium text-gray-600 leading-relaxed">{data.verifiedDetails.applicationProcess}</div>
                </div>

              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-[#10b981]" />
                Verified from official sources
              </div>
            </div>
          </section>

          {/* Risk Check */}
          <section>
            <h3 className="font-display text-xl uppercase tracking-wide text-[#1a1a1a] mb-5">
              Risk Check
            </h3>
            {data.riskSignals.map((risk, idx) => (
              <div key={idx} className={`rounded-[1.5rem] p-6 sm:p-8 border ${risk.level === 'SAFE' ? 'bg-[#ecfdf5]/30 border-[#ecfdf5]' : 'bg-[#fef2f2] border-[#fecaca]'}`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${risk.level === 'SAFE' ? 'bg-[#10b981]/10' : 'bg-red-100'}`}>
                    {risk.level === 'SAFE' ? <ShieldCheck size={20} className="text-[#10b981]" /> : <AlertTriangle size={20} className="text-red-600" />}
                  </div>
                  <div>
                    <h4 className={`text-base font-bold mb-1 ${risk.level === 'SAFE' ? 'text-[#059669]' : 'text-red-700'}`}>
                      {risk.message}
                    </h4>
                    <p className={`text-sm font-medium leading-relaxed ${risk.level === 'SAFE' ? 'text-[#059669]/80' : 'text-red-700/80'}`}>
                      {risk.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </section>

        </div>

        {/* Side Column (Right on Desktop, Bottom on Mobile) */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-8 lg:sticky lg:top-24 h-max pb-8 lg:pb-0">
          
          {/* Source Reel Context */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Source Reel</h4>
            <div className="flex items-center gap-3 bg-[#F5F3E9] p-3 rounded-xl overflow-hidden">
              <LinkIcon size={16} className="text-[#114b43] shrink-0" />
              <span className="text-xs font-bold text-[#114b43] truncate">{data.sourceUrl}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm space-y-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Actions</h4>
            
            <button 
              onClick={handleSaveToggle}
              className={`w-full py-4 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all shadow-sm ${
                savedState 
                  ? 'bg-gray-100 text-[#1a1a1a] hover:bg-gray-200' 
                  : 'bg-[#114b43] text-white hover:bg-[#0d3b34]'
              }`}
            >
              {savedState ? (
                <><Check size={18} className="text-[#10b981]" /> SAVED TO VAULT</>
              ) : (
                <><Bookmark size={18} /> SAVE TO VAULT</>
              )}
            </button>
            
            {unknown ? (
              <div className="w-full py-4 bg-gray-50 text-gray-400 text-sm font-bold flex flex-col items-center justify-center gap-1 rounded-xl shadow-inner border border-gray-100">
                <span className="flex items-center gap-1"><Bell size={16} /> REMINDER UNAVAILABLE</span>
                <span className="text-[10px] font-medium normal-case tracking-normal opacity-80">Set a reminder after a deadline is verified.</span>
              </div>
            ) : expired ? (
              <div className="w-full py-4 bg-gray-50 text-gray-400 text-sm font-bold flex flex-col items-center justify-center gap-1 rounded-xl shadow-inner border border-gray-100">
                <span className="flex items-center gap-1"><Bell size={16} /> REMINDER UNAVAILABLE</span>
                <span className="text-[10px] font-medium normal-case tracking-normal opacity-80">Deadline passed on {formatDate(data.verifiedDetails.deadline)}.</span>
              </div>
            ) : (
              <button 
                onClick={() => setIsReminderOpen(true)}
                className="w-full py-4 bg-[#F5F3E9] text-[#1a1a1a] hover:bg-[#e8e6dc] text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all"
              >
                <Bell size={18} className="text-[#114b43]" /> SET REMINDER
              </button>
            )}
            
            {savedState && (
              expired ? (
                <div className="w-full py-4 bg-gray-50 text-gray-400 text-sm font-bold flex flex-col items-center justify-center gap-1 rounded-xl shadow-inner border border-gray-100">
                  <span className="flex items-center gap-1"><CheckSquare size={16} /> TASKS CLOSED</span>
                  <span className="text-[10px] font-medium normal-case tracking-normal opacity-80">Opportunity is expired.</span>
                </div>
              ) : (
                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="w-full py-4 bg-[#F5F3E9] text-[#1a1a1a] hover:bg-[#e8e6dc] text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all"
                >
                  <CheckSquare size={18} className="text-[#114b43]" /> ADD TASK
                </button>
              )
            )}
            
            <div className="pt-2 border-t border-gray-100">
              <a 
                href={data.verifiedDetails.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 bg-white border border-gray-200 text-[#1a1a1a] hover:bg-gray-50 hover:border-gray-300 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all"
              >
                VISIT OFFICIAL SOURCE <ExternalLink size={16} className="text-gray-400" />
              </a>
            </div>
          </div>

        </div>
      </div>

      <ReminderModal 
        isOpen={isReminderOpen} 
        onClose={(val) => {
          if (val === 'REMOVE') {
             updateReminderDate(data.id, null);
          } else if (val) {
            if (savedState) {
              updateReminderDate(data.id, val);
            } else {
              saveToVault({
                id: data.id,
                name: data.opportunity,
                organization: data.organization,
                category: data.category,
                verdict: data.overallVerdict,
                deadline: data.verifiedDetails.deadline,
                deadlineUrgency: 'CLOSING SOON',
                reminderDate: val
              });
            }
          }
          setIsReminderOpen(false);
        }}
        initialDate={savedState ? (getOpp(data.id)?.reminderDate || '') : ''} 
        deadline={data.verifiedDetails.deadline}
      />
      <AddTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onAdd={(task) => addTask(data.id, task)} 
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// CLAIM CARD COMPONENT
// ----------------------------------------------------------------------

function ClaimCard({ claim }) {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
        <h4 className="text-lg font-bold text-[#1a1a1a] leading-snug">
          "{claim.originalClaim}"
        </h4>
        <VerificationBadge status={claim.verdict} className="shrink-0" />
      </div>

      <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100 text-sm text-gray-600 leading-relaxed">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-gray-400 shrink-0 mt-0.5" />
          <p>{claim.evidence}</p>
        </div>
      </div>

      {claim.correctedInformation && (
        <div className="flex items-start gap-3 mt-1">
          <Check size={18} className="text-[#10b981] shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-[#1a1a1a]">Fact: <span className="font-medium text-gray-600">{claim.correctedInformation}</span></p>
        </div>
      )}

      {claim.source && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Source</span>
            <span className="text-xs font-bold text-[#114b43] bg-[#114b43]/5 px-2 py-0.5 rounded">{claim.source.name}</span>
          </div>
          {claim.source.url !== '#' && (
             <a href={claim.source.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#114b43] transition-colors">
               <ExternalLink size={14} />
             </a>
          )}
        </div>
      )}
    </div>
  );
}
