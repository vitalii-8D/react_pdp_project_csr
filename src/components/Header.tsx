import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Icons } from './Icons';
import { LogoMark } from './LogoMark';
import { NavLink } from './NavLink';
import { buttonStyles } from './Button';
import { useAuth } from '../context/AuthContext';
import { avatarUrl } from '../lib/images';
import { paths } from '../lib/paths';
import { UserRole } from '../enums/user-role.enum';
import type { UserEntity } from '../lib/types';

export function Header({ user }: { user?: UserEntity | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMyPosts = location.pathname.startsWith(paths.myPosts());
  const isPosts = location.pathname === paths.posts();
  const isChat = location.pathname.startsWith(paths.chat());
  const isUsers = location.pathname.startsWith(paths.users());
  const isAnalytics = location.pathname.startsWith(paths.analytics());
  const isAdmin = user?.role === UserRole.ADMIN;
  const loginHref = paths.login(location.pathname + location.search);

  function handleLogout() {
    logout();
    navigate(paths.login());
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to={paths.posts()} className="flex items-center space-x-3 group">
            <LogoMark className="transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              PostShare
            </span>
          </Link>

          <nav className="hidden sm:flex space-x-1 sm:space-x-2">
            <NavLink to={paths.posts()} isActive={isPosts}>
              <Icons.Post />
              <span className="ml-2">Posts</span>
            </NavLink>
            {user && (
              <NavLink to={paths.myPosts()} isActive={isMyPosts}>
                <Icons.MyPosts />
                <span className="ml-2">My Posts</span>
              </NavLink>
            )}
            {user && (
              <NavLink to={paths.chat()} isActive={isChat}>
                <Icons.Chat />
                <span className="ml-2">Chat</span>
              </NavLink>
            )}
            {user && (
              <NavLink to={paths.users()} isActive={isUsers}>
                <Icons.Users />
                <span className="ml-2">Users</span>
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to={paths.analytics()} isActive={isAnalytics}>
                <Icons.Analytics />
                <span className="ml-2">Analytics</span>
              </NavLink>
            )}
          </nav>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-slate-200">
                  <Link
                    to={paths.profile()}
                    title="View profile"
                    className="flex items-center space-x-2 focus:outline-none group focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  >
                    <img
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-200"
                      src={user.avatar?.url ?? avatarUrl(user.id)}
                      alt={user.name}
                    />
                    <span className="hidden lg:block text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Log out"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Icons.Logout />
                  </button>
                </div>
              </>
            ) : (
              <Link to={loginHref} className={buttonStyles()}>
                Sign in
              </Link>
            )}
          </div>
        </div>

        <nav className="flex sm:hidden space-x-1 pb-3">
          <NavLink to={paths.posts()} isActive={isPosts} size="sm">
            <Icons.Post />
            <span className="ml-2">Posts</span>
          </NavLink>

          {user && (
            <NavLink to={paths.myPosts()} isActive={isMyPosts} size="sm">
              <Icons.MyPosts />
              <span className="ml-2">My Posts</span>
            </NavLink>
          )}

          {user && (
            <NavLink to={paths.chat()} isActive={isChat} size="sm">
              <Icons.Chat />
              <span className="ml-2">Chat</span>
            </NavLink>
          )}

          {user && (
            <NavLink to={paths.users()} isActive={isUsers} size="sm">
              <Icons.Users />
              <span className="ml-2">Users</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to={paths.analytics()} isActive={isAnalytics} size="sm">
              <Icons.Analytics />
              <span className="ml-2">Analytics</span>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
