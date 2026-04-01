import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ActivityPage.css'; // Reuse basic styling

const BACKEND = import.meta.env.VITE_SERVER_HTTP_ADDRESS
    ? `http://${import.meta.env.VITE_SERVER_HTTP_ADDRESS}`
    : '';

// Uses the same fetching logic as ClassActivity
async function fetchClassList() {
    const url = `${BACKEND}/api/minio/file?bucket=class-data&key=class-activities/class-list.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch class list');
    return res.json();
}

export default function LiveActivityPage() {
    const navigate = useNavigate();
    const [statusText, setStatusText] = useState('Syncing with class...');

    useEffect(() => {
        let isCancelled = false;
        let timeoutId;

        const checkLiveActivity = async () => {
            if (isCancelled) return;
            try {
                const data = await fetchClassList();
                
                // Find the currently active/live session (the one tagged "next" or closest)
                // Assuming data.sessions is an array of sessions
                const sessions = data.sessions || [];
                let activeActivity = null;
                let activeSessionDate = '';
                
                for (const session of sessions) {
                    const acts = session.activities || [];
                    // Look for the first activity explicitly marked "live"
                    const liveAct = acts.find(a => a.status === 'live' || a.activityStatus === 'live');
                    if (liveAct) {
                        activeActivity = liveAct;
                        activeSessionDate = session.date?.toLowerCase().replace(/\s+/g, '-') || 'unknown-date';
                        break;
                    }
                }

                if (activeActivity) {
                    // Check if we already completed this live activity
                    const completedLive = JSON.parse(sessionStorage.getItem('liveActivitiesCompleted') || '[]');
                    
                    if (completedLive.includes(activeActivity.id)) {
                        setStatusText('Waiting for instructor to open the next activity...');
                    } else {
                        // Enter the activity
                        navigate('/activity', {
                            state: {
                                activityId:      activeActivity.id,
                                activityLabel:   activeActivity.name || activeActivity.label,
                                contentUrls:     activeActivity.contentUrls || (activeActivity.contentUrl ? [activeActivity.contentUrl] : []),
                                totalPhases:     activeActivity.totalPhases || activeActivity.contentUrls?.length || 1,
                                isGroupActivity: activeActivity.isGroupActivity || activeActivity.isGroup || false,
                                sessionDate:     activeSessionDate,
                                activityStatus:  'live',
                                isLiveMode:      true,
                            },
                        });
                        return; // Stop polling
                    }
                } else {
                    setStatusText('Waiting for instructor to open a live activity...');
                }

            } catch (err) {
                console.error('[LiveActivityPage] Error fetching class list:', err);
                setStatusText('Connection error. Retrying...');
            }

            if (!isCancelled) {
                timeoutId = setTimeout(checkLiveActivity, 15000);
            }
        };

        checkLiveActivity();

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, [navigate]);

    return (
        <div className="ap-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column' }}>
            <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Live Class Sync</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="ap-spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>{statusText}</span>
            </div>
            
            <button 
                onClick={() => navigate('/class-activity')}
                style={{ marginTop: '2rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}
            >
                ← Exit Live Mode
            </button>
        </div>
    );
}
