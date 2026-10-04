import { useState, useEffect } from 'react';
import { Check, Bell, X, Calendar } from 'lucide-react';
import Button from './Button';
import { formatDate, parseISOLocal, getTodayLocal } from '../../utils/dateUtils';

export default function ReminderModal({ isOpen, onClose, initialDate, deadline }) {
  const [date, setDate] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate || '');
      setError('');
      setIsSaved(false);
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!date) {
      setError('Please select a date.');
      return;
    }

    const selectedDate = parseISOLocal(date);
    const today = getTodayLocal();

    if (selectedDate < today) {
      setError('Reminder cannot be in the past.');
      return;
    }

    if (deadline && deadline !== 'None') {
      const deadlineDate = parseISOLocal(deadline);
      if (deadlineDate && selectedDate > deadlineDate) {
        setError('Reminder must be on or before the opportunity deadline.');
        return;
      }
    }

    setIsSaved(true);
    setTimeout(() => {
      onClose(date);
    }, 1500);
  };

  const handleClose = () => {
    onClose(null);
  };
  
  const handleRemove = () => {
    onClose('REMOVE');
  };



  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <button onClick={handleClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        
        {isSaved ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-[#d4f954] rounded-full flex items-center justify-center mb-2">
              <Check size={28} className="text-[#114b43]" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold text-[#1a1a1a]">Reminder Set!</h3>
            <p className="text-sm font-medium text-gray-500">We'll remind you on {formatDate(date)}.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 bg-[#F5F3E9] rounded-2xl flex items-center justify-center mb-4">
                <Bell size={20} className="text-[#114b43]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a]">SET REMINDER</h3>
              <p className="text-sm font-medium text-gray-500 mt-1">Choose when you want to be reminded about this opportunity.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Reminder Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={date}
                    min={getTodayLocal().toISOString().split('T')[0]}
                    max={(deadline && deadline !== 'None') ? deadline : undefined}
                    onChange={(e) => { setDate(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 bg-[#fdfdfc] border border-gray-200 focus:border-[#114b43] focus:ring-1 focus:ring-[#114b43] rounded-xl text-[#1a1a1a] font-medium outline-none transition-colors"
                  />
                </div>
                {error && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{error}</p>}
              </div>
              
              <div className="pt-2 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button type="button" onClick={handleClose} className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-3 rounded-xl font-bold text-sm transition-colors">
                    CANCEL
                  </button>
                  <button type="submit" disabled={!date} className="flex-1 bg-[#114b43] text-white hover:bg-[#0d3b34] disabled:opacity-50 py-3 rounded-xl font-bold text-sm shadow-sm transition-colors">
                    SET REMINDER
                  </button>
                </div>
                {initialDate && (
                  <button type="button" onClick={handleRemove} className="w-full py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors">
                    REMOVE REMINDER
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
