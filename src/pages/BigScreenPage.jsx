import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BACKEND = import.meta.env.VITE_SERVER_HTTP_ADDRESS
    ? `http://${import.meta.env.VITE_SERVER_HTTP_ADDRESS}`
    : '';

async function fetchClassList() {
    const url = `${BACKEND}/api/minio/file?bucket=class-data&key=class-activities/class-list.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch class list');
    return res.json();
}

export default function BigScreenPage() {
    const [statusText, setStatusText] = useState('Syncing with class...');
    const [liveActivity, setLiveActivity] = useState(null);
    const [sessionDate, setSessionDate] = useState('');
    
    const [currentPhase, setCurrentPhase] = useState(1);
    const [responses, setResponses] = useState([]);

    // 1. Poll for the currently live activity
    useEffect(() => {
        let isCancelled = false;
        let timeoutId;

        const checkLiveActivity = async () => {
            if (isCancelled) return;
            try {
                const data = await fetchClassList();
                const sessions = data.sessions || [];
                let activeActivity = null;
                let activeSessionDate = '';
                
                for (const session of sessions) {
                    const acts = session.activities || [];
                    const liveAct = acts.find(a => a.status === 'live' || a.activityStatus === 'live');
                    if (liveAct) {
                        activeActivity = liveAct;
                        activeSessionDate = session.date?.toLowerCase().replace(/\s+/g, '-') || 'unknown-date';
                        break;
                    }
                }

                if (activeActivity) {
                    setLiveActivity(activeActivity);
                    setSessionDate(activeSessionDate);
                    setStatusText('');
                } else {
                    setLiveActivity(null);
                    setResponses([]);
                    setStatusText('Waiting for instructor to start an activity...');
                }
            } catch (err) {
                console.error('[BigScreenPage] Error fetching class list:', err);
                setStatusText('Connection error. Retrying...');
            }

            if (!isCancelled) {
                timeoutId = setTimeout(checkLiveActivity, 15000);
            }
        };

        checkLiveActivity();
        return () => { isCancelled = true; clearTimeout(timeoutId); };
    }, []);

    // 2. Poll for responses of the live activity
    useEffect(() => {
        if (!liveActivity) return;

        let isCancelled = false;
        let timeoutId;

        const fetchResponses = async () => {
            if (isCancelled) return;
            try {
                const url = `${BACKEND}/api/activity/responses/all?activityId=${encodeURIComponent(liveActivity.id)}&phase=${currentPhase}&sessionDate=${encodeURIComponent(sessionDate)}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setResponses(data.responses || []);
                }
            } catch (err) {
                console.error('[BigScreenPage] Error fetching responses:', err);
            }

            if (!isCancelled) {
                timeoutId = setTimeout(fetchResponses, 5000); // 5 sec rapid poll for projector
            }
        };

        fetchResponses();
        return () => { isCancelled = true; clearTimeout(timeoutId); };
    }, [liveActivity, currentPhase, sessionDate]);


    if (!liveActivity) {
         return (
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#121212' }}>
                 <h1 style={{ color: '#fff', fontSize: '3rem', fontFamily: 'system-ui' }}>{statusText}</h1>
             </div>
         );
    }

    const totalPhases = liveActivity.totalPhases || liveActivity.contentUrls?.length || 1;

    return (
        <div style={{ minHeight: '100vh', background: '#121212', color: '#fff', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '2rem 4rem', background: '#1a1a1a', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{liveActivity.name || liveActivity.label}</h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#888', fontSize: '1.5rem' }}>Live Submissions</p>
                </div>
                
                {/* Phase navigation for multi-phase activities */}
                {totalPhases > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#222', padding: '1rem 2rem', borderRadius: '12px' }}>
                        <button 
                            onClick={() => setCurrentPhase(p => Math.max(1, p - 1))}
                            disabled={currentPhase === 1}
                            style={{ background: 'transparent', border: 'none', color: currentPhase === 1 ? '#444' : '#fff', fontSize: '2rem', cursor: currentPhase === 1 ? 'default' : 'pointer' }}
                        >
                            ←
                        </button>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Phase {currentPhase} of {totalPhases}</span>
                        <button 
                            onClick={() => setCurrentPhase(p => Math.min(totalPhases, p + 1))}
                            disabled={currentPhase === totalPhases}
                            style={{ background: 'transparent', border: 'none', color: currentPhase === totalPhases ? '#444' : '#fff', fontSize: '2rem', cursor: currentPhase === totalPhases ? 'default' : 'pointer' }}
                        >
                            →
                        </button>
                    </div>
                )}
            </header>

            <main style={{ flex: 1, padding: '4rem', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                    {responses.length === 0 ? (
                        <h2 style={{ color: '#555', gridColumn: '1 / -1', textAlign: 'center', marginTop: '4rem', fontSize: '2rem' }}>
                            Waiting for responses...
                        </h2>
                    ) : (
                        responses.map((resp, idx) => (
                            <div key={idx} style={{ background: '#222', padding: '2rem', borderRadius: '16px', borderLeft: '6px solid #6366f1', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a855f7', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                        {resp.groupNumber && resp.groupNumber !== 'NO-GROUP' ? `Group ${resp.groupNumber}` : `User ${resp.userId?.slice(-4)}`}
                                    </span>
                                </div>
                                <p style={{ fontSize: '1.8rem', lineHeight: '1.5', margin: 0, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                    {resp.response}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
