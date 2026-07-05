"use client";

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  centered?: boolean;
}

export default function Modal({ isOpen, onClose, children, size = 'md', centered = true }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div 
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-full overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );
}
