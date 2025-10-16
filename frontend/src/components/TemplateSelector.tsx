import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Check } from 'lucide-react';
import { uiTemplates, getAllCategories, getTemplatesByCategory, UITemplate } from '@/lib/templates/uiTemplates';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: UITemplate) => void;
}

const TemplateSelector = ({ isOpen, onClose, onSelectTemplate }: TemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<UITemplate | null>(null);

  const categories = ['All', ...getAllCategories()];

  const filteredTemplates = uiTemplates.filter((template) => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template: UITemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Choose a UI Template
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select a beautiful pre-designed template to start with
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center space-x-2 mt-4 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap',
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Search className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">No templates found</p>
                <p className="text-sm">Try adjusting your search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      'relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all group',
                      selectedTemplate?.id === template.id
                        ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                    )}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    {/* Preview Image Placeholder */}
                    <div
                      className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${template.colors.primary}20 0%, ${template.colors.secondary}20 100%)`,
                      }}
                    >
                      <div className="text-center p-4">
                        <div
                          className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: template.colors.primary }}
                        >
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Preview</p>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {selectedTemplate?.id === template.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Features */}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {template.features.length} features included
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedTemplate ? (
                <span>
                  Selected: <strong className="text-gray-900 dark:text-white">{selectedTemplate.name}</strong>
                </span>
              ) : (
                <span>Select a template to continue</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedTemplate}
                className={cn(
                  'px-6 py-2 rounded-lg font-medium transition-all',
                  selectedTemplate
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                )}
              >
                Use Template
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TemplateSelector;
