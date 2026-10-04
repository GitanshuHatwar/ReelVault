import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import { ApiError } from '../services/api';
import { useAuth } from '../auth/useAuth';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    
    if (!password) {
      newErrors.password = "Password is required.";
    }

    if (!isLogin) {
      if (!name) newErrors.name = "Full name is required.";
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/home');
      } else {
        const result = await signUp(email, password);
        if (result.session) {
          navigate('/home');
        } else {
          setIsLogin(true);
          setSubmitError('Check your email to confirm your account, then log in.');
        }
      }
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Unable to connect to ReelVault. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3E9] flex font-sans text-[#1a1a1a]">
      
      {/* LEFT SIDE: Branding (Desktop) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 xl:p-20 border-r border-black/5">
        <Link to="/" className="flex items-center gap-2 w-max">
          <div className="w-10 h-10 bg-[#114b43] rounded-full flex items-center justify-center shadow-sm">
            <Play className="text-[#d4f954] w-5 h-5 ml-0.5" fill="currentColor" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-2xl tracking-wide uppercase mt-1">ReelVault</span>
            <span className="bg-[#d4f954] text-[#114b43] text-xs font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">AI</span>
          </div>
        </Link>
        
        <div className="max-w-md xl:max-w-lg">
          <h1 className="font-display text-5xl xl:text-6xl uppercase tracking-wide text-[#1a1a1a] mb-6 leading-tight">
            Verify before<br />you apply.
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-10 font-medium">
            Turn opportunities discovered in short-form content into verified information you can actually act on.
          </p>
          
          <div className="flex items-center flex-wrap gap-y-3 gap-x-4 text-xs font-bold text-[#114b43] uppercase tracking-widest bg-white/50 px-5 py-4 rounded-2xl border border-black/5">
            <span>Reel</span>
            <span className="text-gray-400">→</span>
            <span>Claims</span>
            <span className="text-gray-400">→</span>
            <span>Evidence</span>
            <span className="text-gray-400">→</span>
            <span className="text-[#1a1a1a]">Opportunity</span>
          </div>
        </div>
        
        <div className="text-sm font-semibold text-gray-400">© 2026 ReelVault AI</div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#114b43] rounded-full flex items-center justify-center">
              <Play className="text-[#d4f954] w-4 h-4 ml-0.5" fill="currentColor" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl tracking-wide uppercase mt-1">ReelVault</span>
              <span className="bg-[#d4f954] text-[#114b43] text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">AI</span>
            </div>
          </Link>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 mt-12 lg:mt-0">
          
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-2 tracking-tight">Welcome to ReelVault</h2>
          <p className="text-gray-500 mb-8 text-sm font-medium">Sign in to save reel titles and transcripts.</p>

          {/* Toggle Tabs */}
          <div className="flex bg-[#F5F3E9] p-1 rounded-xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setErrors({}); setSubmitError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${isLogin ? 'bg-white shadow-sm text-[#1a1a1a]' : 'text-gray-500 hover:text-[#1a1a1a]'}`}
            >
              Log in
            </button>
            <button 
              onClick={() => { setIsLogin(false); setErrors({}); setSubmitError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${!isLogin ? 'bg-white shadow-sm text-[#1a1a1a]' : 'text-gray-500 hover:text-[#1a1a1a]'}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1a1a1a]">Full name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 bg-[#fdfdfc] border ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#114b43] focus:ring-[#114b43]'} rounded-xl text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors`}
                />
                {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#1a1a1a]">Email</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 bg-[#fdfdfc] border ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#114b43] focus:ring-[#114b43]'} rounded-xl text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#1a1a1a]">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-[#fdfdfc] border ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#114b43] focus:ring-[#114b43]'} rounded-xl text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors pr-10`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1a1a1a]">Confirm password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-[#fdfdfc] border ${errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#114b43] focus:ring-[#114b43]'} rounded-xl text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors pr-10`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs font-medium">{errors.confirmPassword}</p>}
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-2.5 pt-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  required
                  className="mt-0.5 w-4 h-4 border-gray-300 rounded text-[#114b43] focus:ring-[#114b43] cursor-pointer" 
                />
                <label htmlFor="terms" className="text-xs text-gray-500 font-medium cursor-pointer">
                  I agree to the <a href="#" className="text-[#114b43] hover:underline">Terms</a> & <a href="#" className="text-[#114b43] hover:underline">Privacy Policy</a>
                </label>
              </div>
            )}

            <Button disabled={isSubmitting} type="submit" className="w-full bg-[#114b43] text-white hover:bg-[#18564c] hover:shadow-md py-3.5 text-base mt-2 rounded-xl disabled:opacity-60">
              {isSubmitting ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
            </Button>
            {submitError && <p className="text-sm font-medium text-red-600 text-center">{submitError}</p>}
          </form>

          {isLogin && (
            <>
              <div className="my-7 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              
              <div className="w-full bg-gray-50 border border-gray-200 text-gray-400 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-sm cursor-not-allowed" title="Google login is not configured on this API yet">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google login is not configured
              </div>
            </>
          )}

          <div className="mt-8 text-center text-sm text-gray-500 font-medium">
            {isLogin ? (
              <>Don't have an account? <button onClick={() => { setIsLogin(false); setErrors({}); setSubmitError(''); }} className="text-[#114b43] font-bold hover:underline">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setIsLogin(true); setErrors({}); setSubmitError(''); }} className="text-[#114b43] font-bold hover:underline">Log in</button></>
            )}
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
