import React from 'react';
import clsx from 'clsx';

const STATUS_STEPS = [
    { key: 'PENDING', label: 'Queued' },
    { key: 'PROCESSING', label: 'Transcribing' },
    { key: 'SUMMARIZING', label: 'Analyzing' },
    { key: 'COMPLETED', label: 'Ready' }
];

const StatusTimeline = ({ status, error }) => {
    if (status === 'FAILED') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600 font-semibold">Process Failed</p>
                <p className="text-sm text-red-500 mt-1">{error || "An unexpected error occurred."}</p>
            </div>
        );
    }

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === status);
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className="w-full max-w-3xl mx-auto py-8">
            <div className="flex items-center justify-between relative">
                {/* Connector Line */}
                <div className="absolute left-0 top-1/2 -z-10 w-full h-1 bg-gray-200 -translate-y-1/2 rounded" />

                {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={step.key} className="flex flex-col items-center bg-white px-2">
                            <div
                                className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                                    isCompleted ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-300",
                                    isCurrent && "ring-4 ring-blue-100"
                                )}
                            >
                                {isCompleted ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-xs font-bold">{index + 1}</span>
                                )}
                            </div>
                            <span className={clsx(
                                "mt-2 text-sm font-medium",
                                isCompleted ? "text-blue-900" : "text-gray-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusTimeline;
