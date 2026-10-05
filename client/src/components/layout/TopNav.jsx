import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, User, Play, CalendarDays, Sparkles, Link2 } from 'lucide-react';
import { useLanguage } from '../../preferences/LanguageContext';
import { useAuth } from '../../auth/useAuth';
import NotificationsBell from './NotificationsBell';

export default function TopNav() {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const { isMock } = useAuth();
  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Vault', path: '/vault', icon: Bookmark },
    { name: 'Links', path: '/links', icon: Link2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/5 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 group text-left bg-transparent border-none p-1.5 -ml-1.5 rounded-2xl transition-all">
            <div className="relative w-8 h-8 md:w-9 md:h-9 bg-[#114b43] rounded-xl flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-sm">
              <Play className="text-[#d4f954] w-4 h-4 ml-0.5" fill="currentColor" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4f954] rounded-full ring-2 ring-white flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-[#114b43] rounded-full animate-pulse" />
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-display text-xl tracking-wide uppercase mt-0.5 text-[#1a1a1a] group-hover:text-[#114b43] transition-colors">
                ReelVault
              </span>
              <span className="bg-[#114b43] text-[#d4f954] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 group-hover:bg-[#0e3d36] transition-colors">
                <CalendarDays size={11} strokeWidth={2.5} />
                <span className="hidden sm:inline">Calendar</span>
              </span>
            </div>
          </div>

          {isMock && (
            <span
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#114b43]/10 text-[#114b43] border border-[#114b43]/20 text-[10px] font-bold uppercase tracking-wider"
              title="Running in static offline prototyping mode without backend"
            >
              <Sparkles size={11} />
              <span>Offline Prototyping</span>
            </span>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-bold ${
                  isActive 
                    ? 'bg-[#114b43] text-[#d4f954]' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-[#1a1a1a]'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
          
          <div className="mx-2 h-6 w-px bg-gray-200"></div>
          
          <NotificationsBell />
          
          <label className="ml-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600">
            <span>Content</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Content language preference" className="cursor-pointer bg-transparent text-[#114b43] outline-none">
              <option value="english">English</option>
              <option value="native">Native</option>
            </select>
          </label>
        </nav>
        <div className="md:hidden flex items-center gap-2">
          {isMock && (
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#114b43]/10 text-[#114b43]">
              Mock
            </span>
          )}
          <NotificationsBell />
          <label className="flex items-center rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-bold text-[#114b43]">
            <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Content language preference" className="max-w-20 cursor-pointer bg-transparent outline-none">
              <option value="english">English</option>
              <option value="native">Native</option>
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
