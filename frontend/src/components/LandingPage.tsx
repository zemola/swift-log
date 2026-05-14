import { ArrowRight, Truck, BarChart3, Shield, Users } from 'lucide-react';

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Glass Card Container */}
      <div className="max-w-6xl w-full bg-white/70 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden z-10">
        
        {/* Navigation */}
        <nav className="flex justify-between items-center px-8 py-6 border-b border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">L</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SwiftLogistics</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-purple-600 transition-colors">Features</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Pricing</a>
            <a href="#" className="hover:text-purple-600 transition-colors">About</a>
          </div>
          <button 
            onClick={onGetStarted}
            className="px-5 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-md hover:shadow-purple-200"
          >
            Get Started
          </button>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-12 items-center">
          
          {/* Left Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full text-purple-700 text-xs font-semibold">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              Next-Gen Logistics Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Your Logistics, <br />
              <span className="text-purple-600">Smarter</span> Every Day
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              Experience the ultimate elegance in delivery management. SwiftLogistics orchestrates your global assets with precision analytics, automated routing, and bank-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onGetStarted}
                className="inline-flex justify-center items-center gap-2 px-6 py-3.5 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-lg hover:shadow-purple-200"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
              <button className="inline-flex justify-center items-center gap-2 px-6 py-3.5 text-base font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm">
                View Demo
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://ui-avatars.com/api/?name=J+D&background=7C3AED&color=fff" alt="" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://ui-avatars.com/api/?name=A+S&background=C084FC&color=fff" alt="" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://ui-avatars.com/api/?name=M+K&background=0F172A&color=fff" alt="" />
              </div>
              <p className="text-sm text-slate-500"><span className="font-bold text-slate-900">120k+</span> Orders processed this month</p>
            </div>
          </div>

          {/* Right Column (Mockup/Visual) */}
          <div className="relative">
            <div className="bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-2xl p-6 border border-white/50 shadow-inner">
              {/* Fake Dashboard Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Total Revenue</p>
                    <p className="text-3xl font-bold text-slate-900">$124,592.45</p>
                    <p className="text-xs text-green-600 font-medium">+12.4% this month</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                </div>
                
                {/* Fake Chart */}
                <div className="h-40 flex items-end justify-between gap-2">
                  <div className="w-full bg-purple-200 h-12 rounded-t-md"></div>
                  <div className="w-full bg-purple-300 h-24 rounded-t-md"></div>
                  <div className="w-full bg-purple-400 h-16 rounded-t-md"></div>
                  <div className="w-full bg-purple-600 h-32 rounded-t-md"></div>
                  <div className="w-full bg-indigo-600 h-40 rounded-t-md"></div>
                  <div className="w-full bg-purple-400 h-20 rounded-t-md"></div>
                  <div className="w-full bg-purple-200 h-10 rounded-t-md"></div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-white p-3 rounded-lg shadow-lg border border-white/20 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Secure Delivery</p>
                  <p className="text-xs text-slate-500">100% Guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 lg:p-12 border-t border-white/20">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-2">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Smart Routing</h3>
            <p className="text-sm text-slate-600">Optimize delivery routes automatically to save time and fuel.</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-2">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Team Management</h3>
            <p className="text-sm text-slate-600">Onboard and manage dispatchers and riders with ease.</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-2">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Real-time Analytics</h3>
            <p className="text-sm text-slate-600">Track orders and performance with beautiful, interactive charts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
