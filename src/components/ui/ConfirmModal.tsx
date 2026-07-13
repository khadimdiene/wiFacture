"use client";

import * as React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: { bg: "bg-red-100", text: "text-red-600", btn: "bg-red-600 hover:bg-red-700 text-white", icon: "🗑️" },
    warning: { bg: "bg-amber-100", text: "text-amber-600", btn: "bg-amber-500 hover:bg-amber-600 text-white", icon: "⚠️" },
    info: { bg: "bg-sky-100", text: "text-sky-600", btn: "bg-sky-500 hover:bg-sky-600 text-white", icon: "ℹ️" },
  }[variant];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-[201] w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center text-2xl`}>
            {colors.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
          </div>
          <div className="flex flex-col sm:flex-row w-full gap-2 mt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] ${colors.btn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
