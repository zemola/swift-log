import { useState } from 'react';
import PasteAndParse from './components/PasteAndParse';
import DispatcherDashboard from './components/DispatcherDashboard';
import Onboarding from './components/Onboarding';
import CreateOrder from './components/CreateOrder';
import Finance from './components/Finance';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CompleteRegistration from './components/CompleteRegistration';
import { LogOut } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState('parse');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
  };

  //useEffect to check if user is authenticated


  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

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
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const userRole = localStorage.getItem('userRole');

  if (userRole === 'SuperAdmin') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">L</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">SwiftLogistics (Super Admin)</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <SuperAdminDashboard />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">L</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SwiftLogistics</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 font-medium px-3 py-1 bg-slate-100 rounded-full">
              Tenant: <span className="text-slate-800">Acme Logistics Ltd</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-indigo-200 flex justify-center items-center overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sub Header / Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4 h-12 items-center">
          <button
            onClick={() => setCurrentTab('parse')}
            className={`text-sm font-medium h-full border-b-2 flex items-center px-2 transition-colors ${currentTab === 'parse' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Paste & Parse
          </button>
          <button
            onClick={() => setCurrentTab('single')}
            className={`text-sm font-medium h-full border-b-2 flex items-center px-2 transition-colors ${currentTab === 'single' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Single Order
          </button>
          <button
            onClick={() => setCurrentTab('dispatch')}
            className={`text-sm font-medium h-full border-b-2 flex items-center px-2 transition-colors ${currentTab === 'dispatch' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Dispatcher Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('finance')}
            className={`text-sm font-medium h-full border-b-2 flex items-center px-2 transition-colors ${currentTab === 'finance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Finance
          </button>
          <button
            onClick={() => setCurrentTab('onboarding')}
            className={`text-sm font-medium h-full border-b-2 flex items-center px-2 transition-colors ${currentTab === 'onboarding' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Onboarding
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {currentTab === 'parse' ? <PasteAndParse /> :
          currentTab === 'single' ? <CreateOrder /> :
            currentTab === 'dispatch' ? <DispatcherDashboard /> :
              currentTab === 'finance' ? <Finance /> :
                <Onboarding />}
      </main>
    </div>
  );
}

export default App;
