import { useState } from 'react';
import { SignIn, SignUp } from "@clerk/react";
import '../App.css';

function Login() {
    const [isLogin, setIsLogin] = useState(true);

    // Common styles to keep things Navy and larger
    const appearanceOverrides = {
        elements: {
            card: { boxShadow: "none", background: "transparent", border: "none" },
            headerTitle: { display: "none" },
            headerSubtitle: { display: "none" },
            // Fix for the blackout footer:
            footer: { background: "transparent" },
            footerActionText: { color: "var(--color-text-navy)", fontSize: "1.1rem" },
            footerActionLink: { color: "var(--color-text-navy)", fontWeight: "bold", fontSize: "1.1rem" },
            // Increase font sizes for inputs and labels
            formFieldLabel: { color: "var(--color-text-navy)", fontSize: "1.2rem" },
            formFieldInput: { fontSize: "1.1rem", padding: "12px" },
            formButtonPrimary: {
                fontSize: "1.2rem",
                backgroundColor: "var(--color-text-gold)",
                color: "black",
                border: "1px solid #333"
            },
            // Hiding the "Secured by Clerk" if it contributes to the blackout
            internal: { display: "none" }
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="logo-container">
                    <img
                        src="src/assets/ddh-logo-accronim.svg"
                        alt="DDH Logo"
                        style={{ width: '300px', height: 'auto' }}
                    />
                </div>

                <p className="subtitle" style={{ color: 'var(--color-text-navy)', fontSize: '1.5rem' }}>
                    <span style={{ color: 'var(--color-text-gold)' }}>Diploma in</span> Digital Health
                </p>

                <div className="clerk-wrapper">
                    {isLogin ? (
                        <SignIn
                            forceRedirectUrl="/ddh-portal/dashboard"
                            appearance={appearanceOverrides}
                        />
                    ) : (
                        <SignUp
                            forceRedirectUrl="/ddh-portal/dashboard"
                            appearance={appearanceOverrides}
                        />
                    )}
                </div>

                <p
                    style={{ marginTop: '1.5rem', color: 'var(--color-text-navy)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
                </p>
            </div>
        </div>
    );
}

export default Login;