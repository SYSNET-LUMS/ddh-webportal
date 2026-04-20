import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignOutButton } from "@clerk/react";
import assignmentsIcon from "../assets/dashboard/home-icon.svg";
import helpIcon from "../assets/dashboard/help-icon.svg";
import classroomIcon from "../assets/dashboard/classroom-icon.svg";
import '../styles/Sidebar.css';

function SignOutIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
    );
}

function HouseIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    );
}

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Hide sidebar on login page and big-screen page
    if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/big-screen') {
        return null;
    }

    return (
        <>
            <button
                className={`sidebar-toggle-tab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Sidebar"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
                    }}
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>
            <aside className={`app-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
                <div className="sidebar-top">
                    <button className="side-btn back-btn" onClick={() => navigate(-1)} title="Back">
                        <span className="icon">←</span>
                        <span className="label">Back</span>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`side-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard')}
                        title="Dashboard"
                    >
                        <HouseIcon />
                        <span className="label">Home</span>
                    </button>
                    <button
                        className={`side-btn ${location.pathname === '/class-activity' ? 'active' : ''}`}
                        onClick={() => navigate('/class-activity')}
                        title="Class Activities"
                    >
                        <img src={classroomIcon} alt="Class" />
                        <span className="label">Class</span>
                    </button>
                    <button
                        className={`side-btn ${location.pathname === '/home-assignments' ? 'active' : ''}`}
                        onClick={() => navigate('/home-assignments')}
                        title="Home Assignments"
                    >
                        <img src={assignmentsIcon} alt="Assignments" />
                        <span className="label">Home Works</span>
                    </button>
                    <button
                        className={`side-btn ${location.pathname === '/help' ? 'active' : ''}`}
                        onClick={() => navigate('/help')}
                        title="Help"
                    >
                        <img src={helpIcon} alt="Help" />
                        <span className="label">Help</span>
                    </button>

                    <SignOutButton>
                        <button className="side-btn logout-btn" title="Sign Out">
                            <SignOutIcon />
                            <span className="label">Logout</span>
                        </button>
                    </SignOutButton>
                </nav>
            </aside>
        </>
    );
}
