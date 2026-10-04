import { useState } from 'react';
import { X, Calendar, Plus } from 'lucide-react';
import Button from './Button';

export default function AddTaskModal({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), dueDate: dueDate.trim() });
    setTitle('');
    setDueDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <button type="button" onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        
        <div className="mb-6">
          <div className="w-10 h-10 bg-[#F5F3E9] rounded-2xl flex items-center justify-center mb-4">
            <Plus size={20} className="text-[#114b43]" />
          </div>
          <h3 className="text-xl font-bold text-[#1a1a1a]">ADD A TASK</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Task Name</label>
            <input 
              type="text" 
              placeholder="e.g. Collect required documents"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#fdfdfc] border border-gray-200 focus:border-[#114b43] focus:ring-1 focus:ring-[#114b43] rounded-xl text-sm font-medium outline-none transition-colors"
              autoFocus
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Due Date (Optional)</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="e.g. 24 Oct"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#fdfdfc] border border-gray-200 focus:border-[#114b43] focus:ring-1 focus:ring-[#114b43] rounded-xl text-sm font-medium outline-none transition-colors"
              />
            </div>
          </div>
          
          <div className="pt-2 flex gap-3">
            <Button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-3 rounded-xl font-bold text-sm transition-colors">
              CANCEL
            </Button>
            <Button type="submit" disabled={!title.trim()} className="flex-1 bg-[#114b43] text-white hover:bg-[#0d3b34] disabled:opacity-50 py-3 rounded-xl font-bold text-sm shadow-sm transition-colors">
              ADD TASK
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
