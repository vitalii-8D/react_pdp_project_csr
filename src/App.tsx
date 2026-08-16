import { Routes, Route } from 'react-router-dom';

import { AppLayout } from './components/AppLayout';
import { RequireAuth } from './guards/RequireAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import MyPostsPage from './pages/MyPostsPage';
import MyPostsNewPage from './pages/MyPostsNewPage';
import MyPostEditPage from './pages/MyPostEditPage';
import PaymentsSuccessPage from './pages/PaymentsSuccessPage';
import PaymentsCancelPage from './pages/PaymentsCancelPage';
import UsersPage from './pages/UsersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import ChatPage from './pages/ChatPage';
import ChatRoomPage from './pages/ChatRoomPage';

function NotFoundPage() {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
