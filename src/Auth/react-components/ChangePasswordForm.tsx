import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { User as FirebaseUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../services/firebase/index'; 
import { useAuth } from '../../Auth/react-components/AuthContext'; 
import { toast } from 'sonner';
import { LoadingIcon } from '../../react-components/icons';

interface ChangePasswordFormProps {
  onPasswordChanged: () => void; // Callback para cuando la contraseña se cambia exitosamente
  onCancel: () => void; // Callback para cerrar el formulario
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onPasswordChanged, onCancel }) => {
    const { currentUser } = useAuth();
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [currentPasswordError, setCurrentPasswordError] = React.useState<string | null>(null);
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [needsReauth, setNeedsReauth] = React.useState(true); // Por defecto, pedir la actual



    const handleReauthenticate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!currentUser || !currentUser.email) {
            setError("Could not get current user information.");
            return;
        }
        setCurrentPasswordError(null)
        if (!currentPassword) {
            setError("Please enter your current password.");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            setNeedsReauth(false); // Reautenticación exitosa, ahora puede cambiar la contraseña
            setError(null);
            toast.success("Authentication verified. You can now set your new password.");
        } catch (err: any) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-login-credentials') {
                setCurrentPasswordError("The current password is incorrect."); 
                setError(null)
                toast.error("The current password is incorrect.")
            } else {
                const errorMessage = "Error at verifying password: " + err.message;
                setError(errorMessage);
                toast.error("An unexpected error occurred. Please try again.")
            }
            
        } finally {
            setIsLoading(false);
        }
    };




    const handleChangePassword = async (event: React.FormEvent) => {
        event.preventDefault();
        if (newPassword !== confirmNewPassword) {
        setError("The new passwords do not match");
        return;
        }
        if (newPassword.length < 6) {
        setError("The new password must be at least 6 characters long.")
        }

        setError(null);
        setIsLoading(true);

        if (!currentUser) {
            setError("User not found.");
            setIsLoading(false);
            return;
        }

        try {
            await updatePassword(currentUser, newPassword);
            toast.success("Password changed successfully!");
            onPasswordChanged(); // Llama al callback
        } catch (err: any) {
            setError("Error changing password:" + err.message);
            // Si el error es 'auth/requires-recent-login', forzar reautenticación
            if (err.code === 'auth/requires-recent-login') {
                setNeedsReauth(true);
                setError("For security reasons, we need to verify your current password again.");
            }
        } finally {
            
        }
    };


    React.useEffect(() => {
        console.log('ChangePasswordForm mounted');
        return () => console.log('ChangePasswordForm unmounted');
    }, []);


    //Portal container must be initialized before any potential early returns.
    const portalContainer = React.useRef(document.createElement("div"));

    React.useEffect(() => {
        const el = portalContainer.current;
        el.className = "change-password-modal-portal";
        document.body.appendChild(el);
        return () => {
            // Safety check to prevent errors if the element is already removed
            if (document.body.contains(el)) {
                document.body.removeChild(el);
            }
        };
    }, []);


    if (isLoading) {
    // Render the loading icon inside the portal to maintain the modal structure
    return ReactDOM.createPortal(<div className="custom-backdrop" style={{ zIndex: 1500 }}><LoadingIcon /></div>, portalContainer.current);
    }

    return ReactDOM.createPortal(
        <div 
            className="custom-backdrop"
            style={{
                position: 'fixed',
                zIndex: 1500
            }}
        >
            <div className="auth-form-container" > {/* Estilo similar a AuthForm */}
                <div className="auth-form-basecard">
                    <h2
                        style={{
                            textAlign: 'center',
                            marginBottom: '1.5rem',
                            borderBottom: '2px solid var(--color-fontbase-dark)',
                            paddingBottom: 15,
                            justifyContent: 'center',


                        }}>
                        Change Password
                    </h2>
                    

                    {error && <p className="error-message" style={{ color: 'red', fontSize: 'var(font-size-xl)', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                    
                    {needsReauth ? (
                        <form
                            onSubmit={handleReauthenticate}
                            style={{
                                width: '100%',
                                rowGap: 'var(--gap-xs)',
                                
                            }}
                        >
                            <h4
                                style={{
                                    marginBottom: '1rem',                                    
                                    color: "var(--color-fonbase)"
                                }}>
                                To continue, please enter your current password.
                            </h4>
                            <div className="form-group">
                                <label htmlFor="currentPassword">
                                    
                                </label>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        columnGap:20,

                                    }}>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        value={currentPassword}
                                        onChange={(e) => {
                                            setCurrentPassword(e.target.value);
                                            setCurrentPasswordError(null)
                                        }}
                                        required
                                        style={{
                                            width: "80%",
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        className="buttonB"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify'}
                                    </button>                                    
                                </div>
                                {currentPasswordError && <p style={{ color: 'red', fontSize: 'var(font-size-xl)', marginTop: '0.5rem', textAlign: 'left' }}>{currentPasswordError}</p>}
                            </div>
                                
                            
                        </form>

                    ) : (
                        <form
                            onSubmit={handleChangePassword}
                            style={{
                                width: '100%',
                                display: 'flex',
                                rowGap: 'var(--gap-base)',
                                flexDirection: 'column',
                            }}
                        >
                            <div className="form-group">
                                    <label
                                        htmlFor="newPassword"
                                        style={{
                                            fontSize: 'var(--font-xl)',
                                            color: 'var(--color-fontbase)',
                                            fontWeight: 600,
                                        }}
                                    >New password:</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required minLength={6}
                                        placeholder="Must contain at least 6 characters"
                                        style={{
                                            width: "80%",
                                            fontSize: 'var(--font-lg)',
                                        }}
                                    />
                            </div>
                            <div className="form-group">
                                <label
                                    htmlFor="confirmNewPassword"
                                    style={{
                                        fontSize: 'var(--font-xl)',
                                        color: 'var(--color-fontbase)',
                                        fontWeight: 600,
                                    }}>
                                Confirm new password:
                                </label>
                                    <input
                                        type="password"
                                        id="confirmNewPassword"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        required
                                        placeholder="Must match the new password"
                                        style={{
                                            width: "80%",
                                            fontSize: 'var(--font-lg)',
                                        }}
                                    />
                            </div>
                                <button
                                    type="submit"
                                    className="buttonB"
                                    disabled={isLoading}
                                    style={{
                                        width: 'fit-content',
                                    }}
                                >
                                {isLoading ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    )}
                    <button
                        onClick={onCancel}
                        className="auth-link-button"
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            paddingRight: 20,
                            marginTop: '1rem',
                            display: 'block',
                            textAlign: 'center',
                            width: 'fit-content',
                            aspectRatio: '1',
                            borderRadius: '100%',
                            textDecoration: 'none',
                        }}
                        disabled={isLoading}>
                        X
                    </button>
                    
                </div>
            {/* Los estilos JSX de AuthForm.tsx se aplicarían aquí si son globales o importados */}
            </div>
        </div>,

        portalContainer.current
    );
};