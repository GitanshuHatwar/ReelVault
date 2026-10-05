import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, User, Link2 } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Vault', path: '/vault', icon: Bookmark },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/5 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-[#114b43]' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-[#114b43]' : 'text-gray-400'}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
