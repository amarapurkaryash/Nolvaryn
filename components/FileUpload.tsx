
import React, { useCallback, useState, useRef } from 'react';

interface FileUploadProps {
  onFileUpload: (emlFile: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.eml')) {
      return 'Please upload a valid .eml email file';
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
    }

    return null;
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      onFileUpload(file);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen w-full max-w-6xl mx-auto text-center p-8">
      <h1 className="text-5xl font-extrabold text-text-heading mb-6">
        Email Security Analysis Platform
      </h1>
      <p className="text-xl text-text-muted-1 mb-12 max-w-4xl mx-auto">
        Advanced AI-powered phishing threat detection for security teams and individuals
      </p>
      
      {/* EML Upload Section - Desktop Optimized */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`p-20 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${isDragging ? 'border-accent-primary bg-secondary-bg/50' : 'border-border-dark hover:border-accent-secondary bg-secondary-bg'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".eml"
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg max-w-md">
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-2">error</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          <span className="material-symbols-outlined text-8xl text-accent-primary transition-colors duration-300">cloud_upload</span>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-text-heading">
              Upload Email File for Analysis
            </h2>
            <p className="text-lg text-text-muted-2">
              Drag & drop your <code className="bg-secondary-bg text-accent-secondary px-2 py-1 rounded-md font-mono">.eml</code> file or click to browse
            </p>
            <div className="bg-primary-bg/10 border border-border-dark rounded-lg p-4 max-w-md">
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-2xl text-accent-primary">security</span>
                <div className="text-left">
                  <p className="font-semibold text-text-heading mb-2">AI-Powered Security Analysis</p>
                  <ul className="text-sm text-text-muted-2 space-y-1">
                    <li>• Advanced phishing detection</li>
                    <li>• IP geolocation analysis</li>
                    <li>• MITRE ATT&CK framework mapping</li>
                    <li>• Comprehensive threat reporting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <p className="text-base text-text-muted-1">
            <span className="text-accent-secondary font-semibold">Desktop-optimized interface</span> designed for security teams and analysts
          </p>
          <p className="text-sm text-text-muted-2">
            Supports large screens, high-resolution displays, and detailed analysis workflows
          </p>
        </div>
      </div>
    </div>
  );
};
