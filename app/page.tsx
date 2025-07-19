'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setAudioUrl(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.type === 'audio/mpeg' || droppedFile.type === 'audio/wav')) {
      handleFileSelect(droppedFile);
    } else {
      setError('Only .mp3 or .wav files are supported.');
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-call', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.detail || 'Failed to analyze call');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>AI Call Analyzer</h1>

      <div
        className={styles.uploadSection}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept=".mp3,.wav"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
          }}
          className={styles.input}
        />

        <p>Or drag and drop your .mp3 or .wav file here</p>

        {audioUrl && (
          <audio controls src={audioUrl} className={styles.audioPlayer} />
        )}

        <button
          onClick={handleProcess}
          className={styles.button}
          disabled={loading || !file}
        >
          {loading ? 'Processing...' : 'Analyze Call'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.result}>
          <h2 className={styles.subheading}>Evaluation Results</h2>

          {result.scores && typeof result.scores === 'object' && (
            <div className={styles.scores}>
              {Object.entries(result.scores).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {String(value)}
                </p>
              ))}
            </div>
          )}

          <div className={styles.feedback}>
            <h3>Overall Feedback</h3>
            <p>{result.overallFeedback || 'N/A'}</p>

            <h3>Observation</h3>
            <p>{result.observation || 'N/A'}</p>

            <h3>Transcript</h3>
            <pre className={styles.transcript}>
              {result.transcript || 'N/A'}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}
