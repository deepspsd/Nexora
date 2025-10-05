import React, { useState, useCallback } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { 
  FileCode, 
  Copy, 
  Download, 
  CheckCircle2,
  Save,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  code: string;
  language: string;
  fileName?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  onSave?: () => void;
  onRevert?: () => void;
  isModified?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  fileName,
  onChange,
  readOnly = false,
  className,
  onSave,
  onRevert,
  isModified = false
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);
  
  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, fileName, language]);
  
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly,
    automaticLayout: true,
    wordWrap: 'on' as const,
    theme: 'vs-dark',
    padding: { top: 16, bottom: 16 },
    scrollbar: {
      vertical: 'visible' as const,
      horizontal: 'visible' as const,
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    }
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">
            {fileName || 'untitled'}
          </span>
          {isModified && (
            <span className="text-xs text-yellow-400">• Modified</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onRevert && isModified && (
            <button
              onClick={onRevert}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all"
              title="Revert changes"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          
          {onSave && isModified && (
            <button
              onClick={onSave}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all"
            title="Copy code"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => onChange?.(value || '')}
          options={editorOptions}
          beforeMount={(monaco) => {
            // Configure Monaco theme
            monaco.editor.defineTheme('nexora-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '6B7280' },
                { token: 'keyword', foreground: 'C084FC' },
                { token: 'string', foreground: '86EFAC' },
                { token: 'number', foreground: 'FCD34D' }
              ],
              colors: {
                'editor.background': '#0A0A0A',
                'editor.foreground': '#E5E7EB',
                'editor.lineHighlightBackground': '#1F2937',
                'editorLineNumber.foreground': '#6B7280',
                'editorCursor.foreground': '#C084FC',
                'editor.selectionBackground': '#4C1D95',
                'editor.inactiveSelectionBackground': '#4C1D9555'
              }
            });
          }}
          onMount={(editor, monaco) => {
            monaco.editor.setTheme('nexora-dark');
          }}
        />
      </div>
    </div>
  );
};
