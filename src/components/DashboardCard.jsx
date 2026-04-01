// src/components/DashboardCard.jsx
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function DashboardCard({ title, icon, colorClass, to }) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        // Navigates programmatically to the provided path
        if (to) {
            navigate(to);
        }
    };

    return (
        <div className={`dash-card ${colorClass}`} onClick={handleCardClick} role="button" tabIndex="0">
            <div className="card-top">
                <div className="arrow-circle">
                    <span>→</span>
                </div>
            </div>
            <div className="card-content">
                <img src={icon} alt={title} className="card-icon" />
                <h3>{title}</h3>
            </div>
        </div>
    );
}