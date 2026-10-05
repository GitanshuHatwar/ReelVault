import { useState, useEffect, useRef } from 'react';
import { Bell, Check, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../auth/useAuth';

export default function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [dates, setDates] = useState([]);
  const navigate = useNavigate();
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('reelvault_read_notifications') || '[]');
    } catch {
      return [];
    }
  });
  const dropdownRef = useRef(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;
    
    // Fetch important dates to act as reminder notifications
    const fetchDates = async () => {
      try {
        const savedDates = await api.listSavedDates();
        
        // Sort by event date ascending so upcoming ones are first
        const sorted = savedDates.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        setDates(sorted);
      } catch (err) {
        console.error('Failed to load notifications (saved dates)', err);
      }
    };
    
    fetchDates();
    // Poll every 60s for new dates to simulate live notifications
    const interval = setInterval(fetchDates, 60000);
    return () => clearInterval(interval);
  }, [session]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = (id) => {
    const newReadIds = [...new Set([...readIds, id])];
    setReadIds(newReadIds);
    localStorage.setItem('reelvault_read_notifications', JSON.stringify(newReadIds));
  };

  const markAllAsRead = () => {
    const allIds = dates.map(d => d.id);
    const newReadIds = [...new Set([...readIds, ...allIds])];
    setReadIds(newReadIds);
    localStorage.setItem('reelvault_read_notifications', JSON.stringify(newReadIds));
  };

  // Generate notification objects from dates
  const notifications = dates.map(date => {
    const eventDate = new Date(date.event_date);
    return {
      id: date.id,
      title: 'Upcoming Deadline',
      message: `Reminder: ${date.label} is on ${eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.`,
      date: eventDate,
      isRead: readIds.includes(date.id),
      reel_id: date.reel_id
    };
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-[#1a1a1a] transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing size={20} className="text-[#114b43]" />
        ) : (
          <Bell size={20} />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#d4f954] text-[9px] font-bold text-[#114b43] ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 flex flex-col">
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-5 py-4 border-b border-gray-100 flex items-center justify-between z-10 rounded-t-2xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#114b43]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#1a1a1a] transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 font-medium">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      setIsOpen(false);
                      navigate('/vault');
                    }}
                    className={`p-4 transition-colors hover:bg-gray-50 flex items-start gap-3 cursor-pointer ${!notif.isRead ? 'bg-[#F5F3E9]/30' : ''}`}
                  >
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-[#114b43] mt-2 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-bold truncate ${!notif.isRead ? 'text-[#1a1a1a]' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="text-gray-400 hover:text-[#114b43] p-1 -mr-1 rounded-md"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed mb-2 ${!notif.isRead ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {notif.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
