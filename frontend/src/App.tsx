import { useState } from 'react';
import DispatcherDashboard from './components/DispatcherDashboard';
import Onboarding from './components/Onboarding';
import Finance from './components/Finance';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CompanyManagement from './components/CompanyManagement';
import CompleteRegistration from './components/CompleteRegistration';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import OrderManagement from './components/OrderManagement';
import ResetPassword from './components/ResetPassword';
import { LogOut, TrendingUp, Package, MapPin, DollarSign, Users, Menu, X, ChevronLeft, ChevronRight, BarChart3, Building } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('userRole') === 'SuperAdmin' ? 'superadmin' : 'dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setShowLogoutModal(false);
  };

  //useEffect to check if user is authenticated


  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const path = window.location.pathname;

  if (path === '/reset-password') {
    return <ResetPassword />;
  }

  if (token) {
    return (
      <CompleteRegistration 
        token={token} 
        onComplete={() => {
          window.history.replaceState({}, document.title, "/");
          window.location.reload();
        }} 
      />
    );
  }

  if (!isAuthenticated) {
    if (showLogin) {
      return <Login onLogin={() => setIsAuthenticated(true)} onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
  }

  const userRole = localStorage.getItem('userRole');

  return (
    <div className="flex h-screen bg-slate-50 w-full overflow-hidden relative">
      {/* Sidebar */}
      <div className={`
        ${isSidebarCollapsed ? 'w-16' : 'w-64'} 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        bg-white/70 backdrop-blur-md border-r border-white/20 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-30 absolute md:relative h-full
      `}>
        <div className="p-4 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl leading-none">L</span>
            </div>
            {!isSidebarCollapsed && <span className="font-bold text-xl text-slate-900 truncate">SwiftLogistics</span>}
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-1 rounded-full hover:bg-slate-100 text-slate-500"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-full hover:bg-slate-100 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-2 space-y-1">
          {userRole === 'SuperAdmin' ? (
            <>
              <button
                onClick={() => { setCurrentTab('superadmin'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'superadmin' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
                title="Dashboard"
              >
                <BarChart3 size={18} />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </button>
              <button
                onClick={() => { setCurrentTab('companies'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'companies' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
                title="Companies"
              >
                <Building size={18} />
                {!isSidebarCollapsed && <span>Companies</span>}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setCurrentTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'dashboard' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
                title="Dashboard"
              >
                <TrendingUp size={18} />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </button>
              <button
                onClick={() => { setCurrentTab('orders'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'orders' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
                title="Orders"
              >
                <Package size={18} />
                {!isSidebarCollapsed && <span>Orders</span>}
              </button>
              <button
                onClick={() => { setCurrentTab('dispatch'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'dispatch' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
                title="Dispatcher"
              >
                <MapPin size={18} />
                {!isSidebarCollapsed && <span>Dispatcher</span>}
              </button>
              <button
                onClick={() => { setCurrentTab('finance'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'finance' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
                title="Finance"
              >
                <DollarSign size={18} />
                {!isSidebarCollapsed && <span>Finance</span>}
              </button>
              <button
                onClick={() => { setCurrentTab('onboarding'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'onboarding' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
                title="Staff"
              >
                <Users size={18} />
                {!isSidebarCollapsed && <span>Staff</span>}
              </button>
            </>
          )}
        </nav>
        
        <div className="p-2 border-t border-white/20">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-slate-50 text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-bold text-xl text-slate-900 capitalize">
              {currentTab === 'superadmin' ? 'Super Admin Dashboard' : currentTab.replace(/([A-Z])/g, ' $1').trim()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-purple-200 flex justify-center items-center overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          {/* Background Gradients */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 pointer-events-none"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 pointer-events-none"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 pointer-events-none"></div>

          <div className="relative z-10">
            {userRole === 'SuperAdmin' ? (
              currentTab === 'superadmin' ? <SuperAdminDashboard /> : <CompanyManagement />
            ) :
              currentTab === 'dashboard' ? <Dashboard /> :
              currentTab === 'orders' ? <OrderManagement /> :
              currentTab === 'dispatch' ? <DispatcherDashboard /> :
              currentTab === 'finance' ? <Finance /> :
              <Onboarding />}
          </div>
        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Logout</h3>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to log out of your session?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div id="toast-container" className="fixed bottom-4 right-4 z-50 space-y-2"></div>
    </div>
  );
}

export default App;
