import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Layout, 
  Database, 
  Palette, 
  Eye, 
  Code,
  Zap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  label: string;
  icon: any;
  prompt: string;
  category: "ui" | "api" | "feature" | "preview";
}

interface SmartSuggestionsBarProps {
  suggestions: Suggestion[];
  onSelectSuggestion: (prompt: string) => void;
  isVisible: boolean;
}

const defaultSuggestions: Suggestion[] = [
  {
    id: "generate-ui",
    label: "Generate UI",
    icon: Layout,
    prompt: "Create a beautiful, modern UI with responsive design and smooth animations",
    category: "ui"
  },
  {
    id: "add-api",
    label: "Add API Integration",
    icon: Database,
    prompt: "Add API integration with proper error handling and loading states",
    category: "api"
  },
  {
    id: "improve-design",
    label: "Improve Design",
    icon: Palette,
    prompt: "Enhance the visual design with better colors, typography, and spacing",
    category: "ui"
  },
  {
    id: "show-preview",
    label: "Show Preview",
    icon: Eye,
    prompt: "Show me a live preview of the current application",
    category: "preview"
  },
  {
    id: "optimize-code",
    label: "Optimize Code",
    icon: Zap,
    prompt: "Optimize the code for better performance and best practices",
    category: "feature"
  },
  {
    id: "add-authentication",
    label: "Add Auth",
    icon: Code,
    prompt: "Add user authentication with login, signup, and protected routes",
    category: "feature"
  }
];

const SmartSuggestionsBar: React.FC<SmartSuggestionsBarProps> = ({
  suggestions = defaultSuggestions,
  onSelectSuggestion,
  isVisible = true
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ui": return "from-purple-500 to-pink-600";
      case "api": return "from-blue-500 to-cyan-600";
      case "feature": return "from-green-500 to-emerald-600";
      case "preview": return "from-orange-500 to-red-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 border-b border-orange-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Smart Suggestions
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Click to try
            </span>
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-transparent">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.id}
                onClick={() => onSelectSuggestion(suggestion.prompt)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "group relative flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg",
                  "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600",
                  "hover:border-orange-300 dark:hover:border-orange-600"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br",
                  getCategoryColor(suggestion.category)
                )}>
                  <suggestion.icon className="w-4 h-4 text-white" />
                </div>
                
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {suggestion.label}
                </span>

                <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {suggestion.prompt}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 -mt-1"></div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartSuggestionsBar;

// Add scrollbar hide utility to global CSS if not present
// .scrollbar-hide::-webkit-scrollbar { display: none; }
// .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
