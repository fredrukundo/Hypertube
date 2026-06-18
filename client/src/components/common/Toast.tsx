"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToastStore, ToastType } from "@/store/toast.store";

// Icon + color per toast type
const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ElementType; bg: string; border: string; text: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-400",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-400",
  },
};

// Single toast item
function ToastItem({
  id,
  type,
  message,
}: {
  id: string;
  type: ToastType;
  message: string;
}) {
  const [visible, setVisible] = useState(false);
  const remove = useToastStore((s) => s.remove);
  const config = TOAST_CONFIG[type];
  const Icon = config.icon;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => remove(id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3.5 rounded-2xl border-2 shadow-xl
        ${config.bg} ${config.border}
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        max-w-sm w-full
      `}
    >
      <Icon size={18} className={`${config.text} shrink-0 mt-0.5`} />
      <p className={`text-sm font-semibold flex-1 ${config.text}`}>
        {message}
      </p>
      <button
        onClick={handleClose}
        className={`${config.text} opacity-60 hover:opacity-100 transition-opacity shrink-0`}
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast container
export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} />
        </div>
      ))}
    </div>
  );
}