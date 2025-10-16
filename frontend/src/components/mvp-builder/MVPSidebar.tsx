import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Rocket,
  Lightbulb,
  ListChecks,
  Code2,
  FileCode,
  Eye,
  CloudUpload,
  CreditCard,
  Settings,
  Moon,
  Sun,
  PlusCircle,
  Edit2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  icon: any;
  completed: boolean;
  active: boolean;
}

interface MVPSidebarProps {
  projectTitle: string;
  onTitleChange: (title: string) => void;
  currentStep: string;
  onStepChange: (stepId: string) => void;
  credits: number;
  apiUsage: number;
  onNewMVP: () => void;
}

const MVPSidebar: React.FC<MVPSidebarProps> = ({
  projectTitle,
  onTitleChange,
  currentStep,
  onStepChange,
  credits,
  apiUsage,
  onNewMVP
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(projectTitle);
  const [darkMode, setDarkMode] = useState(false);

  const steps: Step[] = [
    { id: "idea", label: "Idea Summary", icon: Lightbulb, completed: true, active: currentStep === "idea" },
    { id: "features", label: "Feature Breakdown", icon: ListChecks, completed: false, active: currentStep === "features" },
    { id: "techstack", label: "Tech Stack", icon: Code2, completed: false, active: currentStep === "techstack" },
    { id: "generation", label: "Code Generation", icon: FileCode, completed: false, active: currentStep === "generation" },
    { id: "preview", label: "Preview", icon: Eye, completed: false, active: currentStep === "preview" },
    { id: "deploy", label: "Deployment", icon: CloudUpload, completed: false, active: currentStep === "deploy" }
  ];

  const handleSaveTitle = () => {
    onTitleChange(editedTitle);
    setIsEditingTitle(false);
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header with Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">MVP Builder</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered</p>
          </div>
        </div>

        {/* Project Title */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Project Name</label>
          {isEditingTitle ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              />
              <button
                onClick={handleSaveTitle}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
            >
              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{projectTitle}</span>
              <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Build Steps</h3>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <motion.button
              key={step.id}
              onClick={() => onStepChange(step.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all text-left",
                step.active 
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg" 
                  : step.completed
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                step.active 
                  ? "bg-white/20" 
                  : step.completed
                  ? "bg-green-500/20"
                  : "bg-gray-200 dark:bg-gray-600"
              )}>
                <step.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{step.label}</div>
                <div className={cn(
                  "text-xs",
                  step.active ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                )}>
                  {step.completed ? "Completed" : step.active ? "In Progress" : "Pending"}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Credits & Usage */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Credits</span>
            </div>
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{credits}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-600 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min((apiUsage / 100) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {apiUsage}/100 API calls this month
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Theme</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Settings Button */}
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all">
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
        </button>

        {/* Start New MVP */}
        <button
          onClick={onNewMVP}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Start New MVP</span>
        </button>
      </div>
    </div>
  );
};

export default MVPSidebar;
