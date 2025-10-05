import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { 
  Rocket, 
  Code, 
  Zap, 
  CheckCircle, 
  Loader2,
  Download,
  Globe,
  Smartphone,
  Monitor,
  Sparkles,
  Play,
  RefreshCw,
  FileCode,
  Terminal,
  Eye
} from "lucide-react";
import { buildMVP, refineMVP } from "@/lib/api";

interface FilePreview {
  path: string;
  preview: string;
  size: number;
  language: string;
}

const MVPDevelopment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    productName: "",
    productIdea: location.state?.idea || "",
    coreFeatures: [""],
    targetPlatform: "web",
    techStack: ["React", "TypeScript", "Tailwind CSS"],
    projectType: "web-app"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [mvpResult, setMvpResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<FilePreview | null>(null);
  const [refinementFeedback, setRefinementFeedback] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const platforms = [
    { id: "web", label: "Web App", icon: Globe },
    { id: "mobile", label: "Mobile App", icon: Smartphone },
    { id: "desktop", label: "Desktop App", icon: Monitor }
  ];

  const techStacks = [
    "React", "Vue.js", "Next.js", "TypeScript", "JavaScript",
    "Tailwind CSS", "Node.js", "Express", "FastAPI", "PostgreSQL", "MongoDB"
  ];

  const addFeature = () => {
    setFormData({ ...formData, coreFeatures: [...formData.coreFeatures, ""] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.coreFeatures];
    newFeatures[index] = value;
    setFormData({ ...formData, coreFeatures: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.coreFeatures.filter((_, i) => i !== index);
    setFormData({ ...formData, coreFeatures: newFeatures });
  };

  const toggleTechStack = (tech: string) => {
    const newStack = formData.techStack.includes(tech)
      ? formData.techStack.filter(t => t !== tech)
      : [...formData.techStack, tech];
    setFormData({ ...formData, techStack: newStack });
  };

  const handleGenerate = async () => {
    if (!formData.productName.trim() || !formData.productIdea.trim()) {
      setError("Please enter product name and idea");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const userId = localStorage.getItem("userId");
      const userSubscription = localStorage.getItem("userSubscription") || "free";
      
      const result = await buildMVP({
        productName: formData.productName,
        productIdea: formData.productIdea,
        coreFeatures: formData.coreFeatures.filter(f => f.trim()),
        targetPlatform: formData.targetPlatform,
        techStack: formData.techStack,
        projectType: formData.projectType,
        generateMultipleFiles: true,
        includeComponents: true,
        defaultLanguage: "react",
        userId: userId || undefined,
        userSubscription
      });

      setMvpResult(result.data);
      if (result.data.files && result.data.files.length > 0) {
        setSelectedFile(result.data.files[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate MVP. Please try again.");
      console.error("MVP generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refinementFeedback.trim() || !mvpResult?.html) {
      return;
    }

    setIsRefining(true);

    try {
      const userId = localStorage.getItem("userId");
      const userSubscription = localStorage.getItem("userSubscription") || "free";
      
      const result = await refineMVP({
        currentHtml: mvpResult.html,
        feedback: refinementFeedback,
        userId: userId || undefined,
        userSubscription
      });

      setMvpResult(result.data);
      setRefinementFeedback("");
    } catch (err: any) {
      setError(err.message || "Failed to refine MVP. Please try again.");
      console.error("MVP refinement error:", err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleDownload = () => {
    if (mvpResult?.artifact_zip) {
      window.open(mvpResult.artifact_zip, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
              <Rocket className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">AI-Powered Development</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Build Your MVP in Minutes
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Generate production-ready code with AI. No coding required - just describe what you want to build
            </p>
          </motion.div>

          {!mvpResult ? (
            /* Input Form */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="e.g., TaskMaster Pro, FitTrack AI"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Product Idea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Description *
                    </label>
                    <textarea
                      value={formData.productIdea}
                      onChange={(e) => setFormData({ ...formData, productIdea: e.target.value })}
                      placeholder="Describe your product in detail. What does it do? Who is it for? What problems does it solve?"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 min-h-[120px] resize-none"
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Core Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Core Features
                    </label>
                    <div className="space-y-2">
                      {formData.coreFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            placeholder={`Feature ${index + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
                            disabled={isGenerating}
                          />
                          {formData.coreFeatures.length > 1 && (
                            <button
                              onClick={() => removeFeature(index)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              disabled={isGenerating}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addFeature}
                        className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
                        disabled={isGenerating}
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Platform
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {platforms.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => setFormData({ ...formData, targetPlatform: platform.id })}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-2",
                            formData.targetPlatform === platform.id
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30"
                              : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700"
                          )}
                          disabled={isGenerating}
                        >
                          <platform.icon className={cn(
                            "w-6 h-6",
                            formData.targetPlatform === platform.id ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"
                          )} />
                          <span className={cn(
                            "text-sm font-medium",
                            formData.targetPlatform === platform.id ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {platform.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tech Stack (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {techStacks.map((tech) => (
                        <button
                          key={tech}
                          onClick={() => toggleTechStack(tech)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                            formData.techStack.includes(tech)
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          )}
                          disabled={isGenerating}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !formData.productName.trim() || !formData.productIdea.trim()}
                    className={cn(
                      "w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2",
                      isGenerating || !formData.productName.trim() || !formData.productIdea.trim()
                        ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Building Your MVP...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        <span>Generate MVP</span>
                      </>
                    )}
                  </button>

                  {/* Info Cards */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {[
                      { icon: Zap, label: "15-30 min", sublabel: "Generation Time" },
                      { icon: Code, label: "Production Ready", sublabel: "Clean Code" },
                      { icon: CheckCircle, label: "Auto Tested", sublabel: "Bug Free" }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <item.icon className="w-6 h-6 text-orange-500 dark:text-orange-400 mx-auto mb-2" />
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.sublabel}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* MVP Results */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Header with Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {formData.productName}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Build: {mvpResult.build_status}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Tests: {mvpResult.test_status}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:shadow-md transition-all"
                  >
                    <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Download ZIP</span>
                  </button>
                  <button
                    onClick={() => setMvpResult(null)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
                  >
                    New Project
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* File Explorer */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                        <FileCode className="w-5 h-5" />
                        <span>Project Files</span>
                      </h3>
                    </div>
                    <div className="p-2 max-h-[600px] overflow-y-auto">
                      {mvpResult.files && mvpResult.files.map((file: FilePreview, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedFile(file)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg transition-all mb-1",
                            selectedFile?.path === file.path
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Code className="w-4 h-4" />
                            <span className="text-sm font-medium truncate">{file.path}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Code Preview / Live Preview */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Live Preview */}
                  {mvpResult.livePreviewHtml && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <Eye className="w-5 h-5" />
                          <span>Live Preview</span>
                        </h3>
                        {mvpResult.preview_url && (
                          <a
                            href={mvpResult.preview_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1"
                          >
                            <Globe className="w-4 h-4" />
                            <span>Open in New Tab</span>
                          </a>
                        )}
                      </div>
                      <div className="aspect-video bg-gray-100 dark:bg-gray-900">
                        <iframe
                          srcDoc={mvpResult.livePreviewHtml}
                          className="w-full h-full"
                          sandbox="allow-scripts allow-same-origin"
                          title="MVP Preview"
                        />
                      </div>
                    </div>
                  )}

                  {/* Code Preview */}
                  {selectedFile && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <Terminal className="w-5 h-5" />
                          <span>{selectedFile.path}</span>
                        </h3>
                      </div>
                      <div className="p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto max-h-[400px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{selectedFile.preview}</pre>
                      </div>
                    </div>
                  )}

                  {/* Refinement Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <RefreshCw className="w-5 h-5 text-orange-500" />
                      <span>Refine Your MVP</span>
                    </h3>
                    <div className="space-y-3">
                      <textarea
                        value={refinementFeedback}
                        onChange={(e) => setRefinementFeedback(e.target.value)}
                        placeholder="Describe what you'd like to change or improve..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 min-h-[100px] resize-none"
                        disabled={isRefining}
                      />
                      <button
                        onClick={handleRefine}
                        disabled={isRefining || !refinementFeedback.trim()}
                        className={cn(
                          "w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center space-x-2",
                          isRefining || !refinementFeedback.trim()
                            ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                            : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                        )}
                      >
                        {isRefining ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Refining...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Apply Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              {mvpResult.next_steps && mvpResult.next_steps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Next Steps</h3>
                  <div className="space-y-2">
                    {mvpResult.next_steps.map((step: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MVPDevelopment;
