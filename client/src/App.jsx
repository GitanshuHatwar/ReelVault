<<<<<<< HEAD
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <h1 className="text-5xl font-bold text-blue-600">
        ReelVault AI
      </h1>
    </div>
  )
}

export default App
=======
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Vault from './pages/Vault';
import Links from './pages/Links';
import Profile from './pages/Profile';
import ProtectedRoute from './auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/links" element={<Links />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
>>>>>>> fd51086672cdf4b251101f31a71c4ef5d5d1dd02
