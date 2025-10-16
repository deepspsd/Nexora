import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-500",
    icon: "text-green-600 dark:text-green-400",
    text: "text-green-900 dark:text-green-100",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-500",
    icon: "text-red-600 dark:text-red-400",
    text: "text-red-900 dark:text-red-100",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-500",
    icon: "text-yellow-600 dark:text-yellow-400",
    text: "text-yellow-900 dark:text-yellow-100",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-500",
    icon: "text-blue-600 dark:text-blue-400",
    text: "text-blue-900 dark:text-blue-100",
  },
};

export default function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const Icon = icons[type];
  const colorScheme = colors[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`
        ${colorScheme.bg} ${colorScheme.border}
        border-l-4 rounded-lg shadow-lg p-4 mb-3
        max-w-md w-full pointer-events-auto
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`w-6 h-6 ${colorScheme.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-semibold ${colorScheme.text}`}>
            {title}
          </p>
          {message && (
            <p className={`mt-1 text-sm ${colorScheme.text} opacity-90`}>
              {message}
            </p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className={`ml-4 flex-shrink-0 ${colorScheme.icon} hover:opacity-70 transition-opacity`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Toast Hook
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }>>([]);

  const showToast = (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  };

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    closeToast,
    success: (title: string, message?: string) => showToast("success", title, message),
    error: (title: string, message?: string) => showToast("error", title, message),
    warning: (title: string, message?: string) => showToast("warning", title, message),
    info: (title: string, message?: string) => showToast("info", title, message),
  };
}

// Import useState
import { useState } from "react";
