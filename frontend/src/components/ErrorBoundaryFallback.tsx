import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorBoundaryFallback = ({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We encountered an unexpected error. Don't worry, we've logged it and will fix it soon.
          </p>

          {/* Error Details (collapsed by default) */}
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2">
              Show error details
            </summary>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-xs font-mono text-red-600 dark:text-red-400 overflow-auto max-h-40">
              <p className="font-semibold mb-2">{error.name}</p>
              <p>{error.message}</p>
              {error.stack && (
                <pre className="mt-2 text-xs opacity-70">{error.stack.slice(0, 500)}...</pre>
              )}
            </div>
          </details>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetErrorBoundary}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </button>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            If this problem persists, please{' '}
            <a href="/contact" className="text-orange-500 hover:underline">
              contact support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorBoundaryFallback;
