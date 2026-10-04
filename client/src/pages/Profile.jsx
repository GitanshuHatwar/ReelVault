import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronRight, Check, Settings, Shield } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Profile() {
  const navigate = useNavigate();
  
  // Profile State
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('reelvault_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Yadnesh',
      email: 'yadnesh@example.com'
    };
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  // Preferences State
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('reelvault_prefs');
    return saved ? JSON.parse(saved) : {
      interests: ['Scholarship', 'Hackathon'],
      remindersEnabled: true
    };
  });

  const availableInterests = [
    'Scholarship', 'Internship', 'Hackathon', 'Government Schemes', 'Fellowship'
  ];

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('reelvault_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('reelvault_prefs', JSON.stringify(preferences));
  }, [preferences]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfile(editForm);
    setIsEditing(false);
  };

  const toggleInterest = (interest) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleLogout = () => {
    // Clear mock auth state here if applicable, then navigate
    navigate('/auth');
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-12 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-[#1a1a1a] uppercase mb-3">
          YOUR PROFILE
        </h1>
        <p className="text-gray-600 font-medium text-lg">
          Manage your account and ReelVault preferences.
        </p>
      </header>
      
      <div className="space-y-8">
        
        {/* Profile Information */}
        <section className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-6">
            <User size={18} className="text-[#114b43]" />
            <h2 className="font-display text-xl uppercase tracking-wide text-[#1a1a1a]">Profile Information</h2>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-[#fdfdfc] border border-gray-200 focus:border-[#114b43] focus:ring-1 focus:ring-[#114b43] rounded-xl text-[#1a1a1a] font-medium outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={e => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-[#fdfdfc] border border-gray-200 focus:border-[#114b43] focus:ring-1 focus:ring-[#114b43] rounded-xl text-[#1a1a1a] font-medium outline-none transition-colors"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-3 rounded-xl font-bold transition-colors">
                  CANCEL
                </Button>
                <Button type="submit" className="flex-1 bg-[#114b43] text-white hover:bg-[#0d3b34] py-3 rounded-xl font-bold shadow-sm transition-colors">
                  SAVE
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 shrink-0 rounded-full bg-[#F5F3E9] text-[#114b43] flex items-center justify-center font-display text-2xl uppercase shadow-sm">
                  {profile.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-[#1a1a1a] truncate">{profile.name}</h3>
                  <p className="text-gray-500 font-medium truncate">{profile.email}</p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} className="bg-[#F5F3E9] text-[#1a1a1a] hover:bg-[#e8e6dc] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors w-full sm:w-auto text-center shrink-0">
                Edit Profile
              </Button>
            </div>
          )}
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={18} className="text-[#114b43]" />
            <h2 className="font-display text-xl uppercase tracking-wide text-[#1a1a1a]">Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Opportunity Interests</h3>
            <div className="flex flex-wrap gap-2.5">
              {availableInterests.map(interest => {
                const isSelected = preferences.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-[#114b43] border-[#114b43] text-[#d4f954]' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && <Check size={16} />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-gray-100" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">Deadline reminders</h3>
              <p className="text-xs text-gray-500 font-medium">Receive notifications before deadlines.</p>
            </div>
            
            {/* Toggle Switch */}
            <button 
              onClick={() => setPreferences({...preferences, remindersEnabled: !preferences.remindersEnabled})}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shrink-0 ${preferences.remindersEnabled ? 'bg-[#114b43]' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={preferences.remindersEnabled}
              aria-label="Toggle deadline reminders"
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${preferences.remindersEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-[#114b43]" />
            <h2 className="font-display text-xl uppercase tracking-wide text-[#1a1a1a]">Data & Privacy</h2>
          </div>
          
          <div className="space-y-1">
            {['Privacy Policy', 'Terms of Service', 'About ReelVault'].map(item => (
              <button key={item} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group border border-transparent hover:border-gray-100">
                <span className="text-sm font-bold text-[#1a1a1a]">{item}</span>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#114b43]" />
              </button>
            ))}
          </div>
        </section>

        {/* Logout */}
        <div className="pt-2 px-2 pb-16 lg:pb-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-bold transition-colors"
          >
            <LogOut size={18} />
            LOG OUT
          </button>
        </div>

      </div>
    </div>
  );
}
