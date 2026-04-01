// src/pages/ClassActivity.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClassActivity.css';

import liveClassIcon   from '../assets/class-activity/live-class-icon.svg';
import discussionIcon  from '../assets/class-activity/discussion-icon.svg';
import interactiveIcon from '../assets/class-activity/interactive-icon.svg';

/* ─── Static data (dateObj drives visibility logic) ───────────── */

const SESSIONS = [
    {
        date: 'April 3',
        dateObj: new Date(2026, 3, 3),   // month is 0-indexed: 3 = April
        activities: [
            { id: 'lc-apr3',  label: 'Live Class',            icon: liveClassIcon,   color: 'teal' },
            { id: 'da1-apr3', label: 'Discussion Activity 1',  icon: discussionIcon,  color: 'gold' },
            { id: 'da2-apr3', label: 'Discussion Activity 2',  icon: discussionIcon,  color: 'gold' },
            { id: 'ia1-apr3', label: 'Interactive Activity 1', icon: interactiveIcon, color: 'gold' },
            { id: 'ia2-apr3', label: 'Interactive Activity 2', icon: interactiveIcon, color: 'gold' },
        ],
    },
    {
        date: 'April 5',
        dateObj: new Date(2026, 3, 5),
        activities: [
            { id: 'lc-apr5',  label: 'Live Class',            icon: liveClassIcon,   color: 'teal' },
            { id: 'da1-apr5', label: 'Discussion Activity 1',  icon: discussionIcon,  color: 'gold' },
            { id: 'ia1-apr5', label: 'Interactive Activity 1', icon: interactiveIcon, color: 'gold' },
        ],
    },
    {
        date: 'April 8',
        dateObj: new Date(2026, 3, 8),
        activities: [
            { id: 'lc-apr8',  label: 'Live Class',            icon: liveClassIcon,   color: 'teal' },
            { id: 'da1-apr8', label: 'Discussion Activity 1',  icon: discussionIcon,  color: 'gold' },
            { id: 'da2-apr8', label: 'Discussion Activity 2',  icon: discussionIcon,  color: 'gold' },
            { id: 'ia1-apr8', label: 'Interactive Activity 1', icon: interactiveIcon, color: 'gold' },
            { id: 'ia2-apr8', label: 'Interactive Activity 2', icon: interactiveIcon, color: 'gold' },
            { id: 'ia3-apr8', label: 'Interactive Activity 3', icon: interactiveIcon, color: 'gold' },
        ],
    },
];

/* ─── Helpers ─────────────────────────────────────────────────── */

/** Strip time from a Date so comparisons are day-accurate */
function toDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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
        // >= today
        if (!nextFound) {
            nextFound = true;
            return { ...s, status: 'next' };
        }
        return { ...s, status: 'future' };
    });
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

function DateSection({ session }) {
    const { date, activities, status } = session;
    const isPast   = status === 'past';
    const isNext   = status === 'next';
    const isFuture = status === 'future';

    // Past: collapsed by default. Next: expanded. Future: never opened (locked).
    const [open, setOpen] = useState(isNext);

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
                    {activities.map(act => (
                        <div
                            key={act.id}
                            className={`ca-card ${act.color} ${isPast ? 'ca-card--past' : ''}`}
                            role="button"
                            tabIndex={0}
                            id={`card-${act.id}`}
                            onKeyDown={e => e.key === 'Enter' && console.log('Selected:', act.label)}
                        >
                            <img src={act.icon} alt={act.label} className="ca-card-icon" />
                            <span className="ca-card-label">{act.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function ClassActivity() {
    const navigate  = useNavigate();
    const sessions  = categorizeSessions(SESSIONS);

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

            {/* Scrollable session list */}
            <div className="ca-body">
                {sessions.map(session => (
                    <DateSection key={session.date} session={session} />
                ))}
            </div>

        </div>
    );
}
