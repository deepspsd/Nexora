import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, CheckCircle, Info, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { reviewCode, CodeReviewResult, CodeIssue, getIssueSeverityColor, getIssueTypeIcon, getCategoryIcon } from '@/lib/ai/codeReview';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AICodeReviewProps {
  files: Record<string, string>;
  onIssueClick?: (issue: CodeIssue) => void;
}

const AICodeReview = ({ files, onIssueClick }: AICodeReviewProps) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [result, setResult] = useState<CodeReviewResult | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

  const handleReview = async () => {
    if (Object.keys(files).length === 0) {
      toast.error('No files to review');
      return;
    }

    setIsReviewing(true);
    try {
      const reviewResult = await reviewCode(files);
      setResult(reviewResult);
      toast.success('Code review completed!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to review code');
    } finally {
      setIsReviewing(false);
    }
  };

  const toggleIssue = (index: number) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIssues(newExpanded);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Review Button */}
      {!result && (
        <button
          onClick={handleReview}
          disabled={isReviewing}
          className={cn(
            'w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2',
            isReviewing
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg'
          )}
        >
          {isReviewing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Reviewing Code...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>AI Code Review</span>
            </>
          )}
        </button>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Score Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Code Quality Score
                </h3>
                <button
                  onClick={handleReview}
                  className="text-sm text-orange-500 hover:text-orange-600 flex items-center space-x-1"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Re-review</span>
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.score / 100)}`}
                      className={getScoreColor(result.score)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn('text-2xl font-bold', getScoreColor(result.score))}>
                      {result.score}
                    </span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {result.summary.critical} Critical
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {result.summary.high} High
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {result.summary.medium} Medium
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {result.summary.low} Low
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <h4 className="font-bold text-green-800 dark:text-green-300 mb-2 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Strengths</span>
                </h4>
                <ul className="space-y-1">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-green-700 dark:text-green-400 flex items-start space-x-2">
                      <span>✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                  Issues Found ({result.issues.length})
                </h4>
                <div className="space-y-2">
                  {result.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleIssue(idx)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 text-left">
                          <span className="text-xl">{getIssueTypeIcon(issue.type)}</span>
                          <span className="text-sm">{getCategoryIcon(issue.category)}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={cn('text-xs font-medium px-2 py-1 rounded', getIssueSeverityColor(issue.severity))}>
                                {issue.severity.toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {issue.file}
                              </span>
                              {issue.line && (
                                <span className="text-xs text-gray-500">Line {issue.line}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {issue.message}
                            </p>
                          </div>
                        </div>
                        {expandedIssues.has(idx) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {expandedIssues.has(idx) && issue.suggestion && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 bg-gray-50 dark:bg-gray-900"
                        >
                          <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                Suggestion:
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-400">
                                {issue.suggestion}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>Recommendations</span>
                </h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-blue-700 dark:text-blue-400 flex items-start space-x-2">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICodeReview;
