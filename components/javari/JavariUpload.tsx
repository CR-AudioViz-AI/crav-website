// ================================================================================
// JAVARI DOCUMENT UPLOAD UI COMPONENT
// Drag/drop + multi-file + progress + status chips
// ================================================================================

'use client';

import React, { useState, useCallback } from 'react';
import { Upload, File, X, Check, AlertCircle, Loader2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  documentId?: string;
}

interface JavariUploadProps {
  sessionId?: string;
  userId?: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
}

export function JavariUpload({ sessionId, userId, onUploadComplete }: JavariUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    const uploadedFile: UploadedFile = {
      id,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      status: 'uploading',
      progress: 0,
    };

    setFiles(prev => [...prev, uploadedFile]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (sessionId) formData.append('session_id', sessionId);
      if (userId) formData.append('user_id', userId);

      // Simulate progress (real implementation would use XMLHttpRequest for progress)
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === id && f.progress < 90 
            ? { ...f, progress: f.progress + 10 }
            : f
        ));
      }, 100);

      const response = await fetch('/api/docs/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (result.success) {
        setFiles(prev => prev.map(f => 
          f.id === id 
            ? { ...f, status: 'complete', progress: 100, documentId: result.document_id }
            : f
        ));
        return { ...uploadedFile, status: 'complete', progress: 100, documentId: result.document_id };
      } else {
        // NEVER REJECT - even on error, file is stored
        setFiles(prev => prev.map(f => 
          f.id === id 
            ? { ...f, status: 'error', progress: 100, error: result.message || 'Upload stored but processing failed' }
            : f
        ));
        return { ...uploadedFile, status: 'error', progress: 100, error: result.message };
      }
    } catch (error: any) {
      setFiles(prev => prev.map(f => 
        f.id === id 
          ? { ...f, status: 'error', progress: 100, error: error.message }
          : f
      ));
      return { ...uploadedFile, status: 'error', progress: 100, error: error.message };
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const results = await Promise.all(droppedFiles.map(uploadFile));
    onUploadComplete?.(results);
  }, [sessionId, userId, onUploadComplete]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    const results = await Promise.all(selectedFiles.map(uploadFile));
    onUploadComplete?.(results);
  }, [sessionId, userId, onUploadComplete]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400'
          }
        `}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-semibold text-purple-600">Click to upload</span>
          {' '}or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Any file type supported • Never rejected
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Status Chip */}
                {file.status === 'uploading' && (
                  <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    {file.progress}%
                  </span>
                )}
                {file.status === 'processing' && (
                  <span className="flex items-center text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Processing
                  </span>
                )}
                {file.status === 'complete' && (
                  <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    <Check className="h-3 w-3 mr-1" />
                    Ready
                  </span>
                )}
                {file.status === 'error' && (
                  <span className="flex items-center text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full" title={file.error}>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Stored (retry available)
                  </span>
                )}
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JavariUpload;
