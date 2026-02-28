import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import * as Firestore from 'firebase/firestore';

import { useAuth } from './AuthContext';
import { firestoreDB } from '../../services/Firebase';
import { toast } from 'sonner';

export function UserEmailVerificationSuccess() {
    const { currentUser, userProfile, updateUserProfile } = useAuth();
    const navigate = ReactDOM.useNavigate();
    const [message, setMessage] = React.useState("Verifying your account, please wait...");

    React.useEffect(() => {
        // Se ejecuta solo una vez cuando el componente se monta
        const verifyAndUpgradeRole = async () => {
            if (!currentUser || !userProfile) {
                // Si no hay usuario, quizás llegó aquí por error.
                // Esperamos un poco por si el contexto de Auth aún no se ha actualizado.
                setTimeout(() => navigate('/auth'), 3000);
                return;
            }

            // Forzar la recarga del estado del usuario de Auth para obtener `emailVerified: true`
            await currentUser.reload();

            if (currentUser.emailVerified && userProfile.roleInApp === 'unverified') {
                // El email está verificado en Auth y el rol en Firestore es 'unverified'
                const userDocRef = Firestore.doc(firestoreDB, 'users', currentUser.uid);
                try {
                    await Firestore.updateDoc(userDocRef, { roleInApp: 'viewer' });
                    updateUserProfile({ roleInApp: 'viewer' });
                    setMessage("Thank you for verifying your email! Your account is currently pending activation by an administrator");
                    toast.success("Role updated to Viewer. Your account is now pending.");
                } catch (error) {
                    setMessage("An error occurred while updating your role. Please contact support.");
                    toast.error("Error updating role.");
                }
            } else if (currentUser.emailVerified) {
                setMessage("Your email has already been verified. Thank you!");
            }
            // Redirigir al usuario después de un momento
            setTimeout(() => navigate('/'), 5000);
        };

        verifyAndUpgradeRole();
    }, [currentUser, userProfile, navigate, updateUserProfile]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%',
            height: '100%',
        }}>
            <div style={{
                padding: '40px 50px',
                textAlign: 'center',
                maxWidth: '600px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                border: '1px solid var(--color-border)'
            }}>
                <h2 style={{ marginBottom: 'var(--gap-s)', fontSize: 'var(--font-3xl)' }}>Email Verification</h2>
                <p style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-fontbase-dark)', lineHeight: '1.6' }}>
                    {message}
                </p>
            </div>
        </div>
    );
}

