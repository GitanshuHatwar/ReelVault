import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Processing from './pages/Processing';
import Results from './pages/Results';
import Vault from './pages/Vault';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;