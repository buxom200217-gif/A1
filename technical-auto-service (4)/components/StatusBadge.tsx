
import React from 'react';
import { RepairStatus } from '../types';

interface StatusBadgeProps {
  status: RepairStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    [RepairStatus.PENDING]: {
      label: 'รอดำเนินการ',
      styles: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50'
    },
    [RepairStatus.IN_PROGRESS]: {
      label: 'กำลังดำเนินการ',
      styles: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50'
    },
    [RepairStatus.COMPLETED]: {
      label: 'เสร็จสิ้นแล้ว',
      styles: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50'
    },
    [RepairStatus.CANCELLED]: {
      label: 'ยกเลิก',
      styles: 'bg-slate-50 text-slate-400 border-slate-100 shadow-slate-100/50'
    }
  };

  const config = configs[status];

  return (
    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold border shadow-sm inline-flex items-center gap-1.5 ${config.styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
