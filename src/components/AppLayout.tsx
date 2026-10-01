import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Header } from './Header';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';
import { PageSkeleton } from './PageStatus';
import { useAuth } from '../context/AuthContext';

export function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={user} />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary resetKey={location.pathname}>
          {/* Inside the layout so Header/Footer never suspend while a route chunk loads. */}
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
