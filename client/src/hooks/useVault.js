import { useState, useEffect } from 'react';

const MOCK_VAULT_KEY = 'reelvault_saved_opportunities_v2';

const initialVault = [
  {
    id: 'mock-analysis-2',
    name: 'Google Summer of Code',
    organization: 'Google',
    category: 'Program',
    verdict: 'SUPPORTED',
    deadline: '2027-02-15',
    deadlineUrgency: 'UPCOMING',
    savedAt: '2026-09-30T10:00:00Z',
    reminderDate: null,
    tasks: []
  },
  {
    id: 'mock-analysis-3',
    name: 'Smart India Hackathon',
    organization: 'MoE',
    category: 'Hackathon',
    verdict: 'SUPPORTED',
    deadline: '2026-11-10',
    deadlineUrgency: 'UPCOMING',
    savedAt: '2026-10-01T15:00:00Z',
    reminderDate: '2026-11-05',
    tasks: []
  },
  {
    id: 'mock-analysis-4',
    name: '₹25,000 Student Grant',
    organization: 'Unknown',
    category: 'Scheme',
    verdict: 'CONTRADICTED',
    deadline: 'None',
    deadlineUrgency: 'UNKNOWN',
    savedAt: '2026-09-28T09:00:00Z',
    reminderDate: null,
    tasks: []
  },
  {
    id: 'mock-analysis-5',
    name: 'National Fellowship Program',
    organization: 'Govt',
    category: 'Fellowship',
    verdict: 'INSUFFICIENT EVIDENCE',
    deadline: '2026-12-31',
    deadlineUrgency: 'UPCOMING',
    savedAt: '2026-10-03T11:00:00Z',
    reminderDate: null,
    tasks: []
  },
  {
    id: 'mock-analysis-6',
    name: 'Old Expired Program',
    organization: 'Legacy',
    category: 'Program',
    verdict: 'INSUFFICIENT EVIDENCE',
    deadline: '2001-12-31',
    deadlineUrgency: 'EXPIRED',
    savedAt: '2026-10-02T11:00:00Z',
    reminderDate: null,
    tasks: []
  }
];

export function useVault() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(MOCK_VAULT_KEY);
    return saved ? JSON.parse(saved) : initialVault.map(i => ({...i, tasks: i.tasks || []}));
  });

  useEffect(() => {
    localStorage.setItem(MOCK_VAULT_KEY, JSON.stringify(items));
  }, [items]);

  const saveToVault = (opp) => {
    setItems(prev => {
      if (prev.find(i => i.id === opp.id)) return prev;
      return [{...opp, savedAt: new Date().toISOString(), tasks: []}, ...prev];
    });
  };

  const removeFromVault = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };
  
  const updateReminderDate = (id, reminderDate) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, reminderDate } : i));
  };

  const addTask = (oppId, taskParams) => {
    setItems(prev => prev.map(i => {
      if (i.id === oppId) {
        const newTask = {
          id: 'task-' + Date.now() + Math.random().toString(36).substr(2, 5),
          title: taskParams.title,
          dueDate: taskParams.dueDate || null,
          completed: false,
          createdAt: new Date().toISOString()
        };
        return { ...i, tasks: [...(i.tasks || []), newTask] };
      }
      return i;
    }));
  };

  const toggleTask = (oppId, taskId) => {
    setItems(prev => prev.map(i => {
      if (i.id === oppId) {
        return {
          ...i,
          tasks: (i.tasks || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return i;
    }));
  };

  const deleteTask = (oppId, taskId) => {
    setItems(prev => prev.map(i => {
      if (i.id === oppId) {
        return {
          ...i,
          tasks: (i.tasks || []).filter(t => t.id !== taskId)
        };
      }
      return i;
    }));
  };

  const isSaved = (id) => {
    return items.some(i => i.id === id);
  };

  const getOpp = (id) => {
    return items.find(i => i.id === id);
  };

  return { items, saveToVault, removeFromVault, updateReminderDate, addTask, toggleTask, deleteTask, isSaved, getOpp };
}
