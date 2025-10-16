import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  Maximize2, 
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  EyeOff,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LivePreviewPanelProps {
  sandboxUrl: string;
  isLoading?: boolean;
  previewHtml?: string;
}

const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({ 
  sandboxUrl, 
  isLoading = false,
  previewHtml 
}) => {
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const refreshPreview = () => {
    if (iframeRef.current && sandboxUrl) {
      setIsRefreshing(true);
      setLoadError(false);
      setIsFrameLoaded(false);
      
      // Force iframe reload with timestamp to bypass cache
      const url = new URL(sandboxUrl);
      url.searchParams.set('_t', Date.now().toString());
      iframeRef.current.src = url.toString();
      
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  // Refresh when sandbox URL changes
  useEffect(() => {
    if (sandboxUrl && iframeRef.current) {
      setIsFrameLoaded(false);
      setLoadError(false);
      console.log('Loading sandbox URL:', sandboxUrl);
      
      // Validate URL format
      try {
        const url = new URL(sandboxUrl);
        console.log('Valid URL:', url.toString());
      } catch (e) {
        console.error('Invalid sandbox URL:', sandboxUrl, e);
        setLoadError(true);
      }
    }
  }, [sandboxUrl]);

  const handleFrameLoad = () => {
    setIsFrameLoaded(true);
    setLoadError(false);
  };

  const handleFrameError = () => {
    setLoadError(true);
    setIsFrameLoaded(false);
  };

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case "mobile":
        return { width: "375px", height: "667px" };
      case "tablet":
        return { width: "768px", height: "1024px" };
      default:
        return { width: "100%", height: "100%" };
    }
  };

  const previewModes = [
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "tablet", label: "Tablet", icon: Tablet },
    { id: "mobile", label: "Mobile", icon: Smartphone }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {previewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setPreviewMode(mode.id as any)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                previewMode === mode.id
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <mode.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {sandboxUrl && (
            <>
              <button
                onClick={refreshPreview}
                disabled={isRefreshing}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                title="Refresh Preview"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              </button>
              
              <button
                onClick={() => window.open(sandboxUrl, "_blank")}
                className="flex items-center space-x-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Open</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            /* Loading State */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.h3
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Building Your App
                </motion.h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                  Creating sandbox environment and generating code...
                </p>
                
                <div className="mt-6 flex items-center justify-center space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{ 
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      className="w-2 h-2 bg-orange-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (!sandboxUrl || sandboxUrl.includes('mock-')) && !previewHtml ? (
            /* No Preview State or Mock Sandbox */
            <motion.div
              key="no-preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
                  <Eye className="w-10 h-10 text-orange-500" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {sandboxUrl?.includes('mock-') ? 'Mock Sandbox Mode' : 'Live Preview'}
                </h3>
                
                {sandboxUrl?.includes('mock-') ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      ⚠️ E2B API key not configured. Running in mock mode.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      To enable live preview:
                      <br />1. Add your E2B_API_KEY to the .env file
                      <br />2. Restart the backend server
                      <br />3. Generate a new application
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-4">
                      Files are still being generated and can be viewed in the Code View tab
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start a conversation to see your generated app come to life in real-time. 
                      Watch as files are created and your application builds automatically.
                    </p>
                    
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Live Updates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>E2B Sandbox</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Responsive</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ) : previewHtml ? (
            /* Static HTML Preview (for mock sandboxes) */
            <motion.div
              key="static-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <div className={cn(
                "relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
                previewMode === "desktop" ? "w-full h-full" : "border border-gray-300 dark:border-gray-600"
              )}
              style={previewMode !== "desktop" ? getPreviewDimensions() : {}}>
                {/* Preview iframe with static HTML */}
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  title="Static Preview"
                  onLoad={() => setIsFrameLoaded(true)}
                />
                
                {/* Mock Badge */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500/90 text-white text-xs rounded-lg shadow-lg backdrop-blur-sm z-20">
                  📦 Static Preview
                </div>
                
                {/* Device Frame for Mobile/Tablet */}
                {previewMode !== "desktop" && (
                  <div className="absolute -inset-4 border-8 border-gray-800 rounded-3xl pointer-events-none">
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full"></div>
                    {previewMode === "mobile" && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-gray-600 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : loadError ? (
            /* Error State */
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Preview Error
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Unable to load the preview. This could be because:
                  <br />• The sandbox is still starting up
                  <br />• The E2B sandbox URL is invalid
                  <br />• Network connectivity issues
                </p>
                
                {sandboxUrl && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-mono break-all">
                    URL: {sandboxUrl}
                  </p>
                )}
                
                <button
                  onClick={refreshPreview}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Preview Frame */
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <div 
                className={cn(
                  "relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
                  previewMode === "desktop" ? "w-full h-full" : "border border-gray-300 dark:border-gray-600"
                )}
                style={previewMode !== "desktop" ? getPreviewDimensions() : {}}
              >
                {/* Loading Overlay */}
                {!isFrameLoaded && (
                  <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Loading preview...</p>
                    </div>
                  </div>
                )}
                
                {/* Preview iframe */}
                <iframe
                  ref={iframeRef}
                  src={sandboxUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                  onLoad={handleFrameLoad}
                  onError={handleFrameError}
                  title="Live Preview"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb"
                />
                
                {/* Device Frame for Mobile/Tablet */}
                {previewMode !== "desktop" && (
                  <div className="absolute -inset-4 border-8 border-gray-800 rounded-3xl pointer-events-none">
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full"></div>
                    {previewMode === "mobile" && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-gray-600 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LivePreviewPanel;
