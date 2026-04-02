// src/components/DashboardCard.jsx
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import '../App.css';

export default function DashboardCard({ title, icon, colorClass, to, onClick }) {
    const navigate = useNavigate();
    const [isExpanding, setIsExpanding] = useState(false);
    const [overlayStyle, setOverlayStyle] = useState({});
    const cardRef = useRef(null);

    const handleCardClick = (e) => {
        if (onClick) {
            onClick(e);
            return;
        }
        if (!to || isExpanding) return;

        const rect = cardRef.current.getBoundingClientRect();
        
        // initial overlay geometry matches the card
        setOverlayStyle({
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            borderRadius: '20px',
            zIndex: 9999, // high z-index to cover page
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        });
        
        setIsExpanding(true);

        // trigger the expansion next frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setOverlayStyle(prev => ({
                    ...prev,
                    top: '0px',
                    left: '0px',
                    width: '100vw',
                    height: '100vh',
                    borderRadius: '0px',
                }));
            });
        });

        // let the animation play out before navigating
        setTimeout(() => {
            navigate(to);
        }, 500);
    };

    return (
        <>
            <div 
                className={`dash-card ${colorClass}`} 
                onClick={handleCardClick} 
                role="button" 
                tabIndex="0"
                ref={cardRef}
            >
                <div className="card-top">
                    <div className="arrow-circle">
                        <span>→</span>
                    </div>
                </div>
                <div className="card-content" style={{ opacity: isExpanding ? 0 : 1, transition: 'opacity 0.2s' }}>
                    <img src={icon} alt={title} className="card-icon" />
                    <h3>{title}</h3>
                </div>
            </div>
            
            {/* The colored background expansion overlay */}
            {isExpanding && (
                <div 
                    className={colorClass} 
                    style={overlayStyle}
                />
            )}
        </>
    );
}