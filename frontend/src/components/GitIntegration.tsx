import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Loader2, Check, AlertCircle, ExternalLink, Lock, Unlock } from 'lucide-react';
import { isGitHubConnected, connectGitHub, exportToGitHub } from '@/lib/git/githubApi';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface GitIntegrationProps {
  files: Record<string, string>;
  projectName?: string;
  onSuccess?: (repoUrl: string) => void;
}

const GitIntegration = ({ files, projectName = 'nexora-project', onSuccess }: GitIntegrationProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [repoName, setRepoName] = useState(projectName);
  const [description, setDescription] = useState('Created with NEXORA AI');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await isGitHubConnected();
      setIsConnected(connected);
    } catch (error) {
      console.error('Failed to check GitHub connection:', error);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleConnect = () => {
    connectGitHub();
  };

  const handleExport = async () => {
    if (!repoName.trim()) {
      toast.error('Please enter a repository name');
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportToGitHub(
        repoName.trim(),
        files,
        description.trim() || 'Created with NEXORA AI',
        isPrivate
      );

      if (result.success) {
        toast.success('Successfully exported to GitHub!');
        setShowForm(false);
        onSuccess?.(result.repoUrl);
        
        // Open repo in new tab
        window.open(result.repoUrl, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to export to GitHub');
    } finally {
      setIsExporting(false);
    }
  };

  if (checkingConnection) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <Github className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Connect GitHub
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Connect your GitHub account to export projects directly to repositories
          </p>
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Github className="w-5 h-5" />
            <span>Connect GitHub</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
        >
          <Github className="w-5 h-5" />
          <span>Export to GitHub</span>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Github className="w-5 h-5" />
            <span>Export to GitHub</span>
          </h3>

          <div className="space-y-4">
            {/* Repository Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repository Name *
              </label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-awesome-project"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled={isExporting}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project description..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                disabled={isExporting}
              />
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center space-x-3">
                {isPrivate ? (
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Unlock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isPrivate ? 'Private' : 'Public'} Repository
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isPrivate ? 'Only you can see this repo' : 'Anyone can see this repo'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  isPrivate ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                )}
                disabled={isExporting}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    isPrivate ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || !repoName.trim()}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2',
                  isExporting || !repoName.trim()
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                )}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    <span>Create Repository</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GitIntegration;
