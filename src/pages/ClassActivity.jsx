// src/pages/ClassActivity.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClassActivity.css';

import liveClassIcon from '../assets/class-activity/live-class-icon.svg';
import discussionIcon from '../assets/class-activity/discussion-icon.svg';
import interactiveIcon from '../assets/class-activity/interactive-icon.svg';

/* ─── Activity type → icon & color ────────────────────────────── */

const TYPE_MAP = {
    'discussion': { icon: discussionIcon, color: 'gold' },
    'interactive': { icon: interactiveIcon, color: 'gold' },
};

/** Fallback for unknown types */
function resolveType(type = '') {
    return TYPE_MAP[type.toLowerCase()] ?? { icon: interactiveIcon, color: 'gold' };
}

/* ─── API ──────────────────────────────────────────────────────── */

const BACKEND = import.meta.env.VITE_SERVER_HTTP_ADDRESS
    ? `https://${import.meta.env.VITE_SERVER_HTTP_ADDRESS}`
    : '';

async function fetchClassList() {
    const url = `${BACKEND}/api/minio/file?bucket=class-data&key=class-activities/class-list.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return res.json(); // expected shape: { sessions: [ { date, activities: [...] } ] }
}

/* ─── Helpers ─────────────────────────────────────────────────── */

/** Strip time from a Date so comparisons are day-accurate */
function toDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Parse a human-readable date string like "April 5" into a Date object.
 * Assumes current year if the result makes sense; adjusts to next year if already past by > 180 days.
 */
function parseDateLabel(label) {
    const d = new Date(`${label} ${new Date().getFullYear()}`);
    if (isNaN(d)) return new Date(0); // fallback for unparseable dates
    return d;
}

/**
 * Categorise every session relative to today:
 *   'past'   – session date is before today
 *   'next'   – the earliest upcoming session (first one >= today)
 *   'future' – any upcoming session beyond the 'next' one
 */
function categorizeSessions(sessions) {
    const today = toDay(new Date());
    let nextFound = false;

    return sessions.map(s => {
        const sessionDay = toDay(s.dateObj);
        if (sessionDay < today) {
            return { ...s, status: 'past' };
        }
        if (!nextFound) {
            nextFound = true;
            return { ...s, status: 'next' };
        }
        return { ...s, status: 'future' };
    });
}

/**
 * Transform the raw API response into the shape the component expects.
 * Adds a unique id, resolved icon/color, and a dateObj to each item.
 */
function transformApiData(data) {
    const rawSessions = Array.isArray(data) ? data : data?.sessions ?? [];

    return rawSessions.map(session => ({
        date: session.date,
        dateObj: parseDateLabel(session.date),
        activities: (session.activities ?? []).map((act, idx) => {
            const { icon, color } = resolveType(act.type);
            return {
                id: act.id ?? `${session.date}-${idx}`,
                label: act.name,
                icon,
                color,
                // contentUrls is an ordered array of URLs, one per phase
                contentUrls: Array.isArray(act.contentUrls)
                    ? act.contentUrls
                    : (act.contentUrl ?? act.redirectUrl)
                        ? [act.contentUrl ?? act.redirectUrl]
                        : [],
                totalPhases: act.totalPhases ?? act.contentUrls?.length ?? 1,
                isGroupActivity: act.isGroupActivity ?? act.isGroup ?? false,
                sessionDate: session.date.toLowerCase().replace(/\s+/g, '-'),
                activityStatus: act.status ?? 'live',
                phaseName: act.phaseName,
                phaseNames: act.phaseNames,
                StartingText: act.StartingText || act.startingText,
            };
        }),
    }));
}

/* ─── Icons ───────────────────────────────────────────────────── */

function ChevronIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,4 6,8 10,4" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.55)" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

/* ─── DateSection ─────────────────────────────────────────────── */

function DateSection({ session, navigate }) {
    const { date, activities, status } = session;
    const isPast = status === 'past';
    const isNext = status === 'next';
    const isFuture = status === 'future';

    const [open, setOpen] = useState(isNext);

    const handleActivityClick = (act) => {
        if (act.activityStatus === 'locked') {
            alert('This activity is not open yet.');
            return;
        }

        if (act.contentUrls?.length) {
            navigate('/activity', {
                state: {
                    activityId: act.id,
                    activityLabel: act.label,
                    contentUrls: act.contentUrls,
                    totalPhases: act.totalPhases,
                    isGroupActivity: act.isGroupActivity,
                    sessionDate: act.sessionDate,
                    activityStatus: act.activityStatus,
                    phaseName: act.phaseName,
                    phaseNames: act.phaseNames,
                    StartingText: act.StartingText,
                },
            });
        }
    };

    if (isFuture) {
        return (
            <div className="ca-date-section ca-date-section--locked">
                <div className="ca-date-toggle ca-date-toggle--locked" aria-label={`${date} – not yet available`}>
                    <span className="ca-toggle-icon ca-toggle-icon--locked">
                        <LockIcon />
                    </span>
                    <span className="ca-date-label ca-date-label--locked">{date}</span>
                    <span className="ca-locked-badge">Available soon</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`ca-date-section ${isPast ? 'ca-date-section--past' : ''}`}>
            <button
                className="ca-date-toggle"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                id={`toggle-${date.replace(/\s/g, '-')}`}
            >
                <span className={`ca-toggle-icon ${open ? 'open' : 'closed'}`}>
                    <ChevronIcon />
                </span>
                <span className="ca-date-label">
                    {date}
                    {isPast && <span className="ca-past-badge">Completed</span>}
                    {isNext && <span className="ca-next-badge">Up Next</span>}
                </span>
            </button>

            {open && (
                <div className={`ca-activity-grid ${isPast ? 'ca-activity-grid--past' : ''}`}>
                    {isNext && (
                        <div
                            className="ca-card teal ca-card--clickable"
                            style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={() => navigate('/live-activity')}
                        >
                            <img src={liveClassIcon} alt="Live Route" className="ca-card-icon" style={{ margin: 0 }} />
                            <span className="ca-card-label" style={{ fontWeight: 'bold' }}>Join Live Route Automatically</span>
                        </div>
                    )}
                    {activities.map(act => (
                        <div
                            key={act.id}
                            className={`ca-card ${act.color} ${isPast ? 'ca-card--past' : ''} ${act.contentUrls?.length ? 'ca-card--clickable' : ''}`}
                            role={act.contentUrls?.length ? 'button' : undefined}
                            tabIndex={act.contentUrls?.length ? 0 : undefined}
                            id={`card-${act.id}`}
                            onClick={() => handleActivityClick(act)}
                            onKeyDown={e => e.key === 'Enter' && handleActivityClick(act)}
                        >
                            <img src={act.icon} alt={act.label} className="ca-card-icon" />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="ca-card-label">{act.label}</span>
                                {act.activityStatus === 'completed' && <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>✓ Completed</span>}
                                {act.activityStatus === 'locked' && <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255, 255, 255, 0.15)', color: '#bbb', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>🔒 Locked</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function ClassActivity() {
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchClassList()
            .then(data => {
                if (cancelled) return;
                const transformed = transformApiData(data);
                setSessions(categorizeSessions(transformed));
            })
            .catch(err => {
                if (cancelled) return;
                console.error('[ClassActivity] Failed to load class list:', err);
                setError(err.message ?? 'Failed to load activities');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    return (
        <div className="class-activity-container">

            {/* Header */}
            <div className="ca-header">
                <button
                    className="ca-back-btn"
                    onClick={() => navigate(-1)}
                    id="ca-back-button"
                >
                    ← Back
                </button>
                <h1 className="ca-page-title">Class Activities</h1>
            </div>

            {/* Body */}
            <div className="ca-body">
                {loading && (
                    <p className="ca-status-msg">Loading activities…</p>
                )}

                {!loading && error && (
                    <p className="ca-status-msg ca-status-msg--error">
                        ⚠ {error}
                    </p>
                )}

                {!loading && !error && sessions.length === 0 && (
                    <p className="ca-status-msg">No activities found.</p>
                )}

                {!loading && !error && sessions.map(session => (
                    <DateSection key={session.date} session={session} navigate={navigate} />
                ))}
            </div>

        </div>
    );
}
