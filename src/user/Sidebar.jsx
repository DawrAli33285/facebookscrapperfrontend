import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Upload, X, FileText, Menu, LogOut } from 'lucide-react';

function Sidebar() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'upload', label: 'Upload', icon: Upload, path: '/dashboard' },
    { id: 'files', label: 'History', icon: FileText, path: '/orders' }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('enrichmentData');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-indigo-700 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
        <div className="p-6 border-b border-white border-opacity-20">
  <div className="flex items-center justify-between">
    <div className="bg-white bg-opacity-90 rounded-lg p-3 flex-1">
      <img
        src="./logo.png"
        alt="Logo"
        className="w-full h-auto object-contain"
      />
    </div>
    <button
      onClick={() => setIsMobileSidebarOpen(false)}
      className="lg:hidden text-white hover:text-gray-200 ml-2"
    >
      <X className="w-6 h-6" />
    </button>
  </div>
</div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-indigo-800 text-white shadow-lg border-l-4 border-white'
                          : 'text-white text-opacity-90 hover:bg-indigo-800 hover:bg-opacity-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Logout Button */}
            <div className="mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white text-opacity-90 hover:bg-red-600 hover:bg-opacity-30 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
          
          <div className="p-4 border-t border-white border-opacity-20">
            <div className="text-xs text-white text-opacity-70 text-center">
              © 2025 Enrichify Data
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="text-gray-700 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Sidebar;