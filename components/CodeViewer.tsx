
import React, { useState } from 'react';
import { ExtensionFile } from '../types';

interface CodeViewerProps {
  files: ExtensionFile[];
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(files[selectedFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      <div className="flex flex-col md:flex-row h-[600px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-100 border-r border-slate-200 overflow-y-auto">
          <div className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Cấu trúc tệp</div>
          {files.map((file, idx) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(idx)}
              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                selectedFile === idx 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              {file.path}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <span className="text-sm font-mono text-slate-600 truncate">{files[selectedFile].path}</span>
            <button 
              onClick={handleCopy}
              className="text-xs bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-md font-medium transition-all"
            >
              {copied ? 'Đã sao chép!' : 'Sao chép mã'}
            </button>
          </div>
          <pre className="flex-1 overflow-auto p-4 bg-slate-900 text-slate-300 font-mono text-sm leading-relaxed">
            <code>{files[selectedFile].content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
