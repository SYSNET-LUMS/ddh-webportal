import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClassActivity.css';
import '../styles/AssignmentList.css';
import homeIcon from "../assets/dashboard/home-icon.svg";

function ChevronIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,4 6,8 10,4" />
        </svg>
    );
}

const ASSIGNMENTS = [
    { id: 0, label: "Assignment 0", icon: homeIcon, color: 'gold-assignment' },
    { id: 1, label: "Assignment 1", icon: homeIcon, color: 'gold-assignment' },
    { id: 2, label: "Assignment 2", icon: homeIcon, color: 'gold-assignment' },
];

export default function HomeAssignments() {
    const navigate = useNavigate();

    const handleAssignmentClick = (id) => {
        if (id === 0) {
            navigate('/assignments/0');
        } else if (id === 1) {
            navigate('/assignments/1');
        } else {
            alert("This assignment hasn't been released yet.");
        }
    };

    return (
        <div className="class-activity-container home-assignments-page">
            {/* Header */}
            <div className="ca-header">
                <button
                    className="ca-back-btn"
                    onClick={() => navigate('/dashboard')}
                    id="ca-back-button"
                >
                    ← Back
                </button>
                <h1 className="ca-page-title">Home Assignments</h1>
            </div>

            {/* Body */}
            <div className="ca-body">
                <div className="ca-date-section">
                    <div className="ca-date-toggle" style={{ cursor: 'default' }}>
                        <span className="ca-toggle-icon open">
                            <ChevronIcon />
                        </span>
                        <span className="ca-date-label">Available Assignments</span>
                    </div>

                    <div className="ca-activity-grid">
                        {ASSIGNMENTS.map((act) => (
                            <div
                                key={act.id}
                                className={`ca-card ${act.color} ca-card--clickable`}
                                role="button"
                                tabIndex={0}
                                id={`card-${act.id}`}
                                onClick={() => handleAssignmentClick(act.id)}
                                onKeyDown={e => e.key === 'Enter' && handleAssignmentClick(act.id)}
                            >
                                <img src={act.icon} alt={act.label} className="ca-card-icon" />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="ca-card-label">{act.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
