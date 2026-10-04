import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Bell, ArrowRight, Bookmark, Check, Plus, Calendar, ExternalLink, X } from 'lucide-react';

import VerificationBadge from '../components/ui/VerificationBadge';
import ReminderModal from '../components/ui/ReminderModal';
import AddTaskModal from '../components/ui/AddTaskModal';
import { useVault } from '../hooks/useVault';
import { formatDate, isExpired, isUnknown } from '../utils/dateUtils';

export default function Vault() {
  const { items, removeFromVault, updateReminderDate, addTask, toggleTask, deleteTask, getOpp } = useVault();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [verdictFilter, setVerdictFilter] = useState('All');
  const [deadlineFilter, setDeadlineFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Saved');
  
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [activeOppId, setActiveOppId] = useState(null);
  
  const [manageOppId, setManageOppId] = useState(null);

  const categories = ['All', 'Scholarship', 'Internship', 'Hackathon', 'Scheme', 'Fellowship', 'Program'];
  const verdicts = ['All', 'SUPPORTED', 'PARTIALLY SUPPORTED', 'CONTRADICTED', 'INSUFFICIENT EVIDENCE'];
  const deadlines = ['All', 'UPCOMING', 'CLOSING SOON', 'EXPIRED'];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.organization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchVerdict = verdictFilter === 'All' || item.verdict === verdictFilter;
      const matchDeadline = deadlineFilter === 'All' || item.deadlineUrgency === deadlineFilter;
      
      return matchSearch && matchCategory && matchVerdict && matchDeadline;
    }).sort((a, b) => {
      if (sortBy === 'Recently Saved') {
        return new Date(b.savedAt) - new Date(a.savedAt);
      }
      return 0;
    });
  }, [items, searchQuery, categoryFilter, verdictFilter, deadlineFilter, sortBy]);

  const handleOpenReminder = (id) => {
    setActiveOppId(id);
    setReminderModalOpen(true);
  };
  
  const handleReminderClose = (newReminderValue = null) => {
    if (newReminderValue === 'REMOVE') {
      updateReminderDate(activeOppId, null);
    } else if (newReminderValue && typeof newReminderValue === 'string') {
      updateReminderDate(activeOppId, newReminderValue);
    }
    setReminderModalOpen(false);
    setActiveOppId(null);
  };


  const handleAddTaskSubmit = (taskParams) => {
    addTask(activeOppId, taskParams);
  };

  const getDeadlineUrgency = (item) => {
    if (isExpired(item.deadline)) return 'EXPIRED';
    if (isUnknown(item.deadline)) return 'UNKNOWN';
    return item.deadlineUrgency;
  };

  const getDeadlineColor = (urgency) => {
    switch(urgency) {
      case 'CLOSING SOON': return 'text-amber-600 bg-amber-50';
      case 'EXPIRED': return 'text-red-600 bg-red-50';
      case 'UNKNOWN': return 'text-gray-400 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const managedOpp = manageOppId ? getOpp(manageOppId) : null;

  return (
    <div className="w-full pb-10 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-[#1a1a1a] uppercase mb-3">
          YOUR VAULT
        </h1>
        <p className="text-gray-600 font-medium text-lg">
          Verified opportunities you’ve saved, all in one place.
        </p>
      </header>
      
      {items.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-10 sm:p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-[#F5F3E9] rounded-3xl flex items-center justify-center mb-6">
            <Bookmark size={32} className="text-[#114b43]" />
          </div>
          <h2 className="font-display text-2xl tracking-wide text-[#1a1a1a] uppercase mb-2">YOUR VAULT IS EMPTY</h2>
          <p className="text-gray-500 font-medium mb-8 max-w-sm">
            Save verified opportunities and they’ll appear here.
          </p>
          <button onClick={() => navigate('/home')} className="bg-[#114b43] text-white hover:bg-[#0d3b34] font-bold py-4 px-8 rounded-xl shadow-sm flex items-center gap-2">
            VERIFY AN OPPORTUNITY <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Controls Bar */}
          <div className="bg-white rounded-[1.5rem] p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search saved opportunities..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#fdfdfc] border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#114b43] focus:ring-1 focus:ring-[#114b43]"
              />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <select 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)}
                className="shrink-0 bg-[#F5F3E9] text-[#1a1a1a] font-bold text-[10px] uppercase tracking-widest py-3 px-4 rounded-xl border-none focus:ring-0 cursor-pointer outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'Categories' : c}</option>)}
              </select>
              
              <select 
                value={verdictFilter} 
                onChange={e => setVerdictFilter(e.target.value)}
                className="shrink-0 bg-[#F5F3E9] text-[#1a1a1a] font-bold text-[10px] uppercase tracking-widest py-3 px-4 rounded-xl border-none focus:ring-0 cursor-pointer outline-none"
              >
                {verdicts.map(c => <option key={c} value={c}>{c === 'All' ? 'Verdicts' : c}</option>)}
              </select>

              <select 
                value={deadlineFilter} 
                onChange={e => setDeadlineFilter(e.target.value)}
                className="shrink-0 bg-[#F5F3E9] text-[#1a1a1a] font-bold text-[10px] uppercase tracking-widest py-3 px-4 rounded-xl border-none focus:ring-0 cursor-pointer outline-none"
              >
                {deadlines.map(c => <option key={c} value={c}>{c === 'All' ? 'Deadlines' : c}</option>)}
              </select>
            </div>
          </div>

          {/* List */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
              <Search size={32} className="text-gray-300 mb-4" />
              <h3 className="font-display text-xl tracking-wide text-[#1a1a1a] uppercase mb-2">NO OPPORTUNITIES FOUND</h3>
              <p className="text-gray-500 font-medium text-sm">Try changing your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map(item => {
                const effectiveUrgency = getDeadlineUrgency(item);
                const expired = effectiveUrgency === 'EXPIRED';
                const unknown = effectiveUrgency === 'UNKNOWN';

                return (
                <div key={item.id} className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow flex flex-col h-full group">
                  
                  <div className="flex items-start justify-between mb-4">
                    <VerificationBadge status={item.verdict} />
                    <button 
                      onClick={() => removeFromVault(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      title="Remove from vault"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="mb-6 flex-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span>{item.organization}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{item.category}</span>
                    </div>
                    <h3 className="text-[#1a1a1a] font-bold text-xl leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                  </div>
                  
                  <div className="bg-[#fdfdfc] border border-gray-100 rounded-xl p-4 flex flex-wrap items-center justify-between gap-y-4 mb-6">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Deadline</p>
                      <p className={`text-sm font-bold ${getDeadlineColor(effectiveUrgency)} rounded px-1.5 -ml-1.5 inline-block`}>
                        {unknown ? 'Not verified' : formatDate(item.deadline)}
                      </p>
                    </div>
                    {item.tasks && item.tasks.length > 0 && (
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tasks</p>
                        <p className="text-sm font-bold text-[#1a1a1a]">
                          {item.tasks.filter(t => t.completed).length} / {item.tasks.length} <Check size={14} className="inline text-[#10b981] -mt-0.5" strokeWidth={3} />
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reminder</p>
                      {item.reminderDate ? (
                        <button onClick={(e) => { e.stopPropagation(); handleOpenReminder(item.id); }} className="text-sm font-bold text-[#114b43] hover:text-[#0d3b34] flex items-center gap-1 transition-colors">
                          <Check size={14} /> {formatDate(item.reminderDate)}
                        </button>
                      ) : expired || unknown ? (
                        <span className="text-sm font-bold text-gray-300 flex items-center gap-1">
                          <Bell size={14} /> Unavailable
                        </span>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); handleOpenReminder(item.id); }} className="text-sm font-bold text-gray-400 hover:text-[#114b43] flex items-center gap-1 transition-colors">
                          <Bell size={14} /> Set reminder
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setManageOppId(item.id)}
                    className="w-full bg-[#F5F3E9] text-[#1a1a1a] hover:bg-[#114b43] hover:text-white font-bold py-3.5 rounded-xl text-sm flex justify-center items-center gap-2 transition-all"
                  >
                    MANAGE OPPORTUNITY <ArrowRight size={16} />
                  </button>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Expanded Manage View Drawer / Overlay */}
      {managedOpp && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setManageOppId(null)} />
          <div className="relative w-full sm:w-[420px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
              <div className="min-w-0 pr-4">
                <h2 className="font-bold text-xl text-[#1a1a1a] truncate">{managedOpp.name}</h2>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage Opportunity</div>
              </div>
              <button onClick={() => setManageOppId(null)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#fdfdfc]">
              
              {/* Context row */}
              <div className="flex gap-4">
                <div className="flex-1 bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar size={12}/> DEADLINE</div>
                  <div className={`font-bold ${getDeadlineColor(getDeadlineUrgency(managedOpp))} rounded px-1.5 -ml-1.5 inline-block`}>
                    {isUnknown(managedOpp.deadline) ? 'Not verified' : formatDate(managedOpp.deadline)}
                  </div>
                </div>
                <div className="flex-1 bg-white border border-gray-100 shadow-sm p-4 rounded-xl relative group">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Bell size={12}/> REMINDER</div>
                  {isExpired(managedOpp.deadline) || isUnknown(managedOpp.deadline) ? (
                    <div className="font-bold text-gray-300 flex items-center gap-1 text-sm">
                       Unavailable
                    </div>
                  ) : (
                    <button onClick={() => handleOpenReminder(managedOpp.id)} className="font-bold text-[#114b43] group-hover:text-[#0d3b34] flex items-center gap-1 group-hover:underline decoration-[#114b43]/30 underline-offset-4">
                      {managedOpp.reminderDate ? formatDate(managedOpp.reminderDate) : 'Set reminder'}
                    </button>
                  )}
                </div>
              </div>

              {/* Tasks section */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-xl tracking-wide text-[#1a1a1a] uppercase">TASKS</h3>
                  {isExpired(managedOpp.deadline) ? (
                    <span className="text-xs font-bold text-gray-400 px-3 py-1.5">CLOSED</span>
                  ) : (
                    <button 
                      onClick={() => {
                        setActiveOppId(managedOpp.id);
                        setTaskModalOpen(true);
                      }} 
                      className="text-xs font-bold text-[#114b43] hover:text-[#0d3b34] flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-[#114b43]/5"
                    >
                      <Plus size={14} strokeWidth={3} /> ADD TASK
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {(!managedOpp.tasks || managedOpp.tasks.length === 0) ? (
                    <div className="py-8 text-center text-gray-400 text-sm font-medium border border-dashed border-gray-200 rounded-2xl bg-white">
                      No tasks added yet.
                    </div>
                  ) : (
                    managedOpp.tasks.map(task => (
                      <div key={task.id} className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-[#114b43]/20 transition-colors">
                        <button 
                          onClick={() => toggleTask(managedOpp.id, task.id)}
                          className={`mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors ${task.completed ? 'bg-[#10b981] border-[#10b981] text-white' : 'border-gray-300 text-transparent hover:border-[#114b43]'}`}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className={`text-sm font-medium transition-all ${task.completed ? 'line-through text-gray-400' : 'text-[#1a1a1a]'}`}>
                            {task.title}
                          </p>
                          {task.dueDate && (
                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1 ${task.completed ? 'text-gray-300' : 'text-amber-600'}`}>
                              <Calendar size={10} /> Due {formatDate(task.dueDate)}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => deleteTask(managedOpp.id, task.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 bg-white space-y-3 shrink-0 pb-10 sm:pb-6">
              <button onClick={() => navigate(`/results/${managedOpp.id}`)} className="w-full py-4 bg-[#114b43] text-white hover:bg-[#0d3b34] text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors">
                VIEW VERIFICATION <ArrowRight size={16} />
              </button>
              <a href="#" target="_blank" rel="noreferrer" className="w-full py-4 bg-white border border-gray-200 text-[#1a1a1a] hover:bg-gray-50 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                VISIT OFFICIAL SOURCE <ExternalLink size={16} className="text-gray-400" />
              </a>
            </div>

          </div>
        </div>
      )}

      <ReminderModal 
        isOpen={reminderModalOpen} 
        onClose={handleReminderClose} 
        initialDate={activeOppId ? (getOpp(activeOppId)?.reminderDate || '') : ''}
        deadline={activeOppId ? getOpp(activeOppId)?.deadline : null}
      />
      
      <AddTaskModal 
        isOpen={taskModalOpen} 
        onClose={() => setTaskModalOpen(false)} 
        onAdd={handleAddTaskSubmit} 
      />
    </div>
  );
}
