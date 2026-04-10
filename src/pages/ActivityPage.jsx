// src/pages/ActivityPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/react';
import '../styles/ActivityPage.css';

const BACKEND = import.meta.env.VITE_SERVER_HTTP_ADDRESS
    ? `https://${import.meta.env.VITE_SERVER_HTTP_ADDRESS}`
    : '';

const MAX_CHARS = 1000;

async function submitPhaseResponse({ activityId, activityLabel, phase, totalPhases, response, groupNumber, userId, sessionDate }) {
    const res = await fetch(`${BACKEND}/api/activity/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, activityLabel, phase, totalPhases, response, groupNumber, userId, sessionDate }),
    });
    if (!res.ok) {
        if (res.status === 409) {
            const err = new Error("Response already submitted for this phase.");
            err.status = 409;
            throw err;
        }
        const text = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json().catch(() => ({}));
}

async function checkPhaseStatus(activityId, phase, userId, groupNumber, isGroupActivity, sessionDate) {
    if (!userId) return false;
    const url = `${BACKEND}/api/activity/status?activityId=${encodeURIComponent(activityId)}&phase=${phase}&userId=${encodeURIComponent(userId)}&groupNumber=${encodeURIComponent(groupNumber || 'NO-GROUP')}&isGroupActivity=${isGroupActivity}&sessionDate=${encodeURIComponent(sessionDate || 'unknown-date')}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return false;
        const data = await res.json();
        return !!data.submitted;
    } catch {
        return false;
    }
}

/* ─── Icons ───────────────────────────────────────────────────── */

function SendIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

/* ─── Phase Progress Stepper ──────────────────────────────────── */

function PhaseStepper({ current, total, completedPhases, phaseName, phaseNames }) {
    return (
        <div className="ap-stepper" aria-label="Activity progress">
            {Array.from({ length: total }, (_, i) => {
                const phase = i + 1;
                const isDone = completedPhases.has(phase);
                const isCurrent = phase === current;
                return (
                    <div key={phase} className="ap-stepper-item">
                        <div
                            className={[
                                'ap-step-dot',
                                isDone ? 'ap-step-dot--done' : '',
                                isCurrent ? 'ap-step-dot--current' : '',
                            ].join(' ')}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            {isDone ? <CheckIcon /> : phase}
                        </div>
                        <span className="ap-step-label">{phaseNames[i] || `${phaseName} ${phase}`}</span>
                        {phase < total && <div className={`ap-step-line ${isDone ? 'ap-step-line--done' : ''}`} />}
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Completion Screen ───────────────────────────────────────── */

function CompletionScreen({ activityLabel, navigate }) {
    return (
        <div className="ap-completion">
            <div className="ap-completion-icon">🎉</div>
            <h2 className="ap-completion-title">Activity Complete!</h2>
            <p className="ap-completion-sub">
                You've completed all phases for <strong>{activityLabel}</strong>.
            </p>
            <button
                className="ap-back-to-class-btn"
                id="ap-back-to-class-button"
                onClick={() => navigate(-1)}
            >
                ← Back to Class Activities
            </button>
        </div>
    );
}

/* ─── Group Entry Modal ───────────────────────────────────────── */

function GroupModal({ isOpen, onSubmit }) {
    const [val, setVal] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSub = async (e) => {
        e.preventDefault();
        const trimmed = val.trim();
        if (!trimmed) return;
        setLoading(true);
        try {
            await onSubmit(trimmed);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="ap-modal-overlay">
            <div className="ap-modal-content">
                <h2 className="ap-modal-title">Enter Group Number</h2>
                <p className="ap-modal-text">
                    This is a group activity. Please enter your group number to continue. If you dont know what your group number is, please call on teaching staff.
                </p>
                <form onSubmit={handleSub}>
                    <input
                        type="number"
                        className="ap-modal-input"
                        placeholder="e.g. 5"
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        autoFocus
                        required
                        min="1"
                    />
                    <button type="submit" className="ap-modal-btn" disabled={loading || !val.trim()}>
                        {loading ? <span className="ap-spinner" /> : 'Join Group'}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function ActivityPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoaded } = useUser();
    const userId = user?.username;
    const groupNumber = user?.publicMetadata?.groupNumber || 'NO-GROUP';

    const {
        activityId = 'unknown',
        activityLabel = 'Activity',
        contentUrls = [],       // array of URLs, one per phase
        totalPhases = contentUrls.length || 1,
        isGroupActivity = false,
        sessionDate = 'unknown-date',
        activityStatus = 'live',
        isLiveMode = false,
        phaseName = 'Phase',     // Custom prefix (e.g., "Question", "Step")
        phaseNames = [],         // Custom labels for each phase (e.g., ["Intro", "Core", "Conclusion"])
        StartingText = '',       // Initial text for the response box
    } = location.state ?? {};

    const [showGroupModal, setShowGroupModal] = useState(false);

    useEffect(() => {
        if (isLoaded && isGroupActivity && (!user?.publicMetadata?.groupNumber)) {
            setShowGroupModal(true);
        }
    }, [isLoaded, isGroupActivity, user]);

    const handleGroupSubmit = async (num) => {
        const numericGroup = parseInt(num, 10);
        if (isNaN(numericGroup)) {
            alert("Please enter a valid number");
            throw new Error("Invalid number");
        }
        try {
            const res = await fetch(`${BACKEND}/api/user/group`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, groupNumber: numericGroup }),
            });
            if (!res.ok) throw new Error("Failed to update group");
            window.location.reload();
        } catch (err) {
            alert("Error: " + err.message);
            throw err;
        }
    };

    // Normalise: ensure contentUrls has exactly totalPhases entries (pad with null if needed)
    const urls = Array.from({ length: totalPhases }, (_, i) => contentUrls[i] ?? null);

    const [currentPhase, setCurrentPhase] = useState(1);
    const [completedPhases, setCompletedPhases] = useState(new Set());
    const [finished, setFinished] = useState(false);

    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('idle'); // idle | sending | success | error
    const [statusMsg, setStatusMsg] = useState('');

    const phaseIndex = currentPhase - 1;
    const currentUrl = urls[phaseIndex];
    const isLastPhase = currentPhase === totalPhases;

    // Fetch past submission if activity is completed
    useEffect(() => {
        if (activityStatus !== 'completed' || !userId) return;

        const fetchResponse = async () => {
            try {
                const url = `${BACKEND}/api/activity/submission?activityId=${encodeURIComponent(activityId)}&phase=${currentPhase}&userId=${encodeURIComponent(userId)}&groupNumber=${encodeURIComponent(groupNumber)}&isGroupActivity=${isGroupActivity}&sessionDate=${encodeURIComponent(sessionDate)}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.response) setResponse(data.response);
                    else setResponse('');
                } else {
                    setResponse('');
                }
            } catch {
                setResponse('');
            }
        };

        fetchResponse();
    }, [activityStatus, currentPhase, activityId, userId, groupNumber, isGroupActivity, sessionDate]);
    
    // Response Persistence & StartingText Loading
    useEffect(() => {
        if (activityStatus === 'completed') return;

        const storageKey = `response-${activityId}-${currentPhase}-${userId || 'anon'}`;
        const saved = sessionStorage.getItem(storageKey);
        
        if (saved) {
            setResponse(saved);
        } else if (StartingText) {
            const textToSet = Array.isArray(StartingText)
                ? (StartingText[currentPhase - 1] || '')
                : StartingText;
            setResponse(textToSet || '');
        } else {
            setResponse('');
        }
    }, [currentPhase, StartingText, activityStatus, activityId, userId]);

    // Save response to sessionStorage whenever it changes
    useEffect(() => {
        if (activityStatus === 'completed' || !activityId) return;
        const storageKey = `response-${activityId}-${currentPhase}-${userId || 'anon'}`;
        
        if (response) {
            sessionStorage.setItem(storageKey, response);
        } else {
            sessionStorage.removeItem(storageKey);
        }
    }, [response, currentPhase, activityId, userId, activityStatus]);

    // Polling effect for Group and Individual Activities
    useEffect(() => {
        if (!userId || finished || activityStatus === 'completed') return;

        let timeoutId;
        let isCancelled = false;

        const loopCheck = async () => {
            if (isCancelled) return;

            // Prevent auto-forwarding if currently sending or already succeeded this phase
            if (status !== 'sending' && status !== 'success') {
                const isSubmitted = await checkPhaseStatus(activityId, currentPhase, userId, groupNumber, isGroupActivity, sessionDate);
                if (isSubmitted && !isCancelled) {
                    // Submitted by user (or group member)! Move forward automatically.
                    setCompletedPhases(prev => new Set(prev).add(currentPhase));
                    setStatus('idle');
                    setStatusMsg('');
                    setResponse('');

                    if (isLastPhase) {
                        if (isLiveMode) {
                            const completedLive = JSON.parse(sessionStorage.getItem('liveActivitiesCompleted') || '[]');
                            if (!completedLive.includes(activityId)) {
                                completedLive.push(activityId);
                                sessionStorage.setItem('liveActivitiesCompleted', JSON.stringify(completedLive));
                            }
                            navigate('/live-activity');
                        } else {
                            setFinished(true);
                        }
                    } else {
                        setCurrentPhase(p => p + 1);
                    }
                    return; // Stop polling; currentPhase change will re-trigger the effect
                }
            }

            if (!isCancelled) {
                // Poll every 15 seconds with a random offset between 0 and 3 seconds
                const waitTime = 15000 + Math.floor(Math.random() * 3000);
                timeoutId = setTimeout(loopCheck, waitTime);
            }
        };

        loopCheck(); // Initial fetch on mount or deps change
        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, [isGroupActivity, groupNumber, activityId, currentPhase, totalPhases, finished, status, isLastPhase, userId, sessionDate]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        // If viewing a completed activity, simply proceed to next phase.
        if (activityStatus === 'completed') {
            const newCompleted = new Set(completedPhases).add(currentPhase);
            setCompletedPhases(newCompleted);

            if (isLastPhase) {
                if (isLiveMode) {
                    navigate('/live-activity');
                } else {
                    setFinished(true);
                }
            } else {
                setCurrentPhase(p => p + 1);
                setStatus('idle');
                setStatusMsg('');
                setResponse('');
            }
            return;
        }

        if (!response.trim()) return;

        setStatus('sending');
        setStatusMsg('');

        try {
            await submitPhaseResponse({
                activityId,
                activityLabel,
                phase: currentPhase,
                totalPhases,
                response: response.trim(),
                groupNumber: isGroupActivity ? groupNumber : undefined,
                userId,
                sessionDate,
            });

            const newCompleted = new Set(completedPhases).add(currentPhase);
            setCompletedPhases(newCompleted);
            setStatus('success');
            setStatusMsg(isLastPhase ? 'All done!' : 'Response saved! Moving to next phase…');
            
            // Clear persisted response on success
            setResponse('');
            sessionStorage.removeItem(`response-${activityId}-${currentPhase}-${userId || 'anon'}`);

            if (isLastPhase) {
                // Short delay so user sees the success flash before completion screen
                setTimeout(() => {
                    if (isLiveMode) {
                        const completedLive = JSON.parse(sessionStorage.getItem('liveActivitiesCompleted') || '[]');
                        if (!completedLive.includes(activityId)) {
                            completedLive.push(activityId);
                            sessionStorage.setItem('liveActivitiesCompleted', JSON.stringify(completedLive));
                        }
                        navigate('/live-activity');
                    } else {
                        setFinished(true);
                    }
                }, 900);
            } else {
                setTimeout(() => {
                    setCurrentPhase(p => p + 1);
                    setStatus('idle');
                    setStatusMsg('');
                }, 700);
            }
        } catch (err) {
            console.error('[ActivityPage] submit failed:', err);

            if (err.status === 409) {
                window.alert("A response was already submitted for this phase. Moving you to the next phase!");

                setCompletedPhases(prev => new Set(prev).add(currentPhase));
                setStatus('idle');
                setStatusMsg('');
                setResponse('');

                if (isLastPhase) {
                    if (isLiveMode) {
                        const completedLive = JSON.parse(sessionStorage.getItem('liveActivitiesCompleted') || '[]');
                        if (!completedLive.includes(activityId)) {
                            completedLive.push(activityId);
                            sessionStorage.setItem('liveActivitiesCompleted', JSON.stringify(completedLive));
                        }
                        navigate('/live-activity');
                    } else {
                        setFinished(true);
                    }
                } else {
                    setCurrentPhase(p => p + 1);
                }
                return;
            }

            setStatus('error');
            setStatusMsg(err.message ?? 'Failed to submit response. Please try again.');
        }
    };

    /* ── Completion screen ── */
    if (finished) {
        return (
            <div className="ap-container">
                <div className="ap-header">
                    <button className="ap-back-btn" onClick={() => navigate(-1)} id="ap-back-button">
                        ← Back
                    </button>
                    <h1 className="ap-title">{activityLabel}</h1>
                </div>
                <CompletionScreen activityLabel={activityLabel} navigate={navigate} />
            </div>
        );
    }

    return (
        <div className="ap-container">

            {/* ── Header ── */}
            <div className="ap-header">
                <button
                    className="ap-back-btn"
                    onClick={() => navigate(-1)}
                    id="ap-back-button"
                >
                    ← Back
                </button>
                <h1 className="ap-title">{activityLabel}</h1>

                {isGroupActivity && groupNumber && (
                    <div className="ap-phase-badge" style={{ marginRight: '0.8rem', background: 'rgba(236, 175, 59, 0.15)', borderColor: 'rgba(236, 175, 59, 0.4)', color: '#eccb58' }}>
                        Group {groupNumber}
                    </div>
                )}

                <div className="ap-phase-badge">
                    {phaseNames[currentPhase - 1] || `${phaseName} ${currentPhase}`} <span className="ap-phase-of">of {totalPhases}</span>
                </div>
            </div>

            {/* ── Progress stepper ── */}
            {totalPhases > 1 && (
                <PhaseStepper
                    current={currentPhase}
                    total={totalPhases}
                    completedPhases={completedPhases}
                    phaseName={phaseName}
                    phaseNames={phaseNames}
                />
            )}

            {/* ── Main layout ── */}
            <div className="ap-body">

                {/* Content iframe */}
                <div className="ap-iframe-wrapper">
                    {currentUrl ? (
                        <iframe
                            key={currentPhase}           /* remount on phase change */
                            id={`ap-content-iframe-phase-${currentPhase}`}
                            src={currentUrl}
                            title={`${activityLabel} – ${phaseNames[currentPhase - 1] || `${phaseName} ${currentPhase}`}`}
                            className="ap-iframe"
                            allowFullScreen
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        />
                    ) : (
                        <div className="ap-no-content">
                            <span>No content provided for {phaseNames[currentPhase - 1] || `${phaseName} ${currentPhase}`}.</span>
                        </div>
                    )}
                </div>

                {/* Response panel */}
                <div className="ap-response-panel">
                    <div className="ap-response-header">
                        <span className="ap-response-icon">✏️</span>
                        <div>
                            <h2 className="ap-response-title">
                                {isGroupActivity ? 'Group Response' : 'Your Response'}
                            </h2>
                            <p className="ap-response-subtitle">
                                {phaseNames[currentPhase - 1] || `${phaseName} ${currentPhase} of ${totalPhases}`}
                            </p>
                        </div>
                    </div>

                    <form
                        className="ap-response-form"
                        onSubmit={handleSubmit}
                        id={`ap-response-form-phase-${currentPhase}`}
                    >
                        <textarea
                            key={currentPhase}           /* fresh textarea per phase */
                            id={`ap-response-textarea-phase-${currentPhase}`}
                            className="ap-textarea"
                            placeholder={isGroupActivity
                                ? `Write your group's response for ${phaseNames[currentPhase - 1] || `${phaseName} ${currentPhase}`}…`
                                : `Write your response for ${phaseNames[currentPhase - 1] || `${phaseName} ${currentPhase}`}…`}
                            value={response}
                            onChange={e => {
                                setResponse(e.target.value);
                                if (status === 'error') setStatus('idle');
                            }}
                            rows={6}
                            disabled={status === 'sending' || activityStatus === 'completed'}
                            maxLength={MAX_CHARS}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.4rem', marginBottom: '0.6rem' }}>
                            <span>
                                {response.length >= MAX_CHARS && (
                                    <span style={{ color: '#ff6b6b' }}>Maximum character limit reached.</span>
                                )}
                            </span>
                            <span style={{ color: response.length >= MAX_CHARS ? '#ff6b6b' : 'rgba(255, 255, 255, 0.5)' }}>
                                {response.length} / {MAX_CHARS}
                            </span>
                        </div>

                        {status === 'success' && (
                            <p className="ap-feedback ap-feedback--success">✓ {statusMsg}</p>
                        )}
                        {status === 'error' && (
                            <p className="ap-feedback ap-feedback--error">⚠ {statusMsg}</p>
                        )}

                        {isGroupActivity && activityStatus !== 'completed' && (
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <p style={{ margin: 0, color: '#eccb58', fontWeight: '600' }}>
                                    ⚠️ Only one person should submit the response for the group.
                                </p>
                                <p style={{ margin: 0 }}>
                                    If another group member submits, you will automatically skip to the next phase.
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="ap-submit-btn"
                            id={`ap-submit-button-phase-${currentPhase}`}
                            disabled={status === 'sending' || (!response.trim() && activityStatus !== 'completed') || (isGroupActivity && !groupNumber)}
                        >
                            {status === 'sending' ? (
                                <span className="ap-spinner" />
                            ) : isLastPhase ? (
                                <CheckIcon />
                            ) : (
                                <SendIcon />
                            )}
                            {activityStatus === 'completed'
                                ? (isLastPhase ? 'Finish Viewing' : 'Next Phase →')
                                : status === 'sending'
                                    ? 'Submitting…'
                                    : isLastPhase
                                        ? 'Submit & Finish'
                                        : 'Submit & Next Phase →'}
                        </button>
                    </form>
                </div>
            </div>

            <GroupModal isOpen={showGroupModal} onSubmit={handleGroupSubmit} />
        </div>
    );
}
