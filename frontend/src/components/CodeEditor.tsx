import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Copy, Check, Download, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  height?: string;
  fileName?: string;
  showMinimap?: boolean;
}

const CodeEditor = ({
  value,
  language = 'typescript',
  onChange,
  readOnly = false,
  height = '500px',
  fileName,
  showMinimap = true,
}: CodeEditorProps) => {
  const { theme } = useStore();
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleEditorWillMount = (monaco: Monaco) => {
    // Register custom themes
    monaco.editor.defineTheme('nexora-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2a2a',
        'editorCursor.foreground': '#f97316',
        'editor.selectionBackground': '#264f78',
      },
    });

    monaco.editor.defineTheme('nexora-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000' },
        { token: 'keyword', foreground: '0000FF' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#f0f0f0',
        'editorCursor.foreground': '#f97316',
        'editor.selectionBackground': '#ADD6FF',
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {fileName && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {fileName}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            {language}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Copy code"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Editor */}
      <Editor
        height={isFullscreen ? 'calc(100vh - 48px)' : height}
        language={language}
        value={value}
        onChange={onChange}
        theme={theme === 'dark' ? 'nexora-dark' : 'nexora-light'}
        beforeMount={handleEditorWillMount}
        options={{
          readOnly,
          minimap: { enabled: showMinimap },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
          },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
