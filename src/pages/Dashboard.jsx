// src/pages/Dashboard.jsx
import { useUser } from "@clerk/react";
import DashboardCard from "../components/DashboardCard";
import CornerDesign from "../components/dashboard/DashboardHeader";
import '../App.css';

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
                    <p><strong>Roll Number:</strong> {user?.id}</p>
                    <p><strong>DeviceID:</strong> {user?.id}</p>
                </div>

                {/* Action Cards */}
                <DashboardCard
                    title="Grade Book"
                    colorClass="navy-card"
                    icon="src/assets/dashboard/grade-icon.svg"
                />
            </div>
            <div className="dashboard-grid-3">
                <DashboardCard
                    title="Class-Room Assignment"
                    colorClass="navy-card"
                    icon="src/assets/dashboard/classroom-icon.svg"
                    to="/class-activity"
                />
                <DashboardCard
                    title="Home Assignments"
                    colorClass="gold-card"
                    icon="src/assets/dashboard/home-icon.svg"
                    to="/home-assignments"
                />
                <DashboardCard
                    title="I Need Help"
                    colorClass="green-card"
                    icon="src/assets/dashboard/help-icon.svg"
                />
            </div>
        </div>
    );
}