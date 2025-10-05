import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  RefreshCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewDevice {
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<any>;
}

const PREVIEW_DEVICES: Record<string, PreviewDevice> = {
  mobile: { name: 'Mobile', width: 375, height: 667, icon: Smartphone },
  tablet: { name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  desktop: { name: 'Desktop', width: 1440, height: 900, icon: Monitor },
};

interface PreviewPanelProps {
  previewHtml?: string;
  previewUrl?: string;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  onRefresh?: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  previewHtml,
  previewUrl,
  isLoading = false,
  error,
  className,
  onRefresh
}) => {
  const [device, setDevice] = useState<keyof typeof PREVIEW_DEVICES>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate scale to fit preview in container
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const deviceConfig = PREVIEW_DEVICES[device];
    
    const scaleX = containerWidth / deviceConfig.width;
    const scaleY = containerHeight / deviceConfig.height;
    const newScale = Math.min(scaleX, scaleY, 1) * 0.9; // 90% to leave some padding
    
    setScale(newScale);
  }, [device]);
  
  // Update iframe content when previewHtml changes
  useEffect(() => {
    if (iframeRef.current && previewHtml) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml]);
  
  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };
  
  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };
  
  const deviceConfig = PREVIEW_DEVICES[device];
  const DeviceIcon = deviceConfig.icon;
  
  return (
    <div className={cn("flex flex-col h-full bg-gray-950", className)}>
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Device Selector */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
            {Object.entries(PREVIEW_DEVICES).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setDevice(key as keyof typeof PREVIEW_DEVICES)}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    device === key
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  )}
                  title={config.name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          
          <span className="text-sm text-gray-400">
            {deviceConfig.width} × {deviceConfig.height}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all disabled:opacity-50"
              title="Refresh preview"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </button>
          )}
          
          {previewUrl && (
            <button
              onClick={handleOpenExternal}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleFullscreen}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      {/* Preview Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-8"
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            <p className="text-gray-400">Loading preview...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-gray-400">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all"
              >
                Try Again
              </button>
            )}
          </div>
        ) : (previewHtml || previewUrl) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
            style={{
              width: deviceConfig.width,
              height: deviceConfig.height,
              transform: `scale(${scale})`,
              transformOrigin: 'center'
            }}
          >
            {/* Device Frame */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
              {/* Screen */}
              <div className="absolute inset-2 rounded-xl overflow-hidden bg-white">
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <Monitor className="w-12 h-12 text-gray-600" />
            <p className="text-gray-400">No preview available</p>
            <p className="text-sm text-gray-500">
              Start building your application to see a live preview here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
