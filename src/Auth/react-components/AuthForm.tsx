import * as React from 'react';
import * as Firestore from "firebase/firestore"
import * as ReactDOM from 'react-dom';
import {
    User as FirebaseUser,
    AuthError // Importar AuthError para tipar errores de Firebase
} from 'firebase/auth';
//import { FirebaseAuthService } from '../../services/firebase/FirebaseAuth';

import {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithGitHub
} from '../../services/firebase/firebaseAuth'; 

import { toast } from 'sonner';
import { GoogleIcon, GithubIcon } from '../../react-components';


interface AuthFormProps {
    onUserAuthenticated: (user: FirebaseUser) => void;
    initialMode?: 'signIn' | 'signUp'; // Para controlar el modo inicial
}

export const AuthForm: React.FC<AuthFormProps> = ({ onUserAuthenticated, initialMode = 'signUp' }) => {
    const [isSignUp, setIsSignUp] = React.useState(initialMode === 'signUp');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState(''); // Para el registro
    const [nickname, setNickname] = React.useState(''); // Para el registro
    //const [firstName, setFirstName] = React.useState(''); // Para el registro
    //const [lastName, setLastName] = React.useState(''); // Para el registro
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [portalContainer, setPortalContainer] = React.useState<HTMLDivElement | null>(null);


    React.useEffect(() => {
        setIsSignUp(initialMode === 'signUp');
    }, [initialMode]);
    
    React.useEffect(() => {
        // Crear un div para el portal
        const el = document.createElement('div');
        // Opcionalmente, puedes añadir una clase o ID si necesitas estilos globales específicos para el contenedor del portal        

        // Añadir el div al body
        document.body.appendChild(el);
        setPortalContainer(el);

        // Función de limpieza: eliminar el div del body cuando el componente se desmonte
        return () => {
            if (el.parentNode) { // Verificar si todavía está en el DOM
                document.body.removeChild(el);
            }
            setPortalContainer(null); // Limpiar el estado
        };
    }, []); // El array de dependencias vacío asegura que esto se ejecute solo al montar y desmontar



    const handleEmailPasswordSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);
    
        if (isSignUp) {
            if (password !== confirmPassword) {
                setError("Las contraseñas no coinciden.");
                //toast.error("Las contraseñas no coinciden."); // Ejemplo con sonner
                setIsLoading(false);
                return;
            }
            if (!nickname) {
                setError("Nickname, is required to register.");
                setIsLoading(false);
                return;
            }
            try {
                const user = await signUpWithEmail({
                    email,
                    password_DO_NOT_STORE_THIS_PLAINTEXT: password,
                    nickname,                    
                });
                toast.success(`¡Welcome ${nickname}! Account successfully created.`);
                onUserAuthenticated(user);
            } catch (err: any) {
                const authError = err as AuthError;
                if (authError.code === 'auth/email-already-in-use' || authError.code === 'auth/email-already-in-use-firestore') {
                    setError('Este correo electrónico ya está registrado. Por favor, inicia sesión.');
                    setIsSignUp(false); // Cambiar a modo Sign In
                } else {
                    setError(authError.message || 'Ocurrió un error durante el registro.');
                }
            }
        } else {
            // Sign In
            try {
                const user = await signInWithEmail({ email, password_DO_NOT_STORE_THIS_PLAINTEXT: password });
                toast.success(`¡Bienvenido de nuevo!`);
                onUserAuthenticated(user);
            } catch (err: any) {
                const authError = err as AuthError;
                if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
                    setError('Correo electrónico o contraseña incorrectos.');
                } else {
                    setError(authError.message || 'Ocurrió un error al iniciar sesión.');
                }
            }
        }
        setIsLoading(false);
    };

    const handleOAuthSignIn = async (providerAction: () => Promise<FirebaseUser>) => {
        setError(null);
        setIsLoading(true);
        try {
            const user = await providerAction();
            // Aquí, si es un nuevo usuario vía OAuth, firebaseAuth.ts (signInWithGoogle/signInWithGitHub)
            // debería haber usado el 'nickname' del estado del formulario para crear el perfil en Firestore.
            // Si el usuario ya existía, simplemente inicia sesión.
            onUserAuthenticated(user);
        } catch (err: any) {
            const authError = err as AuthError;
            if (authError.code === 'auth/account-exists-with-different-credential') {
                // Este error es importante. Significa que el usuario intentó iniciar sesión
                // con Google/GitHub, pero ya existe una cuenta con ese correo electrónico
                // que se creó usando email/contraseña (u otro proveedor OAuth).
                // Firebase Auth puede ayudar a vincular estas cuentas, pero requiere un flujo más complejo.
                // Por ahora, mostramos un error genérico, pero idealmente guiarías al usuario.
                // Una opción es pedirle que inicie sesión con el método original y luego vincule
                // la nueva cuenta desde la configuración de su perfil.
                setError('Ya existe una cuenta con este correo electrónico usando un método de inicio de sesión diferente.');
            } else {
                setError(authError.message || 'Error al iniciar sesión con el proveedor.');
            }
        }
        setIsLoading(false);
    };

    


    const formContent = (
        <>
        {/* <div className= "message-popup-backdrop"/>  */}
        <div className="auth-portal-overlay"> {/* Clase para el fondo oscuro y centrado */}
            <div className="auth-card"> {/* Clase para el card como en shadcn/ui */}
                <div className="auth-card-header">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <img
                            src="https://merakiui.com/images/logo.svg" // Reemplaza con tu logo
                            alt="Logo"
                            style={{ height: '2.5rem' }}
                        />
                    </div>
                    <h2 className="auth-card-title">
                        {isSignUp ? 'Create New Account' : 'Login to your account'}
                    </h2>
                    <p className="auth-card-description">
                        {isSignUp 
                            ? 'Enter your details below to create an account.' 
                            : 'Enter your email below to login to your account.'}
                    </p>
                </div>

                <div className="auth-card-content">
                    {error && <p className="auth-error-message">{error}</p>}
                    <form onSubmit={handleEmailPasswordSubmit}>
                        <div className="auth-form-fields">
                            {isSignUp && (
                                <>
                                    <div className="auth-input-group">
                                        <label htmlFor="nickname">Nickname</label>
                                        <input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} required minLength={3} />
                                    </div>
                                </>
                            )}
                            <div className="auth-input-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="m@example.com" required />
                            </div>
                            <div className="auth-input-group">
                                <div className="auth-label-group">
                                    <label htmlFor="password">Password</label>
                                    {!isSignUp && (
                                        <a href="#" className="auth-forgot-password-link" onClick={(e) => {e.preventDefault(); toast.info("Forgot password functionality is not yet implemented.");}}>
                                            Forgot your password?
                                        </a>
                                    )}
                                </div>
                                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                            </div>
                            {isSignUp && (
                                <div className="auth-input-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                            )}
                        </div>

                            <div className="auth-action-buttons">
                                <button
                                    type="submit"
                                    className="buttonB"
                                    disabled={isLoading}
                                    style={{
                                        border: "1px solid var(--color-light)",
                                        marginTop: 20,
                                        borderRadius: "var(--br-xs)"
                                    }}
                                >
                                {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')}
                            </button>
                            
                            {/* Los botones de OAuth se muestran tanto en Sign In como en Sign Up */}
                            
                            <div className="auth-divider">
                                <span className="auth-divider-line"></span>
                                    <span className="auth-divider-text">
                                        OR
                                        {isSignUp ? ' SIGN UP ' : ' CONTINUE '}
                                        WITH
                                    </span>
                                <span className="auth-divider-line"></span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "var(--gap-base)",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleOAuthSignIn(() =>
                                            signInWithGoogle(isSignUp && nickname.trim() ? nickname.trim() : undefined)
                                        )
                                    }
                                    className="button"
                                    disabled={isLoading || (isSignUp && !nickname.trim())} // Deshabilitado si está cargando o (si es sign-up y no hay nickname)
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 'var(--br-2xs)',
                                        border: '1px solid var(--color-light)'
                                    }}
                                    title={isSignUp && !nickname.trim() ? "Please enter a nickname first" : "Login with Google"}
                                >
                                    <GoogleIcon
                                        size={24}
                                        color="var(--color-fontbase)"
                                        className="social-icon" />
                                    {isSignUp ? 'Sign up with Google' : 'Login with Google'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleOAuthSignIn(() =>
                                            signInWithGitHub(isSignUp && nickname.trim() ? nickname.trim() : undefined)
                                        )
                                    }
                                    className="button"
                                    disabled={isLoading || (isSignUp && !nickname.trim())} // Deshabilitado si está cargando o (si es sign-up y no hay nickname)
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 'var(--br-2xs)',
                                        border: '1px solid var(--color-light)'
                                    }}
                                    title={isSignUp && !nickname.trim() ? "Please enter a nickname first" : "Login with GitHub"}
                                >
                                    <GithubIcon
                                        size={24}
                                        color="var(--color-fontbase)"
                                        className="todo-icon-plain" />
                                    {isSignUp ? 'Sign up with GitHub' : 'Login with GitHub'}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="auth-toggle-mode">
                        {isSignUp ? (
                            <p
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    columnGap: 10,
                                    alignItems: 'center'
                                }}
                            >
                                Already have an account?
                                <button
                                    onClick={() => { setIsSignUp(false); setError(null); }}
                                    className="auth-link-button"
                                    disabled={isLoading}
                                >
                                    Login
                                </button>
                            </p>                                
                        ) : (
                            <p
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                columnGap: 10,
                                alignItems: 'center'
                            }}>
                                Don't have an account?
                                <button
                                    onClick={() => { setIsSignUp(true); setError(null); }}
                                    className="auth-link-button"
                                    disabled={isLoading}
                                >
                                    Sign up
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    )
        
    // Si el contenedor del portal aún no está listo (por ejemplo, en el primer ciclo de renderizado antes de que useEffect se ejecute),
    // o si el componente se está desmontando, no renderizar nada.
    if (!portalContainer) {
        return null;
    }



// Renderizar el contenido del formulario en el portalContainer
return ReactDOM.createPortal(formContent, portalContainer);

}
