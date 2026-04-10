import React, { useState, useEffect } from 'react';

const BACKEND = import.meta.env.VITE_SERVER_HTTP_ADDRESS
    ? `https://${import.meta.env.VITE_SERVER_HTTP_ADDRESS}`
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
    const [userGroups, setUserGroups] = useState({});
    const [responses, setResponses] = useState([]);
    const [pushedBackIds, setPushedBackIds] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await fetch(`${BACKEND}/api/users/groups`);
                if (res.ok) {
                    const data = await res.json();
                    setUserGroups(data.groups || {});
                }
            } catch (e) {
                console.error('[BigScreenPage] Error fetching user groups:', e);
            }
        };

        fetchGroups();
    }, []);

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
                    const liveAct = acts.find(
                        (a) => a.status === 'live' || a.activityStatus === 'live'
                    );

                    if (liveAct) {
                        activeActivity = liveAct;
                        activeSessionDate =
                            session.date?.toLowerCase().replace(/\s+/g, '-') || 'unknown-date';
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

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (!liveActivity) return;

        let isCancelled = false;
        let timeoutId;

        const fetchResponses = async () => {
            if (isCancelled) return;

            try {
                const isGroupActivity =
                    liveActivity.isGroupActivity || liveActivity.isGroup || false;

                const url = `${BACKEND}/api/activity/responses/all?activityId=${encodeURIComponent(
                    liveActivity.id
                )}&sessionDate=${encodeURIComponent(
                    sessionDate
                )}&isGroupActivity=${isGroupActivity}`;

                const res = await fetch(url);

                if (res.ok) {
                    const data = await res.json();
                    setResponses(data.responses || []);
                }
            } catch (err) {
                console.error('[BigScreenPage] Error fetching responses:', err);
            }

            if (!isCancelled) {
                timeoutId = setTimeout(fetchResponses, 5000);
            }
        };

        fetchResponses();

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, [liveActivity, sessionDate]);

    const sortedResponses = React.useMemo(() => {
        if (!liveActivity) return [];
        const isGroup = liveActivity.isGroupActivity || liveActivity.isGroup;

        return [...responses].sort((a, b) => {
            const idA = isGroup ? a.groupNumber : a.userId;
            const idB = isGroup ? b.groupNumber : b.userId;

            const indexA = pushedBackIds.indexOf(idA);
            const indexB = pushedBackIds.indexOf(idB);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return 1;
            if (indexB !== -1) return -1;
            return 0;
        });
    }, [responses, pushedBackIds, liveActivity]);

    if (!liveActivity) {
        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#121212',
                    margin: 0,
                    padding: 0,
                    overflow: 'hidden',
                }}
            >
                <h1
                    style={{
                        color: '#fff',
                        fontSize: '3rem',
                        fontFamily: 'system-ui',
                        margin: 0,
                    }}
                >
                    {statusText}
                </h1>
            </div>
        );
    }

    const totalPhases = liveActivity.totalPhases || liveActivity.contentUrls?.length || 1;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: '#121212',
                color: '#fff',
                fontFamily: 'system-ui',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                margin: 0,
                padding: 0,
                boxSizing: 'border-box',
            }}
        >
            <header
                style={{
                    padding: '2rem 3rem',
                    background: '#1a1a1a',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                        }}
                    >
                        {liveActivity.name || liveActivity.label}
                    </h1>
                    <p
                        style={{
                            margin: '0.5rem 0 0 0',
                            color: '#888',
                            fontSize: '1.5rem',
                        }}
                    >
                        Live Submissions
                    </p>
                </div>

                {pushedBackIds.length > 0 && (
                    <button
                        onClick={() => setPushedBackIds([])}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#aaa',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.target.style.color = '#aaa';
                        }}
                    >
                        Reset Order
                    </button>
                )}
            </header>

            <main
                style={{
                    flex: 1,
                    width: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '2rem',
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: '2rem',
                        width: '100%',
                        boxSizing: 'border-box',
                        alignItems: 'start',
                    }}
                >
                    {sortedResponses.length === 0 ? (
                        <h2
                            style={{
                                color: '#555',
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                marginTop: '4rem',
                                fontSize: '2rem',
                            }}
                        >
                            Waiting for responses...
                        </h2>
                    ) : (
                        sortedResponses.map((resp, idx) => {
                            const isGroup = liveActivity.isGroupActivity || liveActivity.isGroup;
                            const identifier = isGroup ? resp.groupNumber : resp.userId;
                            const label = isGroup
                                ? `Group ${resp.groupNumber !== 'NO-GROUP'
                                    ? resp.groupNumber
                                    : 'Unknown'
                                }`
                                : `User ${resp.userId}`;

                            const members =
                                isGroup &&
                                    resp.groupNumber !== 'NO-GROUP' &&
                                    userGroups[resp.groupNumber]
                                    ? userGroups[resp.groupNumber].join(', ')
                                    : '';

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#222',
                                        padding: '2rem',
                                        borderRadius: '16px',
                                        borderLeft: '6px solid #6366f1',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                        minWidth: 0,
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        position: 'relative',
                                    }}
                                >
                                    <button
                                        onClick={() => {
                                            setPushedBackIds(prev => [...prev.filter(id => id !== identifier), identifier]);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '1.5rem',
                                            right: '1.5rem',
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#666',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.2s ease',
                                            fontWeight: '500',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(255,255,255,0.08)';
                                            e.target.style.color = '#aaa';
                                            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(255,255,255,0.03)';
                                            e.target.style.color = '#666';
                                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                        }}
                                    >
                                        Send to Back
                                    </button>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem',
                                            marginBottom: '1.5rem',
                                        }}
                                    >
                                        <span
                                            style={{
                                                alignSelf: 'flex-start',
                                                background: 'rgba(99, 102, 241, 0.15)',
                                                color: '#a855f7',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem',
                                                maxWidth: '100%',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            {label}
                                        </span>

                                        {members && (
                                            <span
                                                style={{
                                                    color: '#888',
                                                    fontSize: '1rem',
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {members}
                                            </span>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1.5rem',
                                        }}
                                    >
                                        {(resp.phases || []).map((phaseText, pIdx) => {
                                            if (!phaseText) return null;

                                            return (
                                                <div key={pIdx}>
                                                    {totalPhases > 1 && (
                                                        <h4
                                                            style={{
                                                                margin: '0 0 0.5rem 0',
                                                                color: '#555',
                                                                fontSize: '1.1rem',
                                                            }}
                                                        >
                                                            Phase {pIdx + 1}
                                                        </h4>
                                                    )}

                                                    <p
                                                        style={{
                                                            fontSize: '1.2rem',
                                                            lineHeight: '1.5',
                                                            margin: 0,
                                                            wordBreak: 'break-word',
                                                            overflowWrap: 'anywhere',
                                                            whiteSpace: 'pre-wrap',
                                                        }}
                                                    >
                                                        {phaseText}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}