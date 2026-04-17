import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NotificationToastProps {
  notification: { show: boolean, message: string, type: 'success' | 'error' } | null;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-white min-w-[320px]",
            notification.type === 'success' ? "bg-emerald-600 shadow-emerald-200" : "bg-rose-600 shadow-rose-200"
          )}
        >
          {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
