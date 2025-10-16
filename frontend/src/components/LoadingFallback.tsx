import { Loader2 } from "lucide-react";

export default function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Loading...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Preparing your experience
        </p>
      </div>
    </div>
  );
}
