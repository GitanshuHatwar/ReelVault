import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const displayEmail = user?.email || 'Signed in';
  const displayName = displayEmail.split('@')[0];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-[#1a1a1a] uppercase mb-3">
          YOUR PROFILE
        </h1>
        <p className="text-gray-600 font-medium text-lg">You are signed in. That’s all this step needs.</p>
      </header>

      <section className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <User size={18} className="text-[#114b43]" />
          <h2 className="font-display text-xl uppercase tracking-wide text-[#1a1a1a]">Account</h2>
        </div>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#F5F3E9] text-[#114b43] flex items-center justify-center font-display text-2xl uppercase">
            {displayName.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a1a1a]">{displayName}</h3>
            <p className="text-gray-500 font-medium">{displayEmail}</p>
          </div>
        </div>
      </section>

      <button
        onClick={handleLogout}
        className="mt-8 w-full flex items-center justify-center gap-2 py-4 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold"
      >
        <LogOut size={18} />
        LOG OUT
      </button>
    </div>
  );
}
