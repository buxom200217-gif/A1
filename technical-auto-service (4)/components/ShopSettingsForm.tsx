
import React, { useState } from 'react';
import { ShopInfo } from '../types';
import { CheckCircleIcon, SpinnerIcon } from './Icons';

interface ShopSettingsFormProps {
  initialInfo: ShopInfo;
  onSave: (info: ShopInfo) => void;
}

const ShopSettingsForm: React.FC<ShopSettingsFormProps> = ({ initialInfo, onSave }) => {
  const [info, setInfo] = useState<ShopInfo>(initialInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      onSave(info);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  // คลาสสไตล์ตัวหนังสือขาว พื้นหลังเข้ม
  const darkInputClasses = "w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-bold placeholder-slate-500 transition-all shadow-inner";

  return (
    <div className="max-w-2xl mx-auto py-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อศูนย์บริการ / ร้าน</label>
            <input
              name="name"
              value={info.name}
              onChange={handleChange}
              className={darkInputClasses}
              placeholder="เช่น TECHNICAL AUTO SERVICE Bangna"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">สโลแกนหรือคำโปรย</label>
            <input
              name="tagline"
              value={info.tagline}
              onChange={handleChange}
              className={darkInputClasses}
              placeholder="เช่น บริการอัจฉริยะ ทันใจ มั่นใจทุกเส้นทาง"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">เบอร์โทรศัพท์ติดต่อร้าน</label>
            <input
              name="phone"
              value={info.phone}
              onChange={handleChange}
              className={darkInputClasses}
              placeholder="02-XXX-XXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">เวลาทำการ</label>
            <input
              name="openHours"
              value={info.openHours}
              onChange={handleChange}
              className={darkInputClasses}
              placeholder="เช่น จันทร์-เสาร์ 08:30 - 17:30"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ที่อยู่ศูนย์บริการ</label>
            <textarea
              name="address"
              value={info.address}
              onChange={handleChange}
              rows={3}
              className={darkInputClasses}
              placeholder="ที่อยู่เต็มของร้าน..."
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 font-bold animate-fade-in">
              <CheckCircleIcon className="w-5 h-5" />
              <span>บันทึกข้อมูลหน้าร้านสำเร็จ!</span>
            </div>
          )}
          <div className="flex-grow"></div>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-8 py-3 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
            }`}
          >
            {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : null}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShopSettingsForm;
