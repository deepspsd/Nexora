import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  File,
  FolderOpen,
  FolderTree,
  FileCode,
  Component,
  Palette,
  FileJson,
  Globe,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  language: string;
  size?: number;
  modified?: boolean;
  children?: ProjectFile[];
}

interface FileTreeProps {
  files: ProjectFile[];
  selectedFile: string | null;
  onSelectFile: (path: string, content: string) => void;
  className?: string;
}

const FileTreeItem: React.FC<{
  file: ProjectFile;
  selectedFile: string | null;
  onSelectFile: (path: string, content: string) => void;
  level: number;
}> = ({ file, selectedFile, onSelectFile, level }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isFolder = file.children && file.children.length > 0;
  
  const getFileIcon = (fileName: string, isFolder: boolean) => {
    if (isFolder) return isExpanded ? FolderOpen : FolderTree;
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return Component;
      case 'ts':
      case 'js':
        return FileCode;
      case 'css':
        return Palette;
      case 'json':
        return FileJson;
      case 'html':
        return Globe;
      case 'md':
        return FileText;
      default:
        return File;
    }
  };
  
  const Icon = getFileIcon(file.name, isFolder);
  
  return (
    <div>
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: level * 0.02 }}
        onClick={() => {
          if (isFolder) {
            setIsExpanded(!isExpanded);
          } else {
            onSelectFile(file.path, file.content);
          }
        }}
        className={cn(
          "w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-all",
          selectedFile === file.path && !isFolder
            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-l-2 border-purple-500"
            : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
        )}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        {isFolder && (
          <ChevronRight 
            className={cn(
              "w-3 h-3 flex-shrink-0 transition-transform",
              isExpanded && "rotate-90"
            )} 
          />
        )}
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate flex-1 text-left">{file.name}</span>
        {file.modified && (
          <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
        )}
      </motion.button>
      
      {isFolder && isExpanded && file.children && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {file.children.map((child) => (
            <FileTreeItem
              key={child.path}
              file={child}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              level={level + 1}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedFile,
  onSelectFile,
  className
}) => {
  const buildFileTree = (files: ProjectFile[]): ProjectFile[] => {
    const root: { [key: string]: any } = {};
    
    files.forEach(file => {
      const parts = file.path.split('/').filter(p => p);
      let current = root;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          if (!current.files) current.files = [];
          current.files.push(file);
        } else {
          if (!current[part]) {
            current[part] = { files: [] };
          }
          current = current[part];
        }
      });
    });
    
    const convertToProjectFiles = (obj: any, path: string = ''): ProjectFile[] => {
      const result: ProjectFile[] = [];
      
      Object.keys(obj).forEach(key => {
        if (key !== 'files') {
          const dirPath = path ? `${path}/${key}` : key;
          const children = convertToProjectFiles(obj[key], dirPath);
          result.push({
            name: key,
            path: dirPath,
            content: '',
            language: 'folder',
            children: children
          });
        }
      });
      
      if (obj.files && Array.isArray(obj.files)) {
        result.push(...obj.files);
      }
      
      return result;
    };
    
    return convertToProjectFiles(root);
  };
  
  const treeStructure = buildFileTree(files);
  
  return (
    <div className={cn("h-full overflow-y-auto", className)}>
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
            Project Files
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {files.length} files
          </p>
        </div>
        
        <div className="space-y-1">
          {treeStructure.map((file) => (
            <FileTreeItem
              key={file.path}
              file={file}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              level={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
