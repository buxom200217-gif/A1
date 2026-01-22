
import React, { useState } from 'react';
import { RepairRequest, RepairStatus } from '../types';
import StatusBadge from './StatusBadge';
import { SpinnerIcon, CameraIcon } from './Icons';

interface DashboardProps {
  requests: RepairRequest[];
  onUpdateStatus: (id: string, status: RepairStatus) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ requests, onUpdateStatus }) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: RepairStatus) => {
    setUpdatingId(id);
    await onUpdateStatus(id, status);
    setUpdatingId(null);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-24 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
        <div className="text-5xl mb-6 opacity-30">📂</div>
        <p className="text-slate-300 font-bold text-lg">ยังไม่มีข้อมูลในระบบ</p>
        <p className="text-slate-500 text-xs mt-2 font-medium">รอการแจ้งซ่อมใหม่จากหน้าหลัก</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 relative">
      {/* Image Modal Preview */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl glass-panel group">
            <img src={selectedImage} className="w-full h-full object-contain bg-slate-900" alt="Full Preview" />
            <div className="scan-animation"></div>
            <button 
              className="absolute top-6 right-6 bg-slate-800/80 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10 hover:bg-rose-500 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              CLOSE PREVIEW
            </button>
          </div>
        </div>
      )}

      {requests.map((req) => (
        <div key={req.id} className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 md:p-8 hover:bg-slate-800/50 transition-all group relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="flex-1 space-y-5">
              <div className="flex flex-wrap items-center gap-4">
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(req.createdAt).toLocaleString('th-TH')}</div>
                 <div className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${req.serviceType === 'Service' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                   {req.serviceType}
                 </div>
                 <div className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-white/5 uppercase tracking-tighter">
                   ID: {req.id}
                 </div>
                 {req.estimatedCost && (
                   <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                     EST. {req.estimatedCost.toLocaleString()}.-
                   </div>
                 )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Visual Assessment Part */}
                {req.imageUrl && (
                  <div className="w-full sm:w-40 h-32 flex-shrink-0 relative group/img cursor-zoom-in" onClick={() => setSelectedImage(req.imageUrl!)}>
                    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
                      <img src={req.imageUrl} className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-all group-hover/img:scale-110" alt="Car Visual" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                         <div className="flex items-center gap-1.5 text-[8px] font-bold text-white uppercase tracking-widest">
                           <CameraIcon className="w-3 h-3" /> Visual Data
                         </div>
                      </div>
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg border border-white/20">
                      <span className="text-[10px]">🔍</span>
                    </div>
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold bg-white text-slate-950 px-2.5 py-1 rounded-md uppercase tracking-tight">{req.carBrand}</span>
                    <h3 className="text-xl font-bold text-white tracking-tight leading-none">{req.carModel}</h3>
                  </div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed italic border-l-2 border-slate-700 pl-4">"{req.description}"</p>
                </div>
              </div>

              {req.aiDiagnosis && (
                <div className="flex items-start gap-3 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                  <span className="text-lg">🤖</span>
                  <div>
                    <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-1">AI Smart Diagnosis</div>
                    <p className="text-[11px] font-semibold text-slate-300 leading-relaxed">{req.aiDiagnosis}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8 space-y-6">
               <div className="space-y-1.5">
                 <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Customer Details</div>
                 <div className="text-sm font-bold text-white leading-none">{req.customerName}</div>
                 <div className="text-xs text-blue-400 font-bold">{req.phoneNumber}</div>
               </div>

               <div className="space-y-4 pt-4 border-t border-white/5">
                 <div className="flex items-center gap-3">
                   <StatusBadge status={req.status} />
                   {updatingId === req.id && <SpinnerIcon className="w-4 h-4 animate-spin text-blue-500" />}
                 </div>
                 
                 <div className="relative">
                   <select 
                     value={req.status} 
                     disabled={updatingId === req.id}
                     onChange={(e) => handleStatusChange(req.id, e.target.value as RepairStatus)}
                     className="w-full text-[10px] font-bold border border-slate-700 rounded-xl px-4 py-3 bg-slate-900 text-white appearance-none focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer disabled:opacity-50 transition-all hover:border-blue-500/50"
                   >
                     <option value={RepairStatus.PENDING}>⏳ รอรับรถ (Pending)</option>
                     <option value={RepairStatus.IN_PROGRESS}>🔧 กำลังซ่อม (In Progress)</option>
                     <option value={RepairStatus.COMPLETED}>✅ เสร็จสิ้น (Completed)</option>
                     <option value={RepairStatus.CANCELLED}>❌ ยกเลิก (Cancelled)</option>
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path></svg>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
