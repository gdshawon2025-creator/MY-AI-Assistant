import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePortfolio();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        let borderClass = 'border-emerald-500/30';
        let bgClass = 'bg-slate-900/95';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
          borderClass = 'border-rose-500/30';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-sky-400 shrink-0" />;
          borderClass = 'border-sky-500/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border ${borderClass} ${bgClass} text-slate-200 text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="font-medium leading-tight">{toast.text}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
