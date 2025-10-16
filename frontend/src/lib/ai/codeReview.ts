import { apiClient } from '@/lib/api/apiClient';

export interface CodeIssue {
  type: 'error' | 'warning' | 'info' | 'suggestion';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
  category: 'security' | 'performance' | 'style' | 'bug' | 'best-practice';
}

export interface CodeReviewResult {
  score: number; // 0-100
  issues: CodeIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  strengths: string[];
}

export const reviewCode = async (
  files: Record<string, string>
): Promise<CodeReviewResult> => {
  return await apiClient.post<CodeReviewResult>('/api/ai/code-review', { files });
};

export const reviewSingleFile = async (
  fileName: string,
  content: string
): Promise<CodeIssue[]> => {
  const result = await apiClient.post<{ issues: CodeIssue[] }>('/api/ai/review-file', {
    fileName,
    content,
  });
  return result.issues;
};

export const getSuggestion = async (
  code: string,
  context: string
): Promise<string> => {
  const result = await apiClient.post<{ suggestion: string }>('/api/ai/suggest', {
    code,
    context,
  });
  return result.suggestion;
};

export const fixIssue = async (
  code: string,
  issue: CodeIssue
): Promise<string> => {
  const result = await apiClient.post<{ fixedCode: string }>('/api/ai/fix-issue', {
    code,
    issue,
  });
  return result.fixedCode;
};

// Helper functions
export const getIssueSeverityColor = (severity: CodeIssue['severity']): string => {
  const colors = {
    critical: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
    high: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
    medium: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
    low: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  };
  return colors[severity];
};

export const getIssueTypeIcon = (type: CodeIssue['type']): string => {
  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    suggestion: '💡',
  };
  return icons[type];
};

export const getCategoryIcon = (category: CodeIssue['category']): string => {
  const icons = {
    security: '🔒',
    performance: '⚡',
    style: '🎨',
    bug: '🐛',
    'best-practice': '✨',
  };
  return icons[category];
};
