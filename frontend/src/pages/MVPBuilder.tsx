import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Loader2, 
  Sparkles,
  FileCode,
  Eye,
  Terminal,
  Check,
  MessageSquare,
  Code2,
  Play,
  Download,
  Share2,
  Settings,
  Maximize2,
  X,
  ChevronRight,
  Zap,
  Package,
  AlertCircle,
  Globe,
  Trash2,
  RefreshCw,
  Activity,
  CheckCircle,
  XCircle,
  Link2,
  Search,
  Camera,
  Rocket,
  ScrollText
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import CodeEditor from "@/components/CodeEditor";
import TemplateSelector from "@/components/TemplateSelector";
import { UITemplate } from "@/lib/templates/uiTemplates";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  files?: string[];
  status?: "streaming" | "complete" | "error";
}

interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileNode[];
  expanded?: boolean;
}

// Helper function to get language from file extension
const getLanguageFromFileName = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'c': 'c',
    'sh': 'shell',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
  };
  return languageMap[ext || ''] || 'plaintext';
};

const MVPBuilder = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sandboxId, setSandboxId] = useState<string>("");
  const [sandboxUrl, setSandboxUrl] = useState<string>("");
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [currentStatus, setCurrentStatus] = useState("");
  const [filesGenerated, setFilesGenerated] = useState(0);
  const [packagesInstalled, setPackagesInstalled] = useState<string[]>([]);
  const [sandboxHealth, setSandboxHealth] = useState<"healthy" | "unhealthy" | "unknown">("unknown");
  const [isDownloading, setIsDownloading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [cloneUrl, setCloneUrl] = useState("");
  const [isCloning, setIsCloning] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FileNode[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<UITemplate | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize sandbox on mount
  useEffect(() => {
    initializeSandbox();
  }, []);

  const initializeSandbox = async () => {
    try {
      setCurrentStatus("Creating sandbox environment...");
      
      // Try frontend API first (if Next.js APIs are available)
      let response;
      try {
        response = await fetch("/api/create-ai-sandbox-v2", {
          method: "POST",
        });
      } catch (frontendError) {
        // Fallback: Use mock sandbox for development
        console.warn("Frontend API not available, using mock sandbox");
        const mockId = `mock-${Date.now()}`;
        setSandboxId(mockId);
        setSandboxUrl("about:blank");
        setCurrentStatus("✅ Mock sandbox ready (Frontend APIs not available)");
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to create sandbox: ${response.status}`);
      }
      
      const data = await response.json();
      setSandboxId(data.sandboxId);
      setSandboxUrl(data.url);
      setCurrentStatus("✅ Sandbox ready!");
      
      // Sandbox created successfully
    } catch (error: any) {
      console.error("❌ Sandbox creation failed:", error);
      // Use mock sandbox as fallback
      const mockId = `mock-${Date.now()}`;
      setSandboxId(mockId);
      setSandboxUrl("about:blank");
      setCurrentStatus("⚠️ Using mock sandbox - " + error.message);
      setTimeout(() => setCurrentStatus(""), 5000);
    }
  };

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
      status: "complete"
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);
    setCurrentStatus("🤖 Analyzing your request with AI...");

    const tempAssistantId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempAssistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      status: "streaming",
      files: []
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Step 1: Analyze edit intent if in edit mode
      const isEdit = messages.length > 0 && sandboxId;
      let editIntent = null;
      
      if (isEdit) {
        setCurrentStatus("🔍 Analyzing edit intent with AI...");
        try {
          editIntent = await analyzeEditIntent(text);
          if (editIntent) {
            // Smart edit intent detected
            setCurrentStatus("✨ Edit intent understood - generating optimized code...");
          }
        } catch (e) {
          console.warn("Edit intent analysis skipped:", e);
        }
      }
      
      // Step 2: Generate AI code with streaming
      // Use backend Python API endpoint - Vite uses import.meta.env
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const generateResponse = await fetch(`${backendUrl}/api/mvp/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        console.error("API Error:", errorText);
        throw new Error(`Code generation failed: ${generateResponse.status} ${errorText}`);
      }

      const reader = generateResponse.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
      let conversationData = "";

      // Backend handles everything in one stream
      let filesCreated: string[] = [];
      let fullResponse = "";
      
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
                
                // Handle different event types from backend
                if (data.type === "content") {
                  fullResponse += data.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempAssistantId 
                      ? { ...msg, content: `Generating code...\n\n${data.content.substring(0, 300)}...` }
                      : msg
                  ));
                } else if (data.type === "file_operation") {
                  if (data.status === "completed") {
                    filesCreated.push(data.path);
                    setFilesGenerated(prev => prev + 1);
                    setCurrentStatus(`✅ Created ${data.path} - ${filesCreated.length} files generated`);
                  } else if (data.status === "processing") {
                    setCurrentStatus(`Creating ${data.path}...`);
                  }
                } else if (data.type === "sandbox_url") {
                  if (data.url && !data.isMock) {
                    setSandboxUrl(data.url);
                    setSandboxId(data.url.split("/").pop() || sandboxId);
                  }
                  setCurrentStatus(data.isMock ? "⚠️ Mock sandbox" : "✅ Sandbox ready");
                } else if (data.type === "complete") {
                  const finalMessage = `✨ **Successfully generated your application!**\n\n📁 **Created ${filesCreated.length} files**\n\n🚀 Your app is ready! Check the preview or download the project.\n\n💡 **Tip:** You can ask me to modify any part of the application!`;
                  
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempAssistantId 
                      ? { ...msg, content: finalMessage, files: filesCreated, status: "complete" }
                      : msg
                  ));
                  setCurrentStatus("✅ Generation complete! 🎉");
                }
              } catch (e) {
                console.debug("Parse error:", e, line);
              }
            }
          }
        }
      }

      // Try to refresh file tree if frontend APIs are available
      try {
        await refreshFileTree();
      } catch (e) {
        console.warn("File tree refresh skipped - frontend APIs not available");
      }

    } catch (error: any) {
      console.error("❌ Generation error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempAssistantId 
          ? { 
              ...msg, 
              content: `❌ **Generation Error**\n\n${error.message}\n\n💡 **Suggestions:**\n- Try rephrasing your request\n- Be more specific about what you want\n- Check your internet connection\n- Contact support if the issue persists`,
              status: "error"
            }
          : msg
      ));
      setCurrentStatus("❌ Generation failed");
      setTimeout(() => setCurrentStatus(""), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshFileTree = async () => {
    try {
      const response = await fetch("/api/get-sandbox-files");
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.success && data.files) {
        const tree = buildFileTree(data.files);
        setFileTree(tree);
      }
    } catch (error) {
      console.error("Failed to refresh file tree:", error);
    }
  };

  const buildFileTree = (files: Record<string, string>): FileNode[] => {
    const tree: FileNode[] = [];
    const folderMap: { [key: string]: FileNode } = {};

    Object.keys(files).forEach(filePath => {
      const parts = filePath.split("/").filter(p => p);
      
      for (let i = 0; i < parts.length - 1; i++) {
        const folderPath = parts.slice(0, i + 1).join("/");
        if (!folderMap[folderPath]) {
          const folder: FileNode = {
            name: parts[i],
            type: "folder",
            path: folderPath,
            children: [],
            expanded: true
          };
          folderMap[folderPath] = folder;
          
          if (i === 0) {
            tree.push(folder);
          } else {
            const parentPath = parts.slice(0, i).join("/");
            folderMap[parentPath]?.children?.push(folder);
          }
        }
      }

      const file: FileNode = {
        name: parts[parts.length - 1],
        type: "file",
        path: filePath,
        content: files[filePath]
      };

      if (parts.length === 1) {
        tree.push(file);
      } else {
        const parentPath = parts.slice(0, -1).join("/");
        folderMap[parentPath]?.children?.push(file);
      }
    });

    return tree;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path} style={{ paddingLeft: `${depth * 12}px` }}>
        <button
          onClick={() => {
            if (node.type === "file") {
              setSelectedFile(node);
            } else {
              setFileTree(prev => toggleFolder(prev, node.path));
            }
          }}
          className={cn(
            "w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-sm",
            selectedFile?.path === node.path && "bg-orange-100 dark:bg-orange-900/30"
          )}
        >
          {node.type === "folder" ? (
            <ChevronRight className={cn("w-3 h-3", node.expanded && "rotate-90")} />
          ) : (
            <FileCode className="w-3 h-3" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {node.type === "folder" && node.expanded && node.children && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const toggleFolder = (nodes: FileNode[], path: string): FileNode[] => {
    return nodes.map(node => {
      if (node.path === path) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return { ...node, children: toggleFolder(node.children, path) };
      }
      return node;
    });
  };

  // ============================================================================
  // FEATURE 1: Download ZIP
  // ============================================================================
  const handleDownload = async () => {
    if (!sandboxId) {
      alert("No active sandbox to download");
      return;
    }

    setIsDownloading(true);
    setCurrentStatus("Creating project ZIP...");

    try {
      const response = await fetch("/api/create-zip", {
        method: "POST"
      });

      if (!response.ok) throw new Error("Failed to create ZIP");

      const data = await response.json();
      
      if (data.success && data.dataUrl) {
        // Create download link
        const link = document.createElement("a");
        link.href = data.dataUrl;
        link.download = data.fileName || "project.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setCurrentStatus("✅ Project downloaded successfully!");
        setTimeout(() => setCurrentStatus(""), 3000);
      }
    } catch (error: any) {
      console.error("Download error:", error);
      setCurrentStatus(`❌ Download failed: ${error.message}`);
      setTimeout(() => setCurrentStatus(""), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  // ============================================================================
  // FEATURE 2: Sandbox Cleanup
  // ============================================================================
  const handleCleanup = async () => {
    if (!confirm("Start a new project? Current progress will be lost.")) {
      return;
    }

    try {
      setCurrentStatus("Cleaning up sandbox...");
      
      await fetch("/api/kill-sandbox", {
        method: "POST"
      });

      // Reset all state
      setMessages([]);
      setFileTree([]);
      setSelectedFile(null);
      setSandboxId("");
      setSandboxUrl("");
      setFilesGenerated(0);
      setPackagesInstalled([]);
      setErrors([]);
      
      // Reinitialize sandbox
      await initializeSandbox();
      
      setCurrentStatus("✅ Ready for new project!");
      setTimeout(() => setCurrentStatus(""), 2000);
    } catch (error: any) {
      console.error("Cleanup error:", error);
      setCurrentStatus(`❌ Cleanup failed: ${error.message}`);
    }
  };

  // ============================================================================
  // FEATURE: Template Selection
  // ============================================================================
  const handleTemplateSelect = (template: UITemplate) => {
    setSelectedTemplate(template);
    setInput(template.prompt);
    setCurrentStatus(`✨ Template "${template.name}" selected! Edit the prompt or send to generate.`);
    setTimeout(() => setCurrentStatus(""), 5000);
  };

  // ============================================================================
  // FEATURE 3: Website Cloning
  // ============================================================================
  const handleCloneWebsite = async () => {
    if (!cloneUrl.trim()) {
      alert("Please enter a URL to clone");
      return;
    }

    setIsCloning(true);
    setCurrentStatus("Scraping website...");
    setShowCloneDialog(false);

    try {
      const response = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cloneUrl,
          formats: ["markdown", "html"],
          options: { onlyMainContent: true }
        })
      });

      if (!response.ok) throw new Error("Failed to scrape website");

      const data = await response.json();
      
      if (data.success) {
        const clonePrompt = `Clone this website: ${cloneUrl}\n\nWebsite Content:\nTitle: ${data.data.title}\nDescription: ${data.data.description}\n\nContent:\n${data.data.markdown.substring(0, 2000)}...\n\nCreate a modern React application that replicates this website's design and functionality.`;
        
        setInput(clonePrompt);
        setCloneUrl("");
        setCurrentStatus("✅ Website scraped! Review and send to generate.");
        setTimeout(() => setCurrentStatus(""), 3000);
      }
    } catch (error: any) {
      console.error("Clone error:", error);
      setCurrentStatus(`❌ Clone failed: ${error.message}`);
      setTimeout(() => setCurrentStatus(""), 3000);
    } finally {
      setIsCloning(false);
    }
  };

  // ============================================================================
  // FEATURE 4: Smart Edit Intent (integrated into handleSendMessage)
  // ============================================================================
  const analyzeEditIntent = async (prompt: string) => {
    try {
      const filesResponse = await fetch("/api/get-sandbox-files");
      if (!filesResponse.ok) return null;
      
      const filesData = await filesResponse.json();
      if (!filesData.success || !filesData.manifest) return null;

      const response = await fetch("/api/analyze-edit-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          manifest: filesData.manifest,
          model: "openai/gpt-4o-mini"
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.success ? data.searchPlan : null;
    } catch (error) {
      console.error("Edit intent analysis failed:", error);
      return null;
    }
  };

  // ============================================================================
  // FEATURE 5: Auto Package Detection
  // ============================================================================
  const detectAndInstallPackages = async () => {
    try {
      const filesResponse = await fetch("/api/get-sandbox-files");
      if (!filesResponse.ok) return;
      
      const filesData = await filesResponse.json();
      if (!filesData.success || !filesData.files) return;

      setCurrentStatus("Detecting missing packages...");

      const response = await fetch("/api/detect-and-install-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filesData.files })
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success && data.packagesInstalled?.length > 0) {
        setPackagesInstalled(prev => [...new Set([...prev, ...data.packagesInstalled])]);
        setCurrentStatus(`✅ Auto-installed ${data.packagesInstalled.length} packages`);
        setTimeout(() => setCurrentStatus(""), 3000);
      }
    } catch (error) {
      console.error("Package detection failed:", error);
    }
  };

  // ============================================================================
  // FEATURE 6: Error Monitoring
  // ============================================================================
  const monitorErrors = async () => {
    try {
      const response = await fetch("/api/monitor-vite-logs");
      if (!response.ok) return;

      const data = await response.json();
      if (data.success && data.errors?.length > 0) {
        setErrors(data.errors);
        
        // Auto-fix: install missing packages
        const missingPackages = data.errors
          .filter((e: any) => e.type === "npm-missing")
          .map((e: any) => e.package);
        
        if (missingPackages.length > 0) {
          setCurrentStatus(`Installing ${missingPackages.length} missing packages...`);
          await fetch("/api/install-packages-v2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ packages: missingPackages })
          });
        }
      } else {
        setErrors([]);
      }
    } catch (error) {
      console.error("Error monitoring failed:", error);
    }
  };

  // ============================================================================
  // FEATURE 7: Sandbox Health Check
  // ============================================================================
  const checkSandboxHealth = async () => {
    try {
      const response = await fetch("/api/sandbox-status");
      if (!response.ok) {
        setSandboxHealth("unhealthy");
        return;
      }

      const data = await response.json();
      setSandboxHealth(data.healthy ? "healthy" : "unhealthy");
    } catch (error) {
      setSandboxHealth("unhealthy");
    }
  };

  // ============================================================================
  // FEATURE 8: Conversation State Management
  // ============================================================================
  const saveConversationState = async () => {
    try {
      await fetch("/api/conversation-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          data: {
            userPreferences: {
              lastSandboxId: sandboxId,
              filesGenerated: filesGenerated
            }
          }
        })
      });
    } catch (error) {
      console.error("Failed to save conversation state:", error);
    }
  };

  // ============================================================================
  // FEATURE 9: Custom Commands
  // ============================================================================
  const runCustomCommand = async (command: string) => {
    try {
      setCurrentStatus(`Running: ${command}`);
      
      const response = await fetch("/api/run-command-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command })
      });

      if (!response.ok) throw new Error("Command failed");

      const data = await response.json();
      setCurrentStatus(data.success ? "✅ Command completed" : "❌ Command failed");
      setTimeout(() => setCurrentStatus(""), 2000);
      
      return data;
    } catch (error: any) {
      setCurrentStatus(`❌ ${error.message}`);
      setTimeout(() => setCurrentStatus(""), 2000);
    }
  };

  // ============================================================================
  // FEATURE 10: Vite Restart
  // ============================================================================
  const restartVite = async () => {
    try {
      setCurrentStatus("Restarting Vite server...");
      
      await fetch("/api/restart-vite", {
        method: "POST"
      });

      setCurrentStatus("✅ Vite restarted");
      setTimeout(() => setCurrentStatus(""), 2000);
    } catch (error) {
      setCurrentStatus("❌ Restart failed");
      setTimeout(() => setCurrentStatus(""), 2000);
    }
  };

  // ============================================================================
  // FEATURE 11: Screenshot Capture
  // ============================================================================
  const captureScreenshot = async (url: string) => {
    try {
      setCurrentStatus("Capturing screenshot...");
      
      const response = await fetch("/api/scrape-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error("Screenshot capture failed");

      const data = await response.json();
      
      if (data.success && data.screenshot) {
        setCurrentStatus("✅ Screenshot captured!");
        setTimeout(() => setCurrentStatus(""), 2000);
        return data.screenshot;
      }
    } catch (error: any) {
      setCurrentStatus(`❌ Screenshot failed: ${error.message}`);
      setTimeout(() => setCurrentStatus(""), 3000);
    }
  };

  // ============================================================================
  // FEATURE 12: Enhanced URL Scraping
  // ============================================================================
  const scrapeUrlEnhanced = async (url: string) => {
    try {
      setCurrentStatus("Scraping URL with enhanced mode...");
      
      const response = await fetch("/api/scrape-url-enhanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error("Enhanced scraping failed");

      const data = await response.json();
      
      if (data.success) {
        const prompt = `Clone this website with enhanced data:\n\n${data.content}\n\n${data.screenshot ? `Screenshot: ${data.screenshot}\n\n` : ''}Create a modern React application that replicates this design.`;
        setInput(prompt);
        setCurrentStatus("✅ Enhanced scraping complete!");
        setTimeout(() => setCurrentStatus(""), 2000);
      }
    } catch (error: any) {
      setCurrentStatus(`❌ Enhanced scraping failed: ${error.message}`);
      setTimeout(() => setCurrentStatus(""), 3000);
    }
  };

  // ============================================================================
  // FEATURE 13: Sandbox Logs Viewer
  // ============================================================================
  const viewSandboxLogs = async () => {
    try {
      setCurrentStatus("Fetching sandbox logs...");
      
      const response = await fetch("/api/sandbox-logs");
      if (!response.ok) throw new Error("Failed to fetch logs");

      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs || []);
        setShowLogsDialog(true);
        setCurrentStatus("");
      }
    } catch (error: any) {
      setCurrentStatus(`❌ Failed to fetch logs: ${error.message}`);
      setTimeout(() => setCurrentStatus(""), 3000);
    }
  };

  // ============================================================================
  // FEATURE 14: Deploy to Production
  // ============================================================================
  const handleDeploy = async () => {
    if (!sandboxId) {
      alert("No active sandbox to deploy");
      return;
    }

    setIsDeploying(true);
    setCurrentStatus("Preparing deployment...");

    try {
      // First, create a ZIP of the project
      const zipResponse = await fetch("/api/create-zip", {
        method: "POST"
      });

      if (!zipResponse.ok) throw new Error("Failed to create deployment package");

      const zipData = await zipResponse.json();
      
      // For now, we'll provide the ZIP for manual deployment
      // In a real app, you'd integrate with Vercel/Netlify/etc APIs
      if (zipData.success && zipData.dataUrl) {
        setDeployUrl(zipData.dataUrl);
        setCurrentStatus("✅ Ready for deployment! Download the ZIP to deploy manually.");
        
        // Auto-download
        const link = document.createElement("a");
        link.href = zipData.dataUrl;
        link.download = "deployment-package.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error: any) {
      console.error("Deploy error:", error);
      setCurrentStatus(`❌ Deployment failed: ${error.message}`);
    } finally {
      setIsDeploying(false);
      setTimeout(() => setCurrentStatus(""), 5000);
    }
  };

  // ============================================================================
  // FEATURE 15: File Search
  // ============================================================================
  const searchFiles = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: FileNode[] = [];
    const searchLower = query.toLowerCase();

    const searchInTree = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.name.toLowerCase().includes(searchLower)) {
          results.push(node);
        }
        if (node.content && node.content.toLowerCase().includes(searchLower)) {
          results.push(node);
        }
        if (node.children) {
          searchInTree(node.children);
        }
      });
    };

    searchInTree(fileTree);
    setSearchResults(results.slice(0, 10)); // Limit to 10 results
  };

  // Update search results when query changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      searchFiles(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, fileTree]);

  // ============================================================================
  // Periodic Health Checks & Monitoring
  // ============================================================================
  useEffect(() => {
    if (!sandboxId) return;

    // Health check every 30 seconds
    const healthInterval = setInterval(checkSandboxHealth, 30000);
    
    // Error monitoring every 15 seconds
    const errorInterval = setInterval(monitorErrors, 15000);
    
    // Save conversation state every minute
    const saveInterval = setInterval(saveConversationState, 60000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(errorInterval);
      clearInterval(saveInterval);
    };
  }, [sandboxId, filesGenerated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sandboxId) {
        fetch("/api/kill-sandbox", { method: "POST" }).catch(console.error);
      }
    };
  }, [sandboxId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-16 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">MVP Builder</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sandboxId ? `Sandbox: ${sandboxId.substring(0, 8)}...` : "Initializing..."}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Sandbox Health Indicator */}
              <div className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium",
                sandboxHealth === "healthy" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                sandboxHealth === "unhealthy" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                sandboxHealth === "unknown" && "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
              )}>
                <Activity className="w-3 h-3" />
                <span>{sandboxHealth === "healthy" ? "Healthy" : sandboxHealth === "unhealthy" ? "Unhealthy" : "Checking..."}</span>
              </div>

              {/* Error Badge */}
              {errors.length > 0 && (
                <div className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.length} errors</span>
                </div>
              )}

              {/* Template Button */}
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-lg rounded-lg transition-all flex items-center space-x-2"
                title="Choose UI Template"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden md:inline">Templates</span>
              </button>

              {/* Clone Website Button */}
              <button
                onClick={() => setShowCloneDialog(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2"
                title="Clone a website"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">Clone</span>
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading || !sandboxId}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2",
                  isDownloading || !sandboxId
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                title="Download project"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="hidden md:inline">Download</span>
              </button>

              {/* Restart Vite Button */}
              <button
                onClick={restartVite}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Restart Vite server"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* New Project Button */}
              <button
                onClick={handleCleanup}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Start new project"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Deploy Button */}
              <button
                onClick={handleDeploy}
                disabled={isDeploying || !sandboxId}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2",
                  isDeploying || !sandboxId
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
                )}
                title="Deploy project"
              >
                {isDeploying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                <span className="hidden md:inline">Deploy</span>
              </button>

              {/* Logs Button */}
              <button
                onClick={viewSandboxLogs}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="View sandbox logs"
              >
                <ScrollText className="w-4 h-4" />
              </button>

              {/* Preview Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden lg:inline">{showPreview ? "Hide" : "Show"} Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - File Tree */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Files</h2>
                <span className="text-xs text-gray-500">{filesGenerated} files</span>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery && searchResults.length > 0 ? (
                <div>
                  <p className="text-xs text-gray-500 mb-2">{searchResults.length} results</p>
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFile(result)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-sm mb-1"
                    >
                      <FileCode className="w-3 h-3" />
                      <span className="truncate">{result.path}</span>
                    </button>
                  ))}
                </div>
              ) : searchQuery && searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No results found</p>
                </div>
              ) : fileTree.length > 0 ? (
                renderFileTree(fileTree)
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <FileCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No files yet</p>
                  <p className="text-xs mt-1">Start building to see files</p>
                </div>
              )}
            </div>
          </div>

          {/* Center - Chat */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
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
                      Build Your MVP with AI
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Describe your idea and watch as AI generates production-ready code with live preview
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { icon: Zap, label: "Instant Generation" },
                        { icon: Eye, label: "Live Preview" },
                        { icon: Package, label: "Auto Packages" },
                        { icon: Terminal, label: "Full Sandbox" }
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <item.icon className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                          <p className="text-gray-700 dark:text-gray-300">{item.label}</p>
                        </div>
                      ))}
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
                    exit={{ opacity: 0 }}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === "user"
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.files && message.files.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/20 dark:border-gray-600">
                          <p className="text-xs font-semibold mb-2 opacity-70">Generated Files:</p>
                          <div className="grid grid-cols-2 gap-1">
                            {message.files.slice(0, 6).map((file, idx) => (
                              <div key={idx} className="flex items-center space-x-1 text-xs">
                                <Check className="w-3 h-3" />
                                <span className="truncate">{file.split("/").pop()}</span>
                              </div>
                            ))}
                          </div>
                          {message.files.length > 6 && (
                            <p className="text-xs mt-1 opacity-60">+{message.files.length - 6} more</p>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs opacity-60 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isGenerating && currentStatus && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2 text-gray-500 dark:text-gray-400"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{currentStatus}</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want to build..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                    rows={3}
                    disabled={isGenerating}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={isGenerating || !input.trim()}
                  className={cn(
                    "p-4 rounded-xl transition-all",
                    isGenerating || !input.trim()
                      ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg transform hover:scale-105"
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

          {/* Right - Preview/Code */}
          {showPreview && (
            <div className="w-[45%] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedFile ? selectedFile.name : "Preview"}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  {sandboxUrl && (
                    <a
                      href={sandboxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Open in new tab"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {selectedFile ? (
                  <CodeEditor
                    value={selectedFile.content || ''}
                    language={getLanguageFromFileName(selectedFile.name)}
                    readOnly={true}
                    height="100%"
                    fileName={selectedFile.name}
                    showMinimap={false}
                  />
                ) : sandboxUrl ? (
                  <iframe
                    src={sandboxUrl}
                    className="w-full h-full"
                    title="Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clone Website Dialog */}
      {showCloneDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Globe className="w-5 h-5 text-orange-500" />
                <span>Clone Website</span>
              </h3>
              <button
                onClick={() => setShowCloneDialog(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter a website URL to analyze and clone its design and functionality
            </p>

            <input
              type="url"
              value={cloneUrl}
              onChange={(e) => setCloneUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleCloneWebsite()}
            />

            <div className="flex items-center space-x-3 mb-3">
              <button
                onClick={() => setShowCloneDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloneWebsite}
                disabled={isCloning || !cloneUrl.trim()}
                className={cn(
                  "flex-1 px-4 py-2 rounded-xl transition-colors flex items-center justify-center space-x-2",
                  isCloning || !cloneUrl.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg"
                )}
              >
                {isCloning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cloning...</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    <span>Clone</span>
                  </>
                )}
              </button>
            </div>

            {/* Enhanced Scraping Option */}
            <button
              onClick={() => {
                setShowCloneDialog(false);
                if (cloneUrl.trim()) {
                  scrapeUrlEnhanced(cloneUrl);
                }
              }}
              disabled={isCloning || !cloneUrl.trim()}
              className="w-full px-4 py-2 text-sm border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Enhanced Clone (with screenshot)</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* Logs Dialog */}
      {showLogsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <ScrollText className="w-5 h-5 text-orange-500" />
                <span>Sandbox Logs</span>
              </h3>
              <button
                onClick={() => setShowLogsDialog(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No logs available</div>
              )}
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <button
                onClick={viewSandboxLogs}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Logs</span>
              </button>
              <button
                onClick={() => setShowLogsDialog(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Bar */}
      {currentStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-w-md"
        >
          <div className="flex items-center space-x-3">
            {currentStatus.includes("✅") ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : currentStatus.includes("❌") ? (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 text-orange-500 animate-spin flex-shrink-0" />
            )}
            <p className="text-sm text-gray-900 dark:text-white">{currentStatus}</p>
          </div>
        </motion.div>
      )}

      {/* Package Info Panel */}
      {packagesInstalled.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Package className="w-4 h-4 text-orange-500" />
              <span>Packages</span>
            </h4>
            <span className="text-xs text-gray-500">{packagesInstalled.length}</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {packagesInstalled.slice(0, 5).map((pkg, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <Check className="w-3 h-3 text-green-500" />
                <span className="truncate">{pkg}</span>
              </div>
            ))}
            {packagesInstalled.length > 5 && (
              <p className="text-xs text-gray-500">+{packagesInstalled.length - 5} more</p>
            )}
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
};

export default MVPBuilder;
