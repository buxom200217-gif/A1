
import React from 'react';
import { ToolIcon, LogoutIcon, ChartBarIcon, CameraIcon } from './Icons';
import { ShopInfo } from '../types';

interface HeaderProps {
  isConnected: boolean;
  isAdmin: boolean;
  onLogout: () => void;
  shopInfo: ShopInfo;
  onAdminClick: () => void;
  onTrackClick: () => void;
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isConnected, isAdmin, onLogout, shopInfo, onAdminClick, onTrackClick, onHomeClick }) => {
  return (
    <header className="glass-panel border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-5 cursor-pointer" onClick={onHomeClick}>
          <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 transform rotate-3">
            <ToolIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight uppercase leading-none">{shopInfo.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                {isConnected ? 'Sync Active' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>
        
        <nav className="flex items-center gap-4">
          <button 
            onClick={onTrackClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            🔍 ติดตามสถานะ
          </button>

          {!isAdmin ? (
            <button 
              onClick={onAdminClick}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <ChartBarIcon className="w-4 h-4" />
              Staff Only
            </button>
          ) : (
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-500/5"
            >
              <LogoutIcon className="w-4 h-4" />
              Sign Out
            </button>
          )}
          <div className="w-[1px] h-8 bg-white/10 mx-2 hidden sm:block"></div>
          <button className="hidden sm:flex items-center gap-2 bg-white text-slate-950 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl">
             สายด่วนฉุกเฉิน
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
