
import React, { useState, useEffect } from 'react';
import { RepairRequest, RepairStatus, ShopInfo, ServiceProduct } from './types';
import RepairForm from './components/RepairForm';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import ShopSettingsForm from './components/ShopSettingsForm';
import ServiceManagement from './components/ServiceManagement';
import CustomerTracking from './components/CustomerTracking';
import { BellIcon, ChartBarIcon, LockIcon, ToolIcon, CogIcon, CheckCircleIcon, SpinnerIcon } from './components/Icons';
import { fetchRequestsFromSheets, saveRequestToSheets, updateRequestStatusInSheets } from './services/googleSheetsService';

const DEFAULT_SHOP_INFO: ShopInfo = {
  name: 'TECHNICAL AUTO SERVICE',
  tagline: 'บริการแจ้งซ่อมรถยนต์อัจฉริยะ ด้วยระบบวิเคราะห์ AI แม่นยำ ทันใจ มั่นใจทุกเส้นทาง',
  address: 'เลขที่ 123 ถนนสุขุมวิท เขตบางนา กรุงเทพมหานคร 10260',
  phone: '02-123-4567',
  openHours: 'จันทร์ - เสาร์ 08:30 - 18:00'
};

const DEFAULT_SERVICES: ServiceProduct[] = [
  { id: '1', name: 'เปลี่ยนน้ำมันเครื่อง', description: 'สังเคราะห์แท้ 100% พร้อมไส้กรองพรีเมียม', basePrice: 1500, category: 'Maintenance', icon: '🛢️' },
  { id: '2', name: 'ตรวจเช็คระบบเบรก', description: 'ดูแลจานเบรกและผ้าเบรกด้วยมาตรฐานศูนย์', basePrice: 800, category: 'Repair', icon: '🛑' },
  { id: '3', name: 'ล้างห้องเครื่อง', description: 'สะอาดหมดจดด้วยน้ำยาขจัดคราบพิเศษ', basePrice: 450, category: 'Cleaning', icon: '✨' },
];

// ล็อค URL ตามที่ผู้ใช้ระบุ (ถาวร)
const PERMANENT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4WRaIu63c48juKVVREkJUPqlkXXRpTXE9OxRYdwwmvmrozPp6JZnSz3tIqYCKZRnA/exec';

const GAS_CODE_FIXED = `/**
 * โค้ดนี้สำหรับวางใน Google Apps Script
 * สำคัญ: ต้อง Deploy เป็น Web App / Execute as: Me / Who has access: Anyone
 */
function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var result = [];
  if (data.length > 1) {
    var headers = data[0];
    for (var i = 1; i < data.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var value = data[i][j];
        if (value instanceof Date) value = value.toISOString();
        obj[headers[j]] = value;
      }
      result.push(obj);
    }
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["id", "customerName", "phoneNumber", "carBrand", "carModel", "serviceType", "description", "status", "createdAt", "estimatedCost", "aiDiagnosis", "imageUrl"]);
  }

  if (payload.action === 'updateStatus') {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == payload.id) {
        sheet.getRange(i + 1, 8).setValue(payload.status);
        return ContentService.createTextOutput("Updated");
      }
    }
  } else {
    sheet.appendRow([
      payload.id, payload.customerName, payload.phoneNumber, payload.carBrand, payload.carModel, 
      payload.serviceType, payload.description, payload.status, payload.createdAt, 
      payload.estimatedCost || "", payload.aiDiagnosis || "", payload.imageUrl || ""
    ]);
    return ContentService.createTextOutput("Added");
  }
}`;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'admin' | 'track'>('request');
  const [adminSubTab, setAdminSubTab] = useState<'history' | 'shop' | 'products' | 'system'>('history');
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [services, setServices] = useState<ServiceProduct[]>(() => {
    const saved = localStorage.getItem('service_products');
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });
  const [selectedService, setSelectedService] = useState<ServiceProduct | null>(null);
  
  const [scriptUrl] = useState<string>(PERMANENT_SCRIPT_URL);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean | null>(null);
  
  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => {
    const saved = localStorage.getItem('shop_info');
    return saved ? JSON.parse(saved) : DEFAULT_SHOP_INFO;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    const data = await fetchRequestsFromSheets(scriptUrl);
    if (data !== null) {
      setRequests(data);
      localStorage.setItem('repair_requests', JSON.stringify(data));
      setIsCloudConnected(true);
    } else {
      setIsCloudConnected(false);
      const saved = localStorage.getItem('repair_requests');
      if (saved) setRequests(JSON.parse(saved));
    }
    setIsRefreshing(false);
  };

  useEffect(() => { loadData(); }, [scriptUrl]);

  const handleAddRequest = async (newRequest: RepairRequest) => {
    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem('repair_requests', JSON.stringify(updatedRequests));
    
    const success = await saveRequestToSheets(scriptUrl, newRequest);
    if (success) {
      console.log("Synced with Google Sheets");
    }
    
    alert(`ลงทะเบียนสำเร็จ!\nระบบได้บันทึกข้อมูลของคุณไว้ในคลาวด์แล้ว`);
    setSelectedService(null);
    setActiveTab('track');
  };

  const handleUpdateStatus = async (id: string, status: RepairStatus) => {
    const updated = requests.map(req => req.id === id ? { ...req, status } : req);
    setRequests(updated);
    localStorage.setItem('repair_requests', JSON.stringify(updated));
    await updateRequestStatusInSheets(scriptUrl, id, status);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30 selection:text-white">
      <Header 
        isConnected={isCloudConnected === true} 
        isAdmin={isAdmin} 
        onLogout={() => setIsAdmin(false)} 
        shopInfo={shopInfo} 
        onAdminClick={() => { setActiveTab('admin'); if(!isAdmin) setAdminSubTab('history'); }}
        onTrackClick={() => setActiveTab('track')}
        onHomeClick={() => setActiveTab('request')}
      />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* แจ้งเตือนถ้าเชื่อมต่อคลาวด์ไม่ได้ */}
          {isCloudConnected === false && activeTab !== 'admin' && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📡</span>
                <span className="text-xs font-bold text-rose-400">ไม่สามารถเชื่อมต่อ Google Sheets ได้ (กำลังใช้ข้อมูลสำรองในเครื่อง)</span>
              </div>
              <button onClick={loadData} className="text-[10px] font-black uppercase text-rose-500 px-3 py-1 bg-rose-500/10 rounded-lg">Reconnect</button>
            </div>
          )}

          <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl min-h-[600px] animate-fade-in">
            {activeTab === 'request' && (
              <div className="p-4 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                  <div className="md:w-1/3 space-y-8">
                    <div className="technical-border p-6 bg-slate-800/50 rounded-2xl">
                       <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">{shopInfo.name}</h2>
                       <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">{shopInfo.tagline}</p>
                       <div className="space-y-3 pt-6 border-t border-slate-700">
                         <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                           <span className="text-blue-500">📞</span> {shopInfo.phone}
                         </div>
                       </div>
                    </div>
                    {!selectedService && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">บริการยอดนิยม</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {services.map(s => (
                            <button key={s.id} onClick={() => setSelectedService(s)} className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all rounded-2xl text-left group">
                              <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                              <div className="flex-1">
                                <div className="text-sm font-bold text-white">{s.name}</div>
                                <div className="text-[10px] text-blue-400 font-semibold">เริ่ม {s.basePrice.toLocaleString()}.-</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-slate-800/30 p-4 md:p-8 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ToolIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">ลงทะเบียนแจ้งซ่อม</h3>
                    </div>
                    <RepairForm onSubmit={handleAddRequest} preSelectedService={selectedService} onClearSelection={() => setSelectedService(null)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'track' && (
              <div className="p-4 md:p-12">
                <CustomerTracking 
                  requests={requests} 
                  onRefresh={loadData} 
                  isRefreshing={isRefreshing} 
                />
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="p-4 md:p-12">
                {isAdmin ? (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                          <ChartBarIcon className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Admin Dashboard</h2>
                      </div>
                      <div className="flex flex-wrap gap-2 p-1 bg-slate-800 rounded-2xl border border-white/5 w-full sm:w-auto">
                        <button onClick={() => setAdminSubTab('history')} className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${adminSubTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>รายการซ่อม</button>
                        <button onClick={() => setAdminSubTab('products')} className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${adminSubTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>คลังบริการ</button>
                        <button onClick={() => setAdminSubTab('shop')} className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${adminSubTab === 'shop' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>หน้าร้าน</button>
                        <button onClick={() => setAdminSubTab('system')} className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${adminSubTab === 'system' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>คลาวด์</button>
                      </div>
                    </div>
                    <div className="animate-fade-in">
                      {adminSubTab === 'history' && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center px-2">
                             <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Repair Queue History</div>
                             <button onClick={loadData} disabled={isRefreshing} className="text-[10px] font-bold text-blue-400 flex items-center gap-2">
                               {isRefreshing ? 'Refreshing...' : 'Refresh'}
                             </button>
                          </div>
                          <Dashboard requests={requests} onUpdateStatus={handleUpdateStatus} />
                        </div>
                      )}
                      {adminSubTab === 'products' && <ServiceManagement services={services} onSave={(s) => { setServices(s); localStorage.setItem('service_products', JSON.stringify(s)); }} />}
                      {adminSubTab === 'shop' && <ShopSettingsForm initialInfo={shopInfo} onSave={(i) => { setShopInfo(i); localStorage.setItem('shop_info', JSON.stringify(i)); }} />}
                      {adminSubTab === 'system' && (
                        <div className="max-w-4xl mx-auto py-10 space-y-10">
                          <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/5 space-y-6">
                             <h3 className="text-xl font-bold text-white tracking-tight">Google Sheets Connection</h3>
                             <div className={`p-4 rounded-xl border flex items-center gap-4 ${isCloudConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                               <div className={`w-3 h-3 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                               <span className="font-bold uppercase tracking-widest text-xs">{isCloudConnected ? 'Connected Successfully' : 'Connection Failed'}</span>
                             </div>
                             <p className="text-xs text-slate-500">URL ที่ใช้งานปัจจุบัน:</p>
                             <div className="p-4 bg-slate-950 rounded-xl border border-white/5 font-mono text-[9px] text-slate-500 break-all">
                               {PERMANENT_SCRIPT_URL}
                             </div>
                          </div>

                          <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 space-y-4">
                             <div className="flex justify-between items-center mb-4">
                               <h4 className="text-sm font-bold text-white uppercase tracking-widest">Backend Script Code</h4>
                               <button onClick={() => { navigator.clipboard.writeText(GAS_CODE_FIXED); alert('คัดลอกโค้ดแล้ว'); }} className="text-[10px] font-bold text-blue-400">Copy Code</button>
                             </div>
                             <pre className="bg-slate-950 p-6 rounded-2xl overflow-auto font-mono text-[9px] text-slate-500 max-h-60">{GAS_CODE_FIXED}</pre>
                             <p className="text-[10px] text-slate-500 leading-relaxed italic">หากแอปไม่ทำงาน: ให้ตรวจสอบว่าคุณได้ Deploy สคริปต์นี้ใน Google Apps Script แล้ว และตั้งค่าเป็น "Anyone" (ทุกคนเข้าถึงได้) หรือไม่</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <LoginForm onLogin={() => setIsAdmin(true)} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-white/5">
        <div className="container mx-auto px-4 text-center space-y-4">
           <div className="flex justify-center items-center gap-6">
             <button onClick={() => setActiveTab('request')} className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'request' ? 'text-blue-500' : 'text-slate-600'}`}>หน้าหลัก</button>
             <button onClick={() => setActiveTab('track')} className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'track' ? 'text-blue-500' : 'text-slate-600'}`}>ติดตามสถานะ</button>
             <button onClick={() => { setActiveTab('admin'); if(!isAdmin) setAdminSubTab('history'); }} className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'admin' ? 'text-blue-500' : 'text-slate-600'}`}>Admin</button>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
