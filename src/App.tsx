import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { AppLayout } from './components/AppLayout';
import { RequireAuth } from './guards/RequireAuth';
import { PageSkeleton } from './components/PageStatus';
import {
  LoginPage,
  RegisterPage,
  PostsPage,
  PostDetailPage,
  MyPostsPage,
  MyPostsNewPage,
  MyPostEditPage,
  PaymentsSuccessPage,
  PaymentsCancelPage,
  UsersPage,
  AnalyticsPage,
  ProfilePage,
  ProfileEditPage,
  ChatPage,
  ChatRoomPage,
  ChatV2Page,
  ChatV2RoomPage,
} from './routes';

function NotFoundPage() {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  );
}

function AuthPageFallback() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-sm mx-auto">
        <PageSkeleton />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Auth pages render outside AppLayout, so they need their own boundary for the lazy chunk. */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<AuthPageFallback />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="/register"
        element={
          <Suspense fallback={<AuthPageFallback />}>
            <RegisterPage />
          </Suspense>
        }
      />

      <Route element={<AppLayout />}>
        <Route index element={<PostsPage />} />
        <Route path="posts/:postId/:slug" element={<PostDetailPage />} />

        <Route
          path="my-posts"
          element={
            <RequireAuth>
              <MyPostsPage />
            </RequireAuth>
          }
        />
        <Route
          path="my-posts/new"
          element={
            <RequireAuth>
              <MyPostsNewPage />
            </RequireAuth>
          }
        />
        <Route
          path="my-posts/:postId/edit"
          element={
            <RequireAuth>
              <MyPostEditPage />
            </RequireAuth>
          }
        />

        <Route
          path="payments/success"
          element={
            <RequireAuth>
              <PaymentsSuccessPage />
            </RequireAuth>
          }
        />
        <Route
          path="payments/cancel"
          element={
            <RequireAuth>
              <PaymentsCancelPage />
            </RequireAuth>
          }
        />

        <Route
          path="users"
          element={
            <RequireAuth>
              <UsersPage />
            </RequireAuth>
          }
        />
        <Route
          path="analytics"
          element={
            <RequireAuth requireAdmin>
              <AnalyticsPage />
            </RequireAuth>
          }
        />

        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="profile/edit"
          element={
            <RequireAuth>
              <ProfileEditPage />
            </RequireAuth>
          }
        />

        <Route
          path="chat"
          element={
            <RequireAuth>
              <ChatPage />
            </RequireAuth>
          }
        />
        <Route
          path="chat/:roomId"
          element={
            <RequireAuth>
              <ChatRoomPage />
            </RequireAuth>
          }
        />

        <Route
          path="chat-v2"
          element={
            <RequireAuth>
              <ChatV2Page />
            </RequireAuth>
          }
        />
        <Route
          path="chat-v2/:roomId"
          element={
            <RequireAuth>
              <ChatV2RoomPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
