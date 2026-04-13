import React from 'react';
import CornerDesign from "../components/dashboard/DashboardHeader";
import { useWindowSize } from "../utils/useWindowSize";
import "../App.css";

export default function Help() {
    const { width } = useWindowSize();
    const isMobile = width <= 768;

    return (
        <div className={`dashboard-wrapper ${isMobile ? "dashboard-mobile" : ""}`}>
            {!isMobile && <CornerDesign />}

            <h1 className="welcome-header">
                Need Help?
            </h1>

            <div className="student-banner" style={{ maxWidth: '800px', width: '90%', marginTop: '2rem' }}>
                <h2>Contact Support</h2>
                <p>If you are experiencing any technical issues or need assistance with your assignments, please contact our support team.</p>
                <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0 }}>
                    <li>📧 <strong>Email:</strong> abdurrahman.ali@lums.edu.pk</li>
                    {/* <li>📞 <strong>WhatsApp:</strong> +92 300 1234567</li> */}
                    <li>🏢 <strong>Office:</strong> SYSNET-LUMS, Lahore</li>
                </ul>
            </div>

            {/* <div className="dashboard-grid-2" style={{ marginTop: '2rem' }}>
                <div style={{ color: 'var(--color-text-navy)', padding: '1rem' }}>
                    <h3>Frequently Asked Questions</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <p><strong>Q: How do I submit an assignment?</strong></p>
                        <p>A: Once you complete your work in the Blockly editor, click the 'Save' or 'Submit' button in the bottom right panel.</p>
                    </div>
                </div>
            </div> */}
        </div>
    );
}
