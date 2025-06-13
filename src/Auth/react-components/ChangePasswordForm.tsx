import * as React from 'react';
import { User as FirebaseUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../services/firebase/index'; 
import { useAuth } from '../../Auth/react-components/AuthContext'; 
import { toast } from 'sonner';

interface ChangePasswordFormProps {
  onPasswordChanged: () => void; // Callback para cuando la contraseña se cambia exitosamente
  onCancel: () => void; // Callback para cerrar el formulario
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onPasswordChanged, onCancel }) => {
    const { currentUser } = useAuth();
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [needsReauth, setNeedsReauth] = React.useState(true); // Por defecto, pedir la actual

    const handleReauthenticate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!currentUser || !currentUser.email) {
        setError("No se pudo obtener la información del usuario actual.");
        return;
        }
        if (!currentPassword) {
        setError("Por favor, ingresa tu contraseña actual.");
        return;
        }

        setError(null);
        setIsLoading(true);

        try {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        setNeedsReauth(false); // Reautenticación exitosa, ahora puede cambiar la contraseña
        toast.success("Autenticación verificada. Ahora puedes establecer tu nueva contraseña.");
        } catch (err: any) {
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setError("La contraseña actual es incorrecta.");
        } else {
            setError("Error al verificar la contraseña: " + err.message);
        }
        } finally {
        setIsLoading(false);
        }
    };

    const handleChangePassword = async (event: React.FormEvent) => {
        event.preventDefault();
        if (newPassword !== confirmNewPassword) {
        setError("Las nuevas contraseñas no coinciden.");
        return;
        }
        if (newPassword.length < 6) {
        setError("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
        }

        setError(null);
        setIsLoading(true);

        if (!currentUser) {
        setError("Usuario no encontrado.");
        setIsLoading(false);
        return;
        }

        try {
        await updatePassword(currentUser, newPassword);
        toast.success("¡Contraseña cambiada exitosamente!");
        onPasswordChanged(); // Llama al callback
        } catch (err: any) {
        setError("Error al cambiar la contraseña: " + err.message);
        // Si el error es 'auth/requires-recent-login', forzar reautenticación
        if (err.code === 'auth/requires-recent-login') {
            setNeedsReauth(true);
            setError("Por seguridad, necesitamos verificar tu contraseña actual nuevamente.");
        }
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container" style={{ maxWidth: '450px', margin: '2rem auto' }}> {/* Estilo similar a AuthForm */}
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>Cambiar Contraseña</h2>

        {error && <p className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        {needsReauth ? (
            <form onSubmit={handleReauthenticate} style={{ width: '100%' }}>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>
                To continue, please enter your current password.
            </p>
            <div className="form-group">
                <label htmlFor="currentPassword">Current password:</label>
                <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Verificando...' : 'Verificar'}
            </button>
            </form>
        ) : (
            <form onSubmit={handleChangePassword} style={{ width: '100%' }}>
            <div className="form-group">
                <label htmlFor="newPassword">New password:</label>
                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm new password:</label>
                <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
            </form>
        )}
        <button onClick={onCancel} className="link-button" style={{ marginTop: '1rem', display: 'block', textAlign: 'center', width: '100%' }} disabled={isLoading}>
            Cancelar
        </button>
        {/* Los estilos JSX de AuthForm.tsx se aplicarían aquí si son globales o importados */}
        </div>
    );
};