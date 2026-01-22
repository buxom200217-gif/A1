
import React, { useState } from 'react';
import { ServiceProduct } from '../types';
import { SpinnerIcon } from './Icons';

interface ServiceManagementProps {
  services: ServiceProduct[];
  onSave: (services: ServiceProduct[]) => void;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({ services, onSave }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceProduct>>({});

  const handleEdit = (service: ServiceProduct) => {
    setEditingId(service.id);
    setFormData(service);
  };

  const handleAddNew = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setEditingId(newId);
    setFormData({
      id: newId,
      name: '',
      description: '',
      basePrice: 0,
      category: 'Maintenance',
      icon: '🛠️'
    });
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    let updated;
    if (services.find(s => s.id === editingId)) {
      updated = services.map(s => s.id === editingId ? (formData as ServiceProduct) : s);
    } else {
      updated = [...services, formData as ServiceProduct];
    }
    
    onSave(updated);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      onSave(services.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-white">จัดการรายการบริการหน้าแอป</h3>
        <button 
          onClick={handleAddNew}
          className="bg-blue-700 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center gap-2"
        >
          <span>+ เพิ่มบริการใหม่</span>
        </button>
      </div>

      {editingId && (
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-500/30 animate-fade-in mb-8 shadow-2xl">
          <h4 className="font-black text-black text-lg mb-6 border-b pb-4 border-slate-100">
            {services.find(s => s.id === editingId) ? 'แก้ไขข้อมูลบริการ' : 'เพิ่มบริการใหม่'}
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-black text-black mb-2 uppercase tracking-widest">ไอคอน (Emoji)</label>
              <input 
                value={formData.icon} 
                onChange={e => setFormData({...formData, icon: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:border-blue-500 outline-none transition-all"
                placeholder="เช่น 🚗"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-black mb-2 uppercase tracking-widest">หมวดหมู่</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value as any})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="Maintenance">บำรุงรักษา (Maintenance)</option>
                <option value="Repair">ซ่อมแซม (Repair)</option>
                <option value="Cleaning">ทำความสะอาด (Cleaning)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-black mb-2 uppercase tracking-widest">ชื่อบริการ</label>
              <input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:border-blue-500 outline-none transition-all"
                placeholder="ระบุชื่อเรียกบริการ..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-black mb-2 uppercase tracking-widest">รายละเอียดสินค้า/บริการ</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:border-blue-500 outline-none transition-all"
                rows={2}
                placeholder="อธิบายรายละเอียดการให้บริการเบื้องต้น..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-black mb-2 uppercase tracking-widest">ราคาเริ่มต้น (บาท)</label>
              <input 
                type="number"
                value={formData.basePrice} 
                onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all uppercase tracking-widest text-xs">บันทึกข้อมูล</button>
            <button onClick={() => setEditingId(null)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-xl font-black hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">ยกเลิก</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="text-3xl bg-slate-950 w-14 h-14 flex items-center justify-center rounded-xl shadow-inner border border-white/5">{service.icon}</div>
              <div>
                <div className="font-black text-white">{service.name}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{service.category} • {service.basePrice.toLocaleString()}.-</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(service)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="แก้ไข">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button onClick={() => handleDelete(service.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="ลบ">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {services.length === 0 && !editingId && (
        <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800 text-slate-500 font-bold uppercase tracking-widest text-xs">
          ยังไม่มีรายการสินค้า/บริการ กรุณาเพิ่มรายการใหม่
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
