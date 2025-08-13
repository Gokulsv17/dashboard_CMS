import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Lock,
  Star,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordModal from '../common/ChangePasswordModal';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getBreadcrumbs = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard / Overview';
      case '/blogs':
        return 'Dashboard / Blogs';
      case '/videos':
        return 'Dashboard / Videos';
      default:
        return 'Dashboard';
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const handleChangePasswordClick = () => {
    setShowChangePasswordModal(true);
    setShowProfileMenu(false);
  };

  const renderBreadcrumbs = () => {
    const breadcrumbs = getBreadcrumbs();
    const parts = breadcrumbs.split(' / ');
    return (
      <h1 className="text-lg font-semibold text-gray-900 flex items-center">
        <span className="text-gray-300">{parts[0]}</span>
        {parts[1] && <span className="text-black-600"> / {parts[1]}</span>}
      </h1>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      {/* Left side - Static Icon + Breadcrumbs */}
      <div className="flex items-center space-x-2">
        <Star className="h-5 w-5 text-blue-600" />
        {renderBreadcrumbs()}
      </div>

      {/* Right side - Search, Notifications, Profile */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-60 lg:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Search content..."
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 md:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            <img
              src={
                user?.avatar ||
                'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
              }
              alt={user?.name || 'Profile'}
              className="h-8 w-8 rounded-full object-cover"
            />
            <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <Link 
                to="/profile"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition duration-200"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="w-4 h-4 mr-3" />
                Profile
              </Link>

              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition duration-200">
                <Lock className="w-4 h-4 mr-3" />
                <span onClick={handleChangePasswordClick}>Change Password</span>
              </button>

              <div className="border-t border-gray-100 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </header>
  );
};

export default Header;
