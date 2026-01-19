import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import clsx from 'clsx';

const API_BASE_URL = 'http://127.0.0.1:8001/api';

const FileUploader = ({ onUploadStart }) => {
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            alert("File size exceeds 50MB");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Notify parent to start loading state
            const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            onUploadStart(response.data.job_id);

        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Check console for details.");
        }
    }, [onUploadStart]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a']
        },
        maxFiles: 1
    });

    return (
        <div
            {...getRootProps()}
            className={clsx(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-white"
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {isDragActive ? (
                    <p className="text-blue-600 font-medium">Drop the audio file here...</p>
                ) : (
                    <div>
                        <p className="text-gray-600 font-medium">Drag & drop meeting audio here</p>
                        <p className="text-sm text-gray-500 mt-1">MP3, WAV, M4A (Max 50MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploader;
