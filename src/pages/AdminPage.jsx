import React, { useState, useEffect } from 'react';

const BACKEND = import.meta.env.VITE_SERVER_HTTP_ADDRESS
    ? `https://${import.meta.env.VITE_SERVER_HTTP_ADDRESS}`
    : '';

export default function AdminPage() {
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchList = async () => {
        try {
            const url = `${BACKEND}/api/minio/file?bucket=class-data&key=class-activities/class-list.json`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch list');
            const data = await res.json();
            setOriginalData(data);
        } catch (err) {
            console.error('Admin fetch error:', err);
            alert('Failed to fetch class list.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    const updateStatus = async (sessionIdx, activityIdx, newStatus) => {
        const newData = JSON.parse(JSON.stringify(originalData));
        newData.sessions[sessionIdx].activities[activityIdx].status = newStatus;

        setUpdating(true);
        try {
            const res = await fetch(`${BACKEND}/api/admin/class-list`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            if (res.ok) {
                setOriginalData(newData);
            } else {
                alert('Failed to update status.');
            }
        } catch (e) {
            alert('Error updating status.');
        } finally {
            setUpdating(false);
        }
    };

    const discardResponses = async (sessionDateLabel, activityId) => {
        if (!window.confirm(`Are you absolutely sure you want to discard ALL responses for Activity: ${activityId}?`)) return;

        setUpdating(true);
        // Ensure same strict date tokenization as frontend / backend
        const dateSlug = sessionDateLabel.toLowerCase().replace(/\s+/g, '-');
        try {
            const res = await fetch(`${BACKEND}/api/admin/responses?activityId=${encodeURIComponent(activityId)}&sessionDate=${encodeURIComponent(dateSlug)}`, {
                method: 'DELETE'
            });
            const text = await res.json();
            if (res.ok) {
                alert(text.message || 'Responses discarded.');
            } else {
                alert('Failed to discard: ' + text.error);
            }
        } catch (e) {
            alert('Error discarding responses.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading Admin Panel...</div>;

    const sessions = originalData?.sessions || [];

    return (
        <div style={{ background: '#121212', minHeight: '100vh', color: '#fff', padding: '4rem', fontFamily: 'system-ui' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Admin Control Panel</h1>

            {updating && <div style={{ background: 'rgba(255,255,0,0.2)', color: 'yellow', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>Syncing changes to server...</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {sessions.map((session, sIdx) => (
                    <div key={sIdx} style={{ background: '#1e1e1e', borderRadius: '16px', padding: '2rem', border: '1px solid #333' }}>
                        <h2 style={{ fontSize: '2rem', borderBottom: '1px solid #444', paddingBottom: '1rem', marginBottom: '1.5rem' }}>{session.date}</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {(session.activities || []).map((act, aIdx) => {
                                const currentStatus = act.status || 'live';

                                return (
                                    <div key={act.id || aIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#252525', padding: '1rem 1.5rem', borderRadius: '8px' }}>
                                        <div>
                                            <strong style={{ fontSize: '1.2rem', display: 'block' }}>{act.name || act.label}</strong>
                                            <span style={{ fontSize: '0.9rem', color: '#888' }}>ID: {act.id} | Type: {act.type} | Group: {act.isGroupActivity ? 'Yes' : 'No'}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', background: '#111', padding: '0.5rem', borderRadius: '8px' }}>
                                                {['locked', 'live', 'completed'].map(statusType => (
                                                    <button
                                                        key={statusType}
                                                        onClick={() => updateStatus(sIdx, aIdx, statusType)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase',
                                                            background: currentStatus === statusType
                                                                ? (statusType === 'live' ? '#ef4444' : statusType === 'completed' ? '#22c55e' : '#555')
                                                                : 'transparent',
                                                            color: currentStatus === statusType ? '#fff' : '#888'
                                                        }}
                                                    >
                                                        {statusType}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => discardResponses(session.date, act.id)}
                                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                Discard Responses
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
