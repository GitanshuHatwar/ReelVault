import React from 'react';

export default function VerificationBadge({ status, className = '' }) {
  let colors = '';
  let Icon = null;
  
  switch(status) {
    case 'SUPPORTED': 
      colors = 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'; 
      Icon = () => <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] mr-1.5" />;
      break;
    case 'PARTIALLY SUPPORTED': 
      colors = 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'; 
      Icon = () => <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-current flex items-center justify-center text-[8px] font-black mr-1.5 pb-[0.5px]">!</span>;
      break;
    case 'CONTRADICTED': 
      colors = 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'; 
      Icon = () => <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] mr-1.5" />;
      break;
    case 'INSUFFICIENT EVIDENCE': 
      colors = 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]'; 
      Icon = () => <div className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-1.5" />;
      break;
    default: 
      colors = 'bg-gray-100 text-gray-700 border-gray-200';
  }

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${colors} ${className}`}>
      {Icon && <Icon />}
      {status}
    </div>
  );
}
