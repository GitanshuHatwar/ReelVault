import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, User, Play } from 'lucide-react';

export default function TopNav() {
  const location = useLocation();
  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Vault', path: '/vault', icon: Bookmark },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/5 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        
        <Link to="/home" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#114b43] rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
            <Play className="text-[#d4f954] w-4 h-4 ml-0.5" fill="currentColor" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="font-display text-xl tracking-wide uppercase mt-1">ReelVault</span>
            <span className="bg-[#d4f954] text-[#114b43] text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">AI</span>
          </div>
        </Link>

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
        </nav>

        {/* Small mobile logo display when text is hidden */}
        <div className="sm:hidden flex items-center gap-1.5">
          <span className="font-display text-xl tracking-wide uppercase mt-1">ReelVault</span>
        </div>
      </div>
    </header>
  );
}
