export function formatDate(dateStr) {
  if (!dateStr || dateStr === 'None') return dateStr || '';
  
  // Try parsing YYYY-MM-DD safely without timezone shifts
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const date = new Date(year, parseInt(month) - 1, day);
      if (!isNaN(date.getTime())) {
        const d = date.getDate();
        const m = date.toLocaleString('en-GB', { month: 'short' });
        const y = date.getFullYear();
        return `${d} ${m} ${y}`;
      }
    }
  }

  // Fallback for native parsing
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
       return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  } catch (e) {
    // ignore
  }

  return dateStr;
}

export function parseISOLocal(dateStr) {
  if (!dateStr || dateStr === 'None') return null;
  
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return new Date(year, parseInt(month) - 1, day);
    }
  }
  
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function getTodayLocal() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function isUnknown(deadline) {
  return !deadline || deadline === 'None' || deadline.toLowerCase() === 'not verified';
}

export function isExpired(deadline) {
  if (isUnknown(deadline)) return false; // Can't be expired if unknown
  const deadlineDate = parseISOLocal(deadline);
  if (!deadlineDate) return false;
  
  deadlineDate.setHours(23, 59, 59, 999);
  return deadlineDate < new Date();
}
