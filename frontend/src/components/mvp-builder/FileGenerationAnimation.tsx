import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode, CheckCircle, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileOperation {
  type: "create" | "update" | "delete";
  path: string;
  status: "pending" | "processing" | "completed" | "error";
  content?: string;
  language?: string;
}

interface FileGenerationAnimationProps {
  fileOperations: FileOperation[];
}

const FileGenerationAnimation: React.FC<FileGenerationAnimationProps> = ({ fileOperations }) => {
  const [visibleOps, setVisibleOps] = useState<FileOperation[]>([]);
  
  useEffect(() => {
    // Gradually show file operations for smooth animation
    fileOperations.forEach((op, index) => {
      setTimeout(() => {
        setVisibleOps(prev => {
          if (!prev.find(p => p.path === op.path)) {
            return [...prev, op];
          }
          return prev.map(p => p.path === op.path ? op : p);
        });
      }, index * 100);
    });
  }, [fileOperations]);
  
  if (!visibleOps || visibleOps.length === 0) return null;

  const completedCount = visibleOps.filter(op => op.status === "completed").length;
  const totalCount = visibleOps.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden relative"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5 animate-pulse" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Generating Your Application
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {completedCount} of {totalCount} files created
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {visibleOps.map((operation, index) => (
            <motion.div
              key={operation.path}
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-all border-2",
                operation.status === "completed" && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                operation.status === "processing" && "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 animate-pulse",
                operation.status === "error" && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                operation.status === "pending" && "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  operation.status === "completed" && "bg-green-100 dark:bg-green-900/40",
                  operation.status === "processing" && "bg-orange-100 dark:bg-orange-900/40",
                  operation.status === "error" && "bg-red-100 dark:bg-red-900/40",
                  operation.status === "pending" && "bg-gray-100 dark:bg-gray-700"
                )}>
                  <FileCode className={cn(
                    "w-4 h-4",
                    operation.status === "completed" && "text-green-600 dark:text-green-400",
                    operation.status === "processing" && "text-orange-600 dark:text-orange-400",
                    operation.status === "error" && "text-red-600 dark:text-red-400",
                    operation.status === "pending" && "text-gray-400"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white truncate">
                    {operation.path.split('/').pop()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {operation.path}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                {operation.status === "completed" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </motion.div>
                )}
                {operation.status === "processing" && (
                  <Loader2 className="w-6 h-6 text-orange-600 dark:text-orange-400 animate-spin" />
                )}
                {operation.status === "error" && (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
                {operation.status === "pending" && (
                  <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 animate-pulse" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FileGenerationAnimation;
