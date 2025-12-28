
import React, { useState, useCallback } from 'react';
import { generateExtension } from './services/geminiService';
import { AppStatus, ExtensionResult } from './types';
import CodeViewer from './components/CodeViewer';

declare const JSZip: any;

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<ExtensionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setStatus(AppStatus.GENERATING);
    setError(null);
    try {
      const data = await generateExtension(prompt);
      setResult(data);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra trong quá trình tạo mã.');
      setStatus(AppStatus.ERROR);
    }
  };

  const downloadAsZip = useCallback(() => {
    if (!result || !JSZip) return;

    const zip = new JSZip();
    result.files.forEach(file => {
      zip.file(file.path, file.content);
    });

    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.name.replace(/\s+/g, '_')}_extension.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
            Chrome Extension <span className="text-blue-600">AI Builder</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Nhập ý tưởng của bạn, AI sẽ tạo ra mã nguồn Chrome Extension hoàn chỉnh (Manifest V3) chỉ trong vài giây.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-10 border border-slate-100">
          <form onSubmit={handleGenerate}>
            <div className="mb-4">
              <label htmlFor="prompt" className="block text-sm font-semibold text-slate-700 mb-2">
                Yêu cầu của bạn
              </label>
              <textarea
                id="prompt"
                rows={4}
                className="block w-full rounded-xl border-slate-300 border p-4 shadow-sm bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 text-slate-800 placeholder-slate-400 sm:text-sm transition-colors"
                placeholder="Ví dụ: Tạo một extension thay đổi màu nền của trang web hiện tại thành màu xanh dương khi nhấn vào icon..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={status === AppStatus.GENERATING}
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={status === AppStatus.GENERATING || !prompt.trim()}
                className={`
                  inline-flex items-center px-8 py-3 rounded-full text-base font-bold text-white shadow-lg transition-all
                  ${status === AppStatus.GENERATING 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'}
                `}
              >
                {status === AppStatus.GENERATING ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo mã...
                  </>
                ) : 'Bắt đầu tạo'}
              </button>
            </div>
          </form>
        </div>

        {/* Error State */}
        {status === AppStatus.ERROR && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
            <p className="font-bold">Lỗi!</p>
            <p>{error}</p>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{result.name}</h2>
                <p className="text-slate-600">{result.description}</p>
              </div>
              <button
                onClick={downloadAsZip}
                className="inline-flex items-center px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all whitespace-nowrap"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Tải xuống (.zip)
              </button>
            </div>

            <CodeViewer files={result.files} />

            {/* How to use */}
            <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Cách cài đặt Extension
              </h3>
              <ol className="list-decimal list-inside text-blue-800 space-y-2 text-sm">
                <li>Tải xuống file ZIP và giải nén vào một thư mục trên máy tính.</li>
                <li>Mở trình duyệt Chrome và truy cập địa chỉ: <code className="bg-blue-100 px-1 rounded">chrome://extensions/</code></li>
                <li>Bật <strong>Chế độ dành cho nhà phát triển</strong> (Developer mode) ở góc trên bên phải.</li>
                <li>Nhấn vào nút <strong>Tải tiện ích đã giải nén</strong> (Load unpacked) và chọn thư mục bạn vừa giải nén.</li>
                <li>Tận hưởng thành quả!</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-slate-400 text-sm">
        <p>© 2024 AI Chrome Extension Generator. Powered by Gemini 3.</p>
      </footer>
    </div>
  );
};

export default App;
