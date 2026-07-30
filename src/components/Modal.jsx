import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-carbon/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-brand-border shadow-modal w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-crema-light">
          <h3 className="font-display text-lg font-bold text-brand-carbon">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-carbon p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {children}
        </div>

      </div>
    </div>
  );
}
