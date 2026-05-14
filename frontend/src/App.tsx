import { useState } from 'react';
import PasteAndParse from './components/PasteAndParse';
import DispatcherDashboard from './components/DispatcherDashboard';
import Onboarding from './components/Onboarding';
import CreateOrder from './components/CreateOrder';
import Finance from './components/Finance';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CompanyManagement from './components/CompanyManagement';
import CompleteRegistration from './components/CompleteRegistration';
import LandingPage from './components/LandingPage';
import ResetPassword from './components/ResetPassword';
import { LogOut } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('userRole') === 'SuperAdmin' ? 'superadmin' : 'parse');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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
    <div className="flex h-screen bg-slate-50 w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white/70 backdrop-blur-md border-r border-white/20 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/20 flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">L</span>
          </div>
          <span className="font-bold text-xl text-slate-900">SwiftLogistics</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {userRole === 'SuperAdmin' ? (
            <>
              <button
                onClick={() => setCurrentTab('superadmin')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'superadmin' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentTab('companies')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'companies' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Companies
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentTab('parse')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'parse' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Paste & Parse
              </button>
              <button
                onClick={() => setCurrentTab('single')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'single' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Single Order
              </button>
              <button
                onClick={() => setCurrentTab('dispatch')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'dispatch' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Dispatcher Dashboard
              </button>
              <button
                onClick={() => setCurrentTab('finance')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'finance' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Finance
              </button>
              <button
                onClick={() => setCurrentTab('onboarding')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentTab === 'onboarding' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Onboarding
              </button>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-200 space-y-2">
          {userRole !== 'SuperAdmin' && (
            <div className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-100 rounded-full text-center">
              Tenant: Acme Logistics Ltd
            </div>
          )}
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
          <h1 className="font-bold text-xl text-slate-900 capitalize">
            {currentTab === 'superadmin' ? 'Super Admin Dashboard' : currentTab.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
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
              currentTab === 'parse' ? <PasteAndParse /> :
              currentTab === 'single' ? <CreateOrder /> :
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
