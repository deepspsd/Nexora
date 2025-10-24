import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  Maximize2, 
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Zap,
  ExternalLink,
  Sparkles,
  Code2,
  Rocket,
  Play,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  language?: string;
  children?: FileNode[];
  expanded?: boolean;
}

interface LivePreviewPanelProps {
  sandboxUrl: string;
  isLoading?: boolean;
  previewHtml?: string;
  files?: FileNode[];
  onDownload?: () => void;
  onDeploy?: () => void;
  selectedFile?: FileNode | null;
  onFileSelect?: Dispatch<SetStateAction<FileNode | null>>;
}

const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({ 
  sandboxUrl, 
  isLoading = false,
  previewHtml,
  files,
  onDownload,
  onDeploy,
  selectedFile,
  onFileSelect
}) => {
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine preview type
  const isMockSandbox = sandboxUrl?.includes('mock-') || !sandboxUrl;
  const hasStaticPreview = previewHtml && previewHtml.length > 0;
  const hasLiveSandbox = sandboxUrl && !isMockSandbox;

  const refreshPreview = () => {
    setIsRefreshing(true);
    setIsFrameLoaded(false);
    
    if (iframeRef.current) {
      if (hasStaticPreview) {
        // Refresh static HTML preview
        const currentHtml = iframeRef.current.srcdoc;
        iframeRef.current.srcdoc = '';
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.srcdoc = currentHtml;
          }
        }, 10);
      } else if (hasLiveSandbox) {
        // Refresh live sandbox with cache-busting
        try {
          const url = new URL(sandboxUrl);
          url.searchParams.set('_refresh', Date.now().toString());
          iframeRef.current.src = url.toString();
        } catch (e) {
          console.error('Invalid sandbox URL:', e);
        }
      }
    }
    
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Reset loaded state when content changes
  useEffect(() => {
    setIsFrameLoaded(false);
  }, [sandboxUrl, previewHtml]);

  const handleFrameLoad = () => {
    setIsFrameLoaded(true);
    console.log('✅ Preview loaded successfully');
  };

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case "mobile":
        return "w-[375px] h-[667px]";
      case "tablet":
        return "w-[768px] h-[1024px]";
      default:
        return "w-full h-full";
    }
  };

  const previewModes = [
    { id: "desktop" as const, label: "Desktop", icon: Monitor },
    { id: "tablet" as const, label: "Tablet", icon: Tablet },
    { id: "mobile" as const, label: "Mobile", icon: Smartphone }
  ];

  const openInNewTab = () => {
    if (hasLiveSandbox) {
      window.open(sandboxUrl, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-2">
          {previewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setPreviewMode(mode.id)}
              className={cn(
                "flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                previewMode === mode.id
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <mode.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={refreshPreview}
            disabled={isRefreshing}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all disabled:opacity-50"
            title="Refresh Preview"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </button>
          
          {hasLiveSandbox && (
            <button
              onClick={openInNewTab}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all text-xs font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open</span>
            </button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            /* Loading State - Enhanced */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 overflow-hidden"
            >
              {/* Animated Background */}
              <div className="absolute inset-0">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.1, 0.3, 0.1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 10 + i * 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.5
                    }}
                    className="absolute w-64 h-64 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(239, 68, 68, 0.2)'} 0%, transparent 70%)`,
                      left: `${20 + i * 15}%`,
                      top: `${10 + i * 15}%`
                    }}
                  />
                ))}
              </div>

              <div className="relative text-center z-10">
                {/* Main Loading Icon */}
                <motion.div
                  className="relative w-32 h-32 mx-auto mb-8"
                >
                  {/* Outer Ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-red-500"
                  />
                  
                  {/* Middle Ring */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-4 border-transparent border-b-pink-500 border-l-purple-500"
                  />
                  
                  {/* Inner Icon */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-4 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center shadow-2xl"
                  >
                    <Zap className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>
                
                {/* Loading Text */}
                <motion.h3
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
                >
                  <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                    Building Your App
                  </span>
                </motion.h3>
                
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                  Our AI is crafting your perfect MVP...
                </p>
                
                {/* Progress Steps */}
                <div className="space-y-3 max-w-xs mx-auto">
                  {[
                    { label: "Analyzing requirements", delay: 0 },
                    { label: "Generating code", delay: 0.2 },
                    { label: "Setting up preview", delay: 0.4 }
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: step.delay }}
                      className="flex items-center space-x-3 text-sm"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3
                        }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                      </motion.div>
                      <span className="text-gray-700 dark:text-gray-300">{step.label}</span>
                    </motion.div>
                  ))}
                </div>
                
                {/* Animated Dots */}
                <div className="mt-8 flex items-center justify-center space-x-2">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{ 
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.15
                      }}
                      className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : !hasStaticPreview && !hasLiveSandbox ? (
            /* Empty State - Beautiful Modern Design */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-red-200/40 dark:from-orange-500/20 dark:to-red-500/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/40 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl"
                />
              </div>

              <div className="relative text-center max-w-2xl mx-auto p-8 z-10">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="relative w-32 h-32 mx-auto mb-8"
                >
                  <motion.div
                    animate={{
                      rotate: 360
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 opacity-20 blur-xl"
                  />
                  <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center shadow-2xl">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Rocket className="w-16 h-16 text-white" />
                    </motion.div>
                  </div>
                  
                  {/* Floating Sparkles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [-20, -40, -20],
                        x: [0, (i - 1) * 10, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4
                      }}
                      className="absolute top-0 left-1/2"
                      style={{ marginLeft: `${(i - 1) * 20}px` }}
                    >
                      <Sparkles className="w-4 h-4 text-orange-400" />
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
                >
                  {isMockSandbox ? (
                    <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                      Mock Preview Mode
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                      Ready to Build Magic ✨
                    </span>
                  )}
                </motion.h3>
                
                {/* Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  {isMockSandbox ? (
                    <div className="space-y-6">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-full">
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">E2B API Not Configured</span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                        Your files are being generated and saved successfully!
                        <br />Check the file tree to explore your generated code.
                      </p>
                      
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start space-x-3 text-left">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Enable Live Preview</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Configure your E2B API key to see your app running in real-time with hot reload!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                        Start building your MVP and watch it come to life
                        <br />in real-time with our AI-powered code generation.
                      </p>
                      
                      {/* Feature Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        {[
                          { icon: Code2, title: "Smart Code", desc: "AI-generated code" },
                          { icon: Eye, title: "Live Preview", desc: "See changes instantly" },
                          { icon: Rocket, title: "Quick Deploy", desc: "Ship in minutes" }
                        ].map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-all"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-3">
                              <feature.icon className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{feature.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
                
                {/* Call to Action */}
                {!isMockSandbox && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8"
                  >
                    <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                      <Play className="w-5 h-5" />
                      <span>Start Building</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : hasStaticPreview ? (
            /* Static HTML Preview */
            <motion.div
              key="static"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <div className={cn(
                "relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
                getPreviewDimensions()
              )}>
                {/* Loading Overlay */}
                {!isFrameLoaded && (
                  <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rendering...</p>
                    </div>
                  </div>
                )}
                
                {/* Static Preview Iframe */}
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  title="Static Preview"
                  onLoad={handleFrameLoad}
                />
                
                {/* Badge */}
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-lg shadow-lg backdrop-blur-sm z-20 flex items-center space-x-1.5">
                  <Eye className="w-3 h-3" />
                  <span>Static Preview</span>
                </div>
                
                {/* Device Frame */}
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
          ) : (
            /* Live Sandbox Preview */
            <motion.div
              key="live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <div className={cn(
                "relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
                getPreviewDimensions()
              )}>
                {/* Loading Overlay */}
                {!isFrameLoaded && (
                  <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Loading preview...</p>
                    </div>
                  </div>
                )}
                
                {/* Live Preview Iframe */}
                <iframe
                  ref={iframeRef}
                  src={sandboxUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                  onLoad={handleFrameLoad}
                  title="Live Preview"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone"
                />
                
                {/* Live Badge */}
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg backdrop-blur-sm z-20 flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
                
                {/* Device Frame */}
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
