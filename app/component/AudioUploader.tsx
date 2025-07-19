'use client';

import { useState } from 'react';

export default function AudioUploader() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!audioFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch('/api/analyze-call', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
        🎧 Call Analyzer
      </h1>

      <input
        type="file"
        accept=".mp3,.wav"
        onChange={handleFileChange}
        className="block w-full border border-gray-300 rounded p-2 mb-4 text-sm"
      />

      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          className="mb-4 w-full rounded-md border"
        />
      )}

      <button
        onClick={handleProcess}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Analyze Call'}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded shadow-inner">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            🧾 Analysis Result:
          </h2>
          <pre className="text-sm bg-white p-3 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
