// src/pages/Dashboard.jsx
import { useUser } from "@clerk/react";
import DashboardCard from "../components/DashboardCard";
import CornerDesign from "../components/dashboard/DashboardHeader";
import '../App.css';
import gradeIcon from '../assets/dashboard/grade-icon.svg';
import classroomIcon from '../assets/dashboard/classroom-icon.svg';
import homeIcon from '../assets/dashboard/home-icon.svg';
import helpIcon from '../assets/dashboard/help-icon.svg';

export default function Dashboard() {
    const { user } = useUser();

    return (
        <div className="dashboard-wrapper">
            <CornerDesign />
            <h1 className="welcome-header">Welcome, {user?.firstName || "Student"}</h1>

            <div className="dashboard-grid-2">

                {/* Top Banner with Student Info */}
                <div className="student-banner">
                    <p><strong>Name:</strong> {user?.fullName}</p>
                    <p><strong>Username:</strong> {user?.username}</p>
                    <p><strong>DeviceID:</strong> {user?.id}</p>
                </div>

                {/* Action Cards */}
                <DashboardCard
                    title="Grade Book"
                    colorClass="navy-card"
                    icon={gradeIcon}
                    onClick={() => alert("This will be released to participants soon and you will be notified when it is live")}
                />
            </div>
            <div className="dashboard-grid-3">
                <DashboardCard
                    title="Class-Room Assignment"
                    colorClass="navy-card"
                    icon={classroomIcon}
                    to="/class-activity"
                />
                <DashboardCard
                    title="Home Assignments"
                    colorClass="gold-card"
                    icon={homeIcon}
                    to="/home-assignments"
                    onClick={() => alert("This will be released to participants soon and you will be notified when it is live")}
                />
                <DashboardCard
                    title="I Need Help"
                    colorClass="green-card"
                    icon={helpIcon}
                />
            </div>
        </div>
    );
}