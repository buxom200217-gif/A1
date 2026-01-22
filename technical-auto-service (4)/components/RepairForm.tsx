
import React, { useState, useRef, useEffect } from 'react';
import { RepairRequest, RepairStatus, DiagnosisResult, ServiceProduct } from '../types';
import { getSmartDiagnosis } from '../services/geminiService';
import { CameraIcon, SpinnerIcon } from './Icons';

interface RepairFormProps {
  onSubmit: (request: RepairRequest) => void;
  preSelectedService?: ServiceProduct | null;
  onClearSelection?: () => void;
}

const CAR_BRANDS = ["Toyota", "Honda", "Isuzu", "Mitsubishi", "Mazda", "Ford", "Nissan", "MG", "Suzuki", "BMW", "Mercedes-Benz", "BYD", "Other"];

const RepairForm: React.FC<RepairFormProps> = ({ onSubmit, preSelectedService, onClearSelection }) => {
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [otherBrand, setOtherBrand] = useState('');
  const [serviceType, setServiceType] = useState<'Service' | 'Repair'>('Service');
  const [description, setDescription] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (preSelectedService) {
      setServiceType(preSelectedService.category === 'Repair' ? 'Repair' : 'Service');
      setDescription(preSelectedService.name + ': ' + preSelectedService.description);
    }
  }, [preSelectedService]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runDiagnosis = async () => {
    const brand = selectedBrand === 'Other' ? otherBrand : selectedBrand;
    if (!description || !brand) {
      alert("กรุณาระบุยี่ห้อและอาการก่อนให้ AI วิเคราะห์");
      return;
    }
    setAiAnalyzing(true);
    setDiagnosis(null);
    const result = await getSmartDiagnosis(description, brand, serviceType, previewImage || undefined);
    setDiagnosis(result);
    setAiAnalyzing(false);
  };

  const generateDateId = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    // รูปแบบ DDMMYYYY-HHMMSS เพื่อความเป็นเอกลักษณ์และระบุวันเวลาได้ในตัว
    return `${day}${month}${year}-${hours}${minutes}${seconds}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const brand = selectedBrand === 'Other' ? otherBrand : selectedBrand;
    if (!brand) return alert("กรุณาเลือกยี่ห้อรถ");

    const formData = new FormData(e.target as HTMLFormElement);
    const newRequest: RepairRequest = {
      id: generateDateId(),
      customerName: formData.get('customerName') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      carBrand: brand,
      carModel: formData.get('carModel') as string,
      serviceType,
      description,
      status: RepairStatus.PENDING,
      createdAt: new Date().toISOString(),
      aiDiagnosis: diagnosis?.possibleIssue,
      estimatedCost: diagnosis ? parseFloat(diagnosis.estimatedCostRange.replace(/[^0-9.]/g, '')) : (preSelectedService?.basePrice || undefined),
      imageUrl: previewImage || undefined
    };

    setLoading(true);
    setTimeout(() => {
      onSubmit(newRequest);
      setLoading(false);
      resetForm();
    }, 1200);
  };

  const resetForm = () => {
    formRef.current?.reset();
    setSelectedBrand('');
    setPreviewImage(null);
    setDiagnosis(null);
    setDescription('');
    if (onClearSelection) onClearSelection();
  };

  const darkInput = "w-full px-5 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-white font-semibold transition-all placeholder:text-slate-600";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-10 animate-fade-in">
      {preSelectedService && (
        <div className="bg-blue-600/10 border border-blue-500/30 p-5 rounded-2xl flex items-center justify-between animate-scale-in">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{preSelectedService.icon}</span>
            <div>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Selected Service</div>
              <div className="text-sm font-bold text-white">{preSelectedService.name}</div>
            </div>
          </div>
          <button type="button" onClick={onClearSelection} className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase">ยกเลิก</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ชื่อผู้แจ้ง</label>
          <input name="customerName" required className={darkInput} placeholder="เช่น คุณวิชัย ใจดี" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">เบอร์โทรศัพท์</label>
          <input name="phoneNumber" type="tel" required className={darkInput} placeholder="08x-xxx-xxxx" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ยี่ห้อรถ</label>
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} required className={darkInput + " appearance-none cursor-pointer"}>
            <option value="" disabled className="bg-slate-900">เลือกยี่ห้อ...</option>
            {CAR_BRANDS.map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
          </select>
          {selectedBrand === 'Other' && (
            <input value={otherBrand} onChange={(e) => setOtherBrand(e.target.value)} required className={darkInput + " mt-3"} placeholder="ระบุยี่ห้อรถ..." />
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">รุ่นรถ / ทะเบียน</label>
          <input name="carModel" required className={darkInput} placeholder="เช่น Camry / 2กข 5555" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-700/50">
          <button type="button" onClick={() => setServiceType('Service')} className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-bold uppercase transition-all ${serviceType === 'Service' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Checkup / Service</button>
          <button type="button" onClick={() => setServiceType('Repair')} className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-bold uppercase transition-all ${serviceType === 'Repair' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>Repair / แจ้งซ่อม</button>
        </div>
        <textarea 
          value={description} onChange={e => setDescription(e.target.value)} required rows={4} 
          className="w-full px-5 py-5 bg-slate-900/50 border border-slate-700 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-white font-medium transition-all"
          placeholder="ระบุอาการเบื้องต้น หรือ สิ่งที่ต้องการให้ดูแล..."
        ></textarea>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">รูปภาพประกอบ (Optional)</label>
           <div className="relative group aspect-video rounded-3xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-700 hover:border-blue-500 transition-all cursor-pointer">
              {previewImage ? (
                <div className="relative w-full h-full">
                   <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                   {aiAnalyzing && <div className="scan-animation"></div>}
                   <button type="button" onClick={() => setPreviewImage(null)} className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-xl text-[10px] font-bold uppercase">ลบ</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full text-slate-500">
                  <CameraIcon className="w-8 h-8 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">อัปโหลดรูป</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
           </div>
        </div>

        <div className="space-y-4 pt-4">
           <button 
             type="button" onClick={runDiagnosis} disabled={aiAnalyzing}
             className={`w-full py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border shadow-xl ${aiAnalyzing ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-950 text-blue-400 border-blue-500/30 hover:bg-slate-900'}`}
           >
             {aiAnalyzing ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : '✨ AI SMART DIAGNOSIS'}
           </button>
           
           {diagnosis && (
             <div className="bg-gradient-to-br from-indigo-950 to-slate-950 p-6 rounded-3xl border border-indigo-500/30 ai-glow animate-scale-in">
                <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-3">AI Analysis Result</div>
                <div className="text-white font-bold text-sm leading-relaxed mb-4">{diagnosis.possibleIssue}</div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div>
                     <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">ความเร่งด่วน</div>
                     <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${diagnosis.urgency === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{diagnosis.urgency}</span>
                   </div>
                   <div className="text-right">
                     <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">ประเมินราคา</div>
                     <div className="text-indigo-400 font-bold text-lg leading-none tracking-tight">{diagnosis.estimatedCostRange} <span className="text-[10px]">บาท</span></div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>

      <button 
        type="submit" disabled={loading}
        className={`w-full py-6 rounded-3xl text-white font-bold text-xl shadow-2xl transition-all active:scale-[0.98] mt-6 tracking-tight ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-500/20 shadow-lg shadow-blue-500/10'}`}
      >
        {loading ? <SpinnerIcon className="w-8 h-8 animate-spin mx-auto" /> : 'ยืนยันการจองคิว / แจ้งซ่อม'}
      </button>
    </form>
  );
};

export default RepairForm;
