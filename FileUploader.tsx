

import React, { useState, useCallback } from 'react';
import { UploadIcon, FileTextIcon } from './icons';

interface FileUploaderProps {
  onFileUpload: (file: File, textContent: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File | null) => {
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const textContent = e.target?.result as string;
          if (textContent) {
            setFileName(file.name);
            setError(null);
            onFileUpload(file, textContent);
          } else {
            setError("Could not read file content.");
            setFileName(null);
          }
        };
        reader.onerror = () => {
          setError("Error reading file.");
          setFileName(null);
        };
        reader.readAsText(file);
      } else {
        setError("Invalid file type. Please upload a .txt file for this demo.");
        setFileName(null);
      }
    }
  }, [onFileUpload]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file || null);
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
        ${isDragging ? 'border-indigo-500 bg-slate-800' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {fileName ? (
                <>
                    <FileTextIcon className="w-10 h-10 mb-3 text-green-500" />
                    <p className="mb-2 text-sm text-slate-300"><span className="font-semibold">{fileName}</span></p>
                    <p className="text-xs text-slate-500">Drop another file or click to replace</p>
                </>
            ) : (
                <>
                    <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">TXT files only (for demo purposes)</p>
                </>
            )}
        </div>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt" />
      </label>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};