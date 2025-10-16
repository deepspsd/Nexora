import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  Code, 
  FolderTree, 
  Download, 
  CloudUpload, 
  Copy,
  Check,
  FileCode,
  Folder,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import LivePreviewPanel from "./LivePreviewPanel";

interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  language?: string;
  children?: FileNode[];
  expanded?: boolean;
}

interface EnhancedPreviewPanelProps {
  sandboxUrl: string;
  isLoading?: boolean;
  files: FileNode[];
  onDownload: () => void;
  onDeploy: () => void;
  selectedFile?: FileNode | null;
  onFileSelect?: (file: FileNode | null) => void;
  previewHtml?: string;
}

const EnhancedPreviewPanel: React.FC<EnhancedPreviewPanelProps> = ({
  sandboxUrl,
  isLoading = false,
  files,
  onDownload,
  onDeploy,
  selectedFile: externalSelectedFile,
  onFileSelect,
  previewHtml
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "files">("preview");
  const [internalSelectedFile, setInternalSelectedFile] = useState<FileNode | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>(files);
  const [copied, setCopied] = useState(false);

  const selectedFile = externalSelectedFile !== undefined ? externalSelectedFile : internalSelectedFile;
  const setSelectedFile = onFileSelect || setInternalSelectedFile;

  // Update file tree when files prop changes
  useEffect(() => {
    setFileTree(files);
    // Auto-select first file if none selected
    if (files.length > 0 && !selectedFile) {
      const firstFile = findFirstFile(files);
      if (firstFile) {
        setSelectedFile(firstFile);
      }
    }
  }, [files]);

  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === "file") return node;
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const getAllFiles = (nodes: FileNode[]): FileNode[] => {
    const files: FileNode[] = [];
    const traverse = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === "file") {
          files.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return files;
  };

  const tabs = [
    { id: "preview", label: "UI Preview", icon: Eye },
    { id: "code", label: "Code View", icon: Code },
    { id: "files", label: "File Tree", icon: FolderTree }
  ];

  const toggleFolder = (path: string) => {
    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path && node.type === "folder") {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };
    setFileTree(updateTree(fileTree));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFileTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map((node, index) => (
      <div key={node.path} style={{ paddingLeft: `${level * 16}px` }}>
        <button
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.path);
            } else {
              setSelectedFile(node);
              setActiveTab("code");
            }
          }}
          className={cn(
            "w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all text-left",
            selectedFile?.path === node.path && "bg-orange-100 dark:bg-orange-900/30"
          )}
        >
          {node.type === "folder" ? (
            <>
              {node.expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <Folder className="w-4 h-4 text-orange-500" />
            </>
          ) : (
            <>
              <div className="w-4" />
              <FileCode className="w-4 h-4 text-blue-500" />
            </>
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
            {node.name}
          </span>
        </button>
        {node.type === "folder" && node.expanded && node.children && (
          <div className="mt-1">
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header with Tabs and Actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Tabs */}
        <div className="flex items-center space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onDownload}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
            title="Download Project"
          >
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
              Download
            </span>
          </button>

          <button
            onClick={onDeploy}
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
            title="Deploy to Vercel/HF Space"
          >
            <CloudUpload className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-medium">Deploy</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <LivePreviewPanel 
                sandboxUrl={sandboxUrl} 
                isLoading={isLoading}
                previewHtml={previewHtml}
              />
            </motion.div>
          )}

          {activeTab === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col bg-gray-900"
            >
              {fileTree.length > 0 ? (
                <>
                  {/* File Tabs */}
                  <div className="flex items-center space-x-1 px-4 pt-4 pb-2 border-b border-gray-700 overflow-x-auto">
                    {getAllFiles(fileTree).map((file, index) => (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-t-lg text-xs font-medium transition-all whitespace-nowrap",
                          selectedFile?.path === file.path
                            ? "bg-gray-800 text-orange-400 border-t-2 border-orange-500"
                            : "bg-gray-900/50 text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
                        )}
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{file.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* All Files View with Summary */}
                  <div className="flex-1 overflow-auto p-4 space-y-1">
                    {/* Summary Header */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-200 mb-1">Generated Files</h3>
                          <p className="text-xs text-gray-400">
                            {getAllFiles(fileTree).length} files • {getAllFiles(fileTree).reduce((acc, f) => acc + (f.content?.split('\n').length || 0), 0)} total lines
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const allCode = getAllFiles(fileTree).map(f => 
                              `// ${f.path}\n${f.content || ''}`
                            ).join('\n\n' + '='.repeat(80) + '\n\n');
                            copyToClipboard(allCode);
                          }}
                          className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-all text-xs font-medium flex items-center space-x-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy All</span>
                        </button>
                      </div>
                    </div>

                    {/* Files */}
                    {getAllFiles(fileTree).map((file, index) => (
                      <div key={file.path} id={`file-${index}`} className="mb-6 last:mb-0 scroll-mt-4">
                        {/* File Header */}
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700 sticky top-0 bg-gray-900 z-10 backdrop-blur-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                              <FileCode className="w-4 h-4 text-orange-400" />
                            </div>
                            <span className="text-sm font-mono text-gray-300 font-semibold">{file.path}</span>
                            {file.language && (
                              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded-full">
                                {file.language}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {file.content ? `${file.content.split('\n').length} lines` : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(file.content || '')}
                            className="p-1.5 hover:bg-gray-800 rounded-lg transition-all flex-shrink-0"
                            title="Copy code"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>

                        {/* Code Content */}
                        {file.content ? (
                          <pre className="text-xs text-gray-100 font-mono whitespace-pre-wrap bg-gray-950/50 p-4 rounded-lg border border-gray-800 overflow-x-auto">
                            <code>{file.content}</code>
                          </pre>
                        ) : (
                          <div className="text-sm text-gray-500 italic p-4 bg-gray-950/30 rounded-lg">
                            No content available
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FileCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No files generated yet</p>
                    <p className="text-xs text-gray-600 mt-2">Start building to see code here</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "files" && (
            <motion.div
              key="files"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-auto bg-white dark:bg-gray-800 p-4"
            >
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Project Structure
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Click on files to view code, folders to expand
                </p>
              </div>

              {fileTree.length > 0 ? (
                <div className="space-y-1">
                  {renderFileTree(fileTree)}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No files generated yet</p>
                    <p className="text-xs mt-1">Start building to see files here</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedPreviewPanel;
