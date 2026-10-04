import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-[#F5F3E9] text-[#1a1a1a] font-sans">
      <TopNav />
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 lg:p-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
