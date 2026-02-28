import * as React from 'react';
import { useAuth } from '../Auth/react-components/AuthContext';
import { resendVerificationEmail } from '../services/Firebase/firebaseAuth';
import { toast } from 'sonner';
import { NotificationsActiveIcon } from './icons';

export function UserUnverifiedPage() {
    const { currentUser } = useAuth();
    const [isSending, setIsSending] = React.useState(false);

    const handleResendEmail = async () => {
        if (!currentUser) {
            toast.error("Could not find user information to resend email.");
            return;
        }

        setIsSending(true);
        try {
            await resendVerificationEmail(currentUser);
            toast.success("A new verification email has been sent to your address.");
        } catch (error: any) {
            console.error("Error resending verification email:", error);
            toast.error(error.message || "Failed to resend verification email. Please try again later.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: '20px'
        }}>
            <div style={{
                padding: '40px 50px',
                textAlign: 'center',
                maxWidth: '650px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--gap-m)'
            }}>
                <NotificationsActiveIcon size={60} color="var(--color-info2)" className="todo-icon-plain" />
                <br/>
                <h2 style={{ fontSize: 'var(--font-3xl)' }}>
                    Please Verify Your Email
                </h2>
                <p style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-fontbase-dark)', lineHeight: '1.6' }}>
                    A verification link has been sent to your email address.
                    You need to verify your account before you can access all the features of the application.
                    You can still access and edit your profile.
                </p>
                <br/>
                <button
                    onClick={handleResendEmail}
                    disabled={isSending}
                    className="buttonB"
                    style={{
                        marginTop: 'var(--gap-s)',
                        minWidth: '200px',
                        opacity: isSending ? 0.7 : 1,
                        cursor: isSending ? 'wait' : 'pointer'
                    }}
                >
                    {isSending ? 'Sending...' : 'Resend Verification Email'}
                </button>
            </div>
        </div>
    );
}
