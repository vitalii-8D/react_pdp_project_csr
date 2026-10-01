import { lazy } from 'react';

// Route chunks. The loaders are exported on their own so links can start downloading a chunk on
// hover/focus (see `preload` on NavLink / Link call sites) - the same promise is reused by lazy().
export const loadPostsPage = () => import('./pages/PostsPage');
export const loadPostDetailPage = () => import('./pages/PostDetailPage');
export const loadMyPostsPage = () => import('./pages/MyPostsPage');
export const loadMyPostsNewPage = () => import('./pages/MyPostsNewPage');
export const loadMyPostEditPage = () => import('./pages/MyPostEditPage');
export const loadUsersPage = () => import('./pages/UsersPage');
export const loadAnalyticsPage = () => import('./pages/AnalyticsPage');
export const loadProfilePage = () => import('./pages/ProfilePage');
export const loadChatPage = () => import('./pages/ChatPage');
export const loadChatRoomPage = () => import('./pages/ChatRoomPage');
export const loadChatV2Page = () => import('./pages/ChatV2Page');
export const loadChatV2RoomPage = () => import('./pages/ChatV2RoomPage');

export const LoginPage = lazy(() => import('./pages/LoginPage'));
export const RegisterPage = lazy(() => import('./pages/RegisterPage'));
export const PostsPage = lazy(loadPostsPage);
export const PostDetailPage = lazy(loadPostDetailPage);
export const MyPostsPage = lazy(loadMyPostsPage);
export const MyPostsNewPage = lazy(loadMyPostsNewPage);
export const MyPostEditPage = lazy(loadMyPostEditPage);
export const PaymentsSuccessPage = lazy(() => import('./pages/PaymentsSuccessPage'));
export const PaymentsCancelPage = lazy(() => import('./pages/PaymentsCancelPage'));
export const UsersPage = lazy(loadUsersPage);
export const AnalyticsPage = lazy(loadAnalyticsPage);
export const ProfilePage = lazy(loadProfilePage);
export const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage'));
export const ChatPage = lazy(loadChatPage);
export const ChatRoomPage = lazy(loadChatRoomPage);
export const ChatV2Page = lazy(loadChatV2Page);
export const ChatV2RoomPage = lazy(loadChatV2RoomPage);
