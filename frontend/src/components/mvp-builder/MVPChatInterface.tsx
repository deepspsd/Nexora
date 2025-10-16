import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Loader2, 
  Mic,
  Image as ImageIcon,
  Paperclip,
  Sparkles,
  FileCode,
  Eye,
  Terminal,
  Copy,
  Check,
  MessageSquare,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import FileGenerationAnimation from "./FileGenerationAnimation";
import MVPSidebar from "./MVPSidebar";
import SmartSuggestionsBar from "./SmartSuggestionsBar";
import EnhancedPreviewPanel from "./EnhancedPreviewPanel";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  files?: FileOperation[];
}

interface FileOperation {
  type: "create" | "update" | "delete";
  path: string;
  status: "pending" | "processing" | "completed" | "error";
  content?: string;
  language?: string;
}

interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  language?: string;
  children?: FileNode[];
  expanded?: boolean;
}

interface MVPChatInterfaceProps {
  initialPrompt?: string;
  onClose?: () => void;
}

const MVPChatInterface: React.FC<MVPChatInterfaceProps> = ({ 
  initialPrompt = "",
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentFileOps, setCurrentFileOps] = useState<FileOperation[]>([]);
  const [sandboxUrl, setSandboxUrl] = useState<string>("");
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [projectTitle, setProjectTitle] = useState("My MVP Project");
  const [currentStep, setCurrentStep] = useState("idea");
  const [credits, setCredits] = useState(75);
  const [apiUsage, setApiUsage] = useState(23);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);
    setCurrentFileOps([]);
    setShowSuggestions(false);

    // Add a temporary assistant message that will be updated
    const tempAssistantId = `temp-${Date.now()}`;
    const tempAssistantMessage: Message = {
      id: tempAssistantId,
      role: "assistant",
      content: "Initializing sandbox and preparing to generate your application...",
      timestamp: new Date(),
      files: []
    };
    setMessages(prev => [...prev, tempAssistantMessage]);

    try {
      // Call backend API for code generation with streaming
      const response = await fetch("http://localhost:8000/api/mvp/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error("Failed to generate code");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fileOperations: FileOperation[] = [];
      let currentStatus = "Initializing...";
      let filesGenerated = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === "content") {
                  // Don't show raw content - we'll show file operations instead
                  continue;
                } else if (data.type === "file_operation") {
                  const fileOp: FileOperation = {
                    type: data.operation,
                    path: data.path,
                    status: data.status,
                    content: data.content,
                    language: data.language
                  };
                  fileOperations.push(fileOp);
                  setCurrentFileOps(prev => {
                    const updated = [...prev];
                    const existingIndex = updated.findIndex(f => f.path === fileOp.path);
                    if (existingIndex >= 0) {
                      updated[existingIndex] = fileOp;
                    } else {
                      updated.push(fileOp);
                    }
                    return updated;
                  });

                  if (data.status === "completed") {
                    filesGenerated++;
                    const progress = Math.min((filesGenerated / 12) * 100, 95);
                    setGenerationProgress(progress);
                    currentStatus = `Generated ${filesGenerated} file${filesGenerated > 1 ? 's' : ''} successfully! Building your application...`;
                  } else if (data.status === "processing") {
                    currentStatus = `Creating ${data.path}...`;
                  }

                  setMessages(prev => prev.map(msg => 
                    msg.id === tempAssistantId 
                      ? { ...msg, content: currentStatus, files: fileOperations }
                      : msg
                  ));
                } else if (data.type === "sandbox_url") {
                  console.log('Received sandbox URL:', data.url, 'isMock:', data.isMock);
                  setSandboxUrl(data.url);
                  
                  if (data.isMock) {
                    currentStatus = "⚠️ Using mock sandbox (E2B API key not configured). Generating code...";
                  } else {
                    currentStatus = "✅ Sandbox created! Generating your application...";
                  }
                  
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempAssistantId 
                      ? { ...msg, content: currentStatus }
                      : msg
                  ));
                } else if (data.type === "complete") {
                  // Final update with success message
                  const finalMessage = `✨ Successfully generated your application with ${filesGenerated} files!\n\nYour app is ready to preview. You can now:\n• View the live preview in the panel\n• Explore the generated files\n• Make changes by chatting with me\n• Download or deploy your project`;
                  
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempAssistantId 
                      ? { ...msg, content: finalMessage, files: fileOperations }
                      : msg
                  ));
                  setCurrentStep("generation");
                  setShowSuggestions(true);
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error generating code:", error);
      setMessages(prev => prev.filter(msg => msg.id !== tempAssistantId));
      
      // Determine error type and provide specific guidance
      let errorContent = "❌ **Generation Failed**\n\n";
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorContent += "**Network Error**\n• Check your internet connection\n• Try again in a moment\n• Contact support if this persists";
      } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        errorContent += "**Rate Limit Exceeded**\n• You've made too many requests\n• Please wait a few minutes\n• Upgrade to Pro for higher limits";
      } else if (error.message?.includes('timeout')) {
        errorContent += "**Request Timeout**\n• Your request took too long\n• Try simplifying your prompt\n• Break it into smaller requests";
      } else {
        errorContent += "**Unexpected Error**\n• Our team has been notified\n• Try refreshing the page\n• Error ID: " + Date.now();
      }
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setApiUsage(prev => prev + 1);
      setCredits(prev => Math.max(0, prev - 1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownload = () => {
    // Download project as ZIP
    console.log("Downloading project...");
    alert("Download functionality will be implemented soon!");
  };

  const handleDeploy = () => {
    // Deploy to Vercel/HF Space
    console.log("Deploying project...");
    alert("Deploy functionality will be implemented soon!");
  };

  const handleNewMVP = () => {
    if (confirm("Start a new MVP project? Current progress will be lost.")) {
      setMessages([]);
      setCurrentFileOps([]);
      setFileTree([]);
      setSandboxUrl("");
      setInput("");
      setProjectTitle("My MVP Project");
      setCurrentStep("idea");
      if (onClose) onClose();
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic
    alert("Voice input will be implemented soon!");
  };

  const convertFileOpsToTree = (fileOps: FileOperation[]): FileNode[] => {
    const tree: FileNode[] = [];
    const folderMap: { [key: string]: FileNode } = {};

    fileOps.forEach(op => {
      if (op.status === "completed") {
        const parts = op.path.split("/");
        const fileName = parts[parts.length - 1];
        
        // Create folders if needed
        let currentPath = "";
        for (let i = 0; i < parts.length - 1; i++) {
          const folderName = parts[i];
          currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
          
          if (!folderMap[currentPath]) {
            const folder: FileNode = {
              name: folderName,
              type: "folder",
              path: currentPath,
              children: [],
              expanded: true
            };
            folderMap[currentPath] = folder;
            
            if (i === 0) {
              tree.push(folder);
            } else {
              const parentPath = parts.slice(0, i).join("/");
              folderMap[parentPath]?.children?.push(folder);
            }
          }
        }

        // Add file
        const file: FileNode = {
          name: fileName,
          type: "file",
          path: op.path,
          content: op.content,
          language: op.language
        };

        if (parts.length === 1) {
          tree.push(file);
        } else {
          const parentPath = parts.slice(0, -1).join("/");
          folderMap[parentPath]?.children?.push(file);
        }
      }
    });

    return tree;
  };

  useEffect(() => {
    if (currentFileOps.length > 0) {
      const tree = convertFileOpsToTree(currentFileOps);
      setFileTree(tree);
      // Auto-select first file for code view
      if (tree.length > 0 && !selectedFile) {
        const firstFile = findFirstFile(tree);
        if (firstFile) {
          setSelectedFile(firstFile);
        }
      }
      
      // Generate preview HTML from files
      generatePreviewHtml(currentFileOps);
    }
  }, [currentFileOps]);

  const generatePreviewHtml = (fileOps: FileOperation[]) => {
    // Find HTML file or create from React/TypeScript components
    const htmlFile = fileOps.find(f => f.path.endsWith('.html') && f.status === 'completed');
    const indexFile = fileOps.find(f => f.path.includes('index.html') && f.status === 'completed');
    
    if (htmlFile?.content) {
      setPreviewHtml(htmlFile.content);
      return;
    }
    
    if (indexFile?.content) {
      setPreviewHtml(indexFile.content);
      return;
    }

    // Generate preview from React/TypeScript files
    const appFile = fileOps.find(f => 
      (f.path.includes('App.jsx') || f.path.includes('App.tsx') || f.path.includes('App.js') || f.path.includes('App.ts')) 
      && f.status === 'completed'
    );
    const cssFile = fileOps.find(f => f.path.includes('index.css') && f.status === 'completed');
    
    // Get all component files for imports
    const componentFiles = fileOps.filter(f => 
      (f.path.endsWith('.tsx') || f.path.endsWith('.jsx')) && 
      f.status === 'completed' && 
      !f.path.includes('App.')
    );
    
    if (appFile?.content) {
      // Convert TypeScript/TSX to JavaScript for browser
      let jsCode = appFile.content
        // Remove imports first
        .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '')
        // Remove TypeScript type annotations
        .replace(/:\s*React\.FC<[^>]*>/g, '')
        .replace(/:\s*React\.ReactNode/g, '')
        .replace(/:\s*JSX\.Element/g, '')
        .replace(/:\s*\w+(\[\])?(\s*\|\s*\w+(\[\])?)*(?=\s*[,;=)\n])/g, '')
        // Remove interface and type definitions
        .replace(/interface\s+\w+\s*\{[\s\S]*?\n\}/g, '')
        .replace(/type\s+\w+\s*=\s*[\s\S]*?;/g, '')
        // Remove export statements
        .replace(/export\s+(default\s+)?/g, '')
        // Clean up empty lines
        .replace(/\n\s*\n\s*\n/g, '\n\n');

      // Build component code from other files
      let componentsCode = '';
      componentFiles.forEach(comp => {
        if (comp.content) {
          let compCode = comp.content
            .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '')
            .replace(/:\s*React\.FC<[^>]*>/g, '')
            .replace(/:\s*React\.ReactNode/g, '')
            .replace(/:\s*JSX\.Element/g, '')
            .replace(/:\s*\w+(\[\])?(\s*\|\s*\w+(\[\])?)*(?=\s*[,;=)\n])/g, '')
            .replace(/interface\s+\w+\s*\{[\s\S]*?\n\}/g, '')
            .replace(/type\s+\w+\s*=\s*[\s\S]*?;/g, '')
            .replace(/export\s+(default\s+)?/g, '')
            .replace(/\n\s*\n\s*\n/g, '\n\n');
          componentsCode += compCode + '\n\n';
        }
      });

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - ${projectTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: '#f97316',
            secondary: '#dc2626',
          }
        }
      }
    }
  </script>
  <style>
    ${cssFile?.content || ''}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React from 'https://esm.sh/react@18.2.0';
    import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
    
    const { useState, useEffect, useRef } = React;
    
    // Component definitions
    ${componentsCode}
    
    // Main App component
    ${jsCode}
    
    // Render with error boundary
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
      console.log('✅ App rendered successfully');
    } catch (error) {
      console.error('❌ Render error:', error);
      document.getElementById('root').innerHTML = '<div style="padding: 20px; font-family: system-ui;"><h2 style="color: #dc2626;">Preview Error</h2><p style="color: #6b7280; margin-top: 10px;">Failed to render the application. Check the browser console for details.</p><pre style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 15px; overflow: auto;">' + error.message + '</pre></div>';
    }
  </script>
</body>
</html>`;
      setPreviewHtml(html);
      console.log('✅ Generated preview HTML from TSX files');
      console.log('📄 Components included:', componentFiles.map(f => f.path).join(', '));
    }
  };

  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === "file") {
        return node;
      }
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-white dark:bg-gray-900">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Left Sidebar - Collapsible on Mobile */}
      <div className={cn(
        "w-full md:w-64 transition-transform duration-300 ease-in-out",
        "fixed md:relative inset-y-0 left-0 z-40",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <MVPSidebar
          projectTitle={projectTitle}
          onTitleChange={setProjectTitle}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          credits={credits}
          apiUsage={apiUsage}
          onNewMVP={handleNewMVP}
        />
      </div>

      {/* Overlay for mobile */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Center - Chat Area */}
          <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Let's Build Your MVP
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Describe your idea and I'll help you build a production-ready application with live preview and code generation.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                        <p className="text-gray-700 dark:text-gray-300">AI-Powered</p>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Eye className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                        <p className="text-gray-700 dark:text-gray-300">Live Preview</p>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <FileCode className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                        <p className="text-gray-700 dark:text-gray-300">Full Code</p>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Terminal className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                        <p className="text-gray-700 dark:text-gray-300">E2B Sandbox</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 shadow-md",
                        message.role === "user"
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      
                      {/* File Operations - Compact Display */}
                      {message.files && message.files.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold opacity-70">Generated Files</p>
                            <span className="text-xs opacity-60">{message.files.length} files</span>
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            {message.files.filter(f => f.status === "completed").map((file, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between px-2 py-1.5 bg-white/10 dark:bg-black/20 rounded-md hover:bg-white/20 dark:hover:bg-black/30 transition-all"
                              >
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="text-xs font-mono truncate">{file.path}</span>
                                </div>
                                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* File Generation Animations */}
              {isGenerating && currentFileOps.length > 0 && (
                <FileGenerationAnimation fileOperations={currentFileOps} />
              )}

              {/* Loading Indicator */}
              {isGenerating && currentFileOps.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2 text-gray-500 dark:text-gray-400"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Initializing sandbox and generating code...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area with Tools */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-end space-x-3">
                {/* Tool Buttons */}
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleVoiceInput}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      isRecording 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                    title="Voice Input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
                    title="Attach Image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
                    title="Attach File"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want to build or modify..."
                    className="w-full px-4 py-3 pr-16 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                    rows={3}
                    disabled={isGenerating}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {input.length}/2000
                  </div>
                </div>
                
                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isGenerating || !input.trim()}
                  className={cn(
                    "p-4 rounded-xl transition-all flex items-center justify-center",
                    isGenerating || !input.trim()
                      ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  )}
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Enhanced Preview Panel */}
          <div className="w-[45%]">
            <EnhancedPreviewPanel
              sandboxUrl={sandboxUrl}
              isLoading={isGenerating}
              files={fileTree}
              onDownload={handleDownload}
              onDeploy={handleDeploy}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              previewHtml={previewHtml}
            />
          </div>
        </div>
      </div>

      {/* Progress Indicator - Fixed Bottom Right */}
      {isGenerating && generationProgress > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Generating your MVP...
              </p>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round(generationProgress)}% complete
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MVPChatInterface;
