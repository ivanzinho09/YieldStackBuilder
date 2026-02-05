/**
 * APY Data Provider Component
 *
 * Initializes APY data fetching on app load and refreshes periodically.
 */

import { useEffect, useState } from 'react';
import { useApyStore } from '../../stores/apyStore';

interface ApyDataProviderProps {
    children: React.ReactNode;
}

const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour

export function ApyDataProvider({ children }: ApyDataProviderProps) {
    const { fetchApyData, isLoading } = useApyStore();
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    useEffect(() => {
        // Initial fetch
        fetchApyData().then(() => {
            setInitialFetchDone(true);
        });

        // Set up periodic refresh
        const intervalId = setInterval(() => {
            fetchApyData();
        }, REFRESH_INTERVAL);

        return () => clearInterval(intervalId);
    }, [fetchApyData]);

    // Show loading indicator on initial load (optional - can be removed for silent loading)
    if (!initialFetchDone && isLoading) {
        return (
            <div className="apy-loading-overlay">
                <div className="apy-loading-content">
                    <div className="apy-loading-spinner"></div>
                    <span>Loading live APY data...</span>
                </div>
                <style>{`
                    .apy-loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: var(--paper, #f4f4f0);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                    }
                    .apy-loading-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 16px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 12px;
                        color: var(--ink-light, #555);
                    }
                    .apy-loading-spinner {
                        width: 24px;
                        height: 24px;
                        border: 2px solid var(--guide, #ccc);
                        border-top-color: var(--ink, #1a1a1a);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return <>{children}</>;
}

/**
 * APY Status Indicator Component
 *
 * Shows the current status of APY data (loading, error, last updated).
 */
export function ApyStatusIndicator() {
    const { isLoading, error, lastUpdated } = useApyStore();

    if (isLoading) {
        return (
            <div className="apy-status loading">
                <div className="status-dot loading"></div>
                <span>Updating APY data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="apy-status error">
                <div className="status-dot error"></div>
                <span>Using cached APY data</span>
            </div>
        );
    }

    if (lastUpdated) {
        return (
            <div className="apy-status success">
                <div className="status-dot success"></div>
                <span>Live data • Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
        );
    }

    return null;
}
