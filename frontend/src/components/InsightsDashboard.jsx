import React, { useState } from 'react';
import clsx from 'clsx';

const API_BASE_URL = 'http://127.0.0.1:8001/api';

const TABS = [
    { key: 'summary', label: 'Summary' },
    { key: 'participants', label: 'Participants & Decisions' },
    { key: 'actions', label: 'Action Items' },
    { key: 'transcript', label: 'Transcript' }
];

const InsightsDashboard = ({ jobResponse, onNewMeeting }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const { analysis, transcript, job_id } = jobResponse;

    if (!analysis) return null;

    const downloadReport = () => {
        window.location.href = `${API_BASE_URL}/job/${job_id}/download`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Header / Action Bar */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Meeting Insights</h2>
                    <p className="text-sm text-gray-500">ID: {job_id}</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={onNewMeeting}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        New Meeting
                    </button>
                    <button
                        onClick={downloadReport}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Report
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={clsx(
                            "px-6 py-4 text-sm font-medium border-b-2 transition-colors focus:outline-none",
                            activeTab === tab.key
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="p-8 min-h-[400px]">
                {activeTab === 'summary' && (
                    <div className="prose max-w-none">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Executive Summary</h3>
                        <p className="text-gray-700 leading-relaxed text-lg">{analysis.summary}</p>
                    </div>
                )}

                {activeTab === 'participants' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100">
                            <h3 className="text-md font-semibold text-blue-900 mb-4 uppercase tracking-wider text-xs">Participants</h3>
                            <ul className="space-y-2">
                                {analysis.participants.map((p, i) => (
                                    <li key={i} className="flex items-center text-gray-700">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-emerald-50/50 p-6 rounded-lg border border-emerald-100">
                            <h3 className="text-md font-semibold text-emerald-900 mb-4 uppercase tracking-wider text-xs">Key Decisions</h3>
                            <ul className="space-y-2">
                                {analysis.decisions.map((d, i) => (
                                    <li key={i} className="flex items-start text-gray-700">
                                        <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{d}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analysis.action_items.map((item, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.task}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {item.owner || "Unassigned"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.due_date || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'transcript' && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Raw Transcript</h3>
                        <div className="h-96 overflow-y-auto pr-2 text-gray-700 whitespace-pre-wrap font-mono text-sm">
                            {transcript}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InsightsDashboard;
