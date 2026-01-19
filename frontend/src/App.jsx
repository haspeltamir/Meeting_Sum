import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUploader from './components/FileUploader';
import StatusTimeline from './components/StatusTimeline';
import InsightsDashboard from './components/InsightsDashboard';

const API_BASE_URL = 'http://127.0.0.1:8001/api';

function App() {
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null); // 'PENDING', 'PROCESSING', 'SUMMARIZING', 'COMPLETED', 'FAILED'
  const [jobData, setJobData] = useState(null);
  const [error, setError] = useState(null);

  // Polling Logic
  useEffect(() => {
    let intervalId;

    if (jobId && jobStatus !== 'COMPLETED' && jobStatus !== 'FAILED') {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/job/${jobId}`);
          const { status, error_details } = response.data;

          setJobStatus(status);
          setJobData(response.data);

          if (status === 'FAILED') {
            setError(error_details || "Unknown error occurred");
            clearInterval(intervalId);
          }

          if (status === 'COMPLETED') {
            clearInterval(intervalId);
          }

        } catch (err) {
          console.error("Polling error", err);
          setError("Failed to fetch job status");
          clearInterval(intervalId);
        }
      }, 2500); // Poll every 2.5s
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, jobStatus]);

  const handleUploadStart = (id) => {
    setJobId(id);
    setJobStatus('PENDING');
    setError(null);
  };

  const handleNewMeeting = () => {
    setJobId(null);
    setJobStatus(null);
    setJobData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight sm:text-5xl">
            AI Meeting Analyst
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Upload your meeting recording and get an executive summary in seconds.
          </p>
        </div>

        {/* Main Content */}
        {!jobId ? (
          <div className="max-w-xl mx-auto">
            <FileUploader onUploadStart={handleUploadStart} />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <StatusTimeline status={jobStatus} error={error} />

            {jobStatus === 'COMPLETED' && jobData && (
              <InsightsDashboard
                jobResponse={jobData}
                onNewMeeting={handleNewMeeting}
              />
            )}

            {/* Loading State Placeholder */}
            {jobStatus !== 'COMPLETED' && jobStatus !== 'FAILED' && (
              <div className="text-center text-gray-500 py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p>AI is working on your file...</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
