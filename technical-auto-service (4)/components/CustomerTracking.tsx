
import React, { useState, useMemo } from 'react';
import { RepairRequest, RepairStatus } from '../types';
import StatusBadge from './StatusBadge';
import { SpinnerIcon, ToolIcon } from './Icons';

interface CustomerTrackingProps {
  requests: RepairRequest[];
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const CustomerTracking: React.FC<CustomerTrackingProps> = ({ requests, onRefresh, isRefreshing }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleRefresh = async () => {
    setHasError(false);
    if (onRefresh) {
      try {
        await onRefresh();
      } catch (err) {
        setHasError(true);
      }
    }
  };

  const filteredRequests = useMemo(() => {
    // Normalizing search query: remove spaces and convert to lowercase
    const cleanQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
    
    const allRequests = [...requests].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    if (!cleanQuery) return allRequests;

    return allRequests.filter(r => {
      // Deep data normalization for reliable searching
      const name = (r.customerName || '').toString().toLowerCase().replace(/\s+/g, '');
      const phone = (r.phoneNumber || '').toString().replace(/[^0-9]/g, '');
      const brand = (r.carBrand || '').toString().toLowerCase().replace(/\s+/g, '');
      const model = (r.carModel || '').toString().toLowerCase().replace(/\s+/g, '');
      const id = (r.id || '').toString().toLowerCase();
      
      const queryNumeric = cleanQuery.replace(/[^0-9]/g, '');

      // Check if query matches any field
      const matchesName = name.includes(cleanQuery);
      const matchesBrand = brand.includes(cleanQuery);
      const matchesModel = model.includes(cleanQuery);
      const matchesId = id.includes(cleanQuery);
      
      // Phone match logic: if search query contains numbers, check against normalized phone
      const matchesPhone = queryNumeric.length > 0 && phone.includes(queryNumeric);

      return matchesName || matchesBrand || matchesModel || matchesId || matchesPhone;
    });
  }, [requests, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Live Status Updates</span>
        </div>
        <h2 className="text-5xl font-black text-white tracking-tight uppercase">ติดตามงานซ่อม</h2>
        <p className="text-slate-400 text-sm font-medium max-w-lg mx-auto leading-relaxed">
          ป้อนชื่อของคุณ หรือ ทะเบียนรถ เพื่อดูสถานะการซ่อมล่าสุด
        </p>
      </div>

      {/* Connection Error Warning */}
      {(!requests.length && !isRefreshing && searchQuery === '') && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
             <span className="text-xl">⚠️</span>
             <div>
               <div className="text-xs font-bold text-rose-400 uppercase tracking-widest">การเชื่อมต่อขัดข้อง</div>
               <p className="text-[10px] text-slate-400 font-medium">ไม่สามารถดึงข้อมูลจาก Cloud ได้ โปรดตรวจสอบการตั้งค่า Script URL หรือลองใหม่อีกครั้ง</p>
             </div>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-rose-500 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-rose-600 transition-all"
          >
            ลองใหม่
          </button>
        </div>
      )}

      {/* Advanced Search Bar */}
      <div className="relative group max-w-3xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex flex-col md:flex-row gap-4 items-center bg-slate-900 border border-white/10 p-3 rounded-[2.2rem] shadow-2xl">
          <div className="relative flex-1 w-full">
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="พิมพ์ชื่อลูกค้า หรือ ทะเบียนรถ..."
              className="w-full pl-14 pr-12 py-5 bg-slate-950 border border-slate-800 rounded-[1.8rem] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-white text-lg font-bold transition-all placeholder:text-slate-700 placeholder:font-medium"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full md:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isRefreshing ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'ดึงข้อมูล'}
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-6 gap-4">
        <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
          {searchQuery ? (
            <span className="flex items-center gap-2">
              พบ <span className="text-blue-400 text-sm">{filteredRequests.length}</span> งานที่ตรงกับการค้นหา
            </span>
          ) : (
            `งานซ่อมทั้งหมด (${requests.length})`
          )}
        </div>
        <div className="flex gap-6">
           {[{color: 'bg-amber-500', label: 'รอรับรถ'}, {color: 'bg-blue-500', label: 'กำลังซ่อม'}, {color: 'bg-emerald-500', label: 'พร้อมส่ง'}].map(item => (
             <div key={item.label} className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${item.color}`}></div>
               <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{item.label}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {isRefreshing ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
            <SpinnerIcon className="w-12 h-12 animate-spin text-blue-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">กำลังดึงสถานะล่าสุด...</span>
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 hover:bg-slate-900/60 transition-all group hover:border-blue-500/30 shadow-xl flex flex-col justify-between gap-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                 <StatusBadge status={req.status} />
               </div>
               
               <div className="space-y-4">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                     {req.serviceType === 'Repair' ? '🔧' : '🚗'}
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-white tracking-tight leading-tight">{req.customerName}</h3>
                     <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                       <span className="w-3 h-[2px] bg-blue-500"></span>
                       {req.carBrand} {req.carModel.split('/')[0]}
                     </div>
                   </div>
                 </div>
               </div>

               <div className="flex items-center justify-between pt-6 border-t border-white/5">
                 <div className="space-y-1">
                   <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">ข้อมูลรับเข้า</div>
                   <div className="text-xs font-bold text-slate-300">
                     {new Date(req.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} • {new Date(req.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Ticket ID</div>
                   <div className="text-xs font-mono font-bold text-slate-500">#{req.id.split('-')[0]}</div>
                 </div>
               </div>
               
               <div className="absolute bottom-0 left-0 h-[4px] bg-white/5 w-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-1000 ${
                     req.status === RepairStatus.PENDING ? 'w-1/3 bg-amber-500' : 
                     req.status === RepairStatus.IN_PROGRESS ? 'w-2/3 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 
                     'w-full bg-emerald-500'
                   }`}
                 />
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-900/20 rounded-[4rem] border-2 border-dashed border-slate-800">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <ToolIcon className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">ไม่พบข้อมูล</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-xs text-center leading-relaxed">
              {searchQuery ? `ไม่พบรายการที่ตรงกับ "${searchQuery}"` : 'ยังไม่มีข้อมูลงานซ่อมในระบบ'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-8 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                ล้างการค้นหา
              </button>
            )}
          </div>
        )}
      </div>

      <div className="text-center pb-20">
        <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.5em] leading-relaxed">
          Technical Auto Service • Smart Monitoring<br/>
          Secure & Private Service Tracking
        </p>
      </div>
    </div>
  );
};

export default CustomerTracking;
