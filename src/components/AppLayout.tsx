import { Outlet } from 'react-router-dom';

import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../context/AuthContext';

export function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={user} />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
