import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Video, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../assets/images/logo.svg';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard',
    },
  ];

  const contentManagement = [
    {
      name: 'Blogs',
      href: '/blogs',
      icon: FileText,
      current: location.pathname === '/blogs',
    },
    {
      name: 'Videos',
      href: '/videos',
      icon: Video,
      current: location.pathname === '/videos',
    },
  ];

  return (
    <div className="flex flex-col w-64 bg-[#006ADA] h-full text-white relative">
     {/* Logo */}
<div className="flex justify-center items-center h-20 border-b border-[#0053b1]">
  <img
    src={Logo}
    alt="DoodleBlue Logo"
    className="w-[173.94px] h-[29px] object-contain"
  />
</div>


      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        {/* Dashboard */}
        <div>
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition duration-200 rounded-md
                    ${item.current
                      ? 'bg-white text-black border-white'
                      : 'text-white border-transparent hover:bg-[#0f75db]'
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition duration-200
                      ${item.current ? 'text-black' : 'text-white group-hover:text-white'}`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Management */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-white uppercase tracking-wider">
            Content Management
          </h3>
          <ul className="mt-4 space-y-2">
            {contentManagement.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition duration-200 rounded-md
                    ${item.current
                      ? 'bg-white text-black border-white'
                      : 'text-white border-transparent hover:bg-[#0f75db]'
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition duration-200
                      ${item.current ? 'text-black' : 'text-white group-hover:text-white'}`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#0053b1]">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-white hover:bg-red-600 hover:text-white rounded-lg transition duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
