import * as React from 'react';
import { FirebaseAuthService } from '../../services/firebase/FirebaseAuth';
import { toast } from 'sonner';

export const LoginForm: React.FC = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
      });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            await FirebaseAuthService.loginWithEmailPassword(email, password);
            // Navegación al dashboard o página principal tras login exitoso
            // Ejemplo: history.push('/dashboard');
        } catch (error: any) {
            // El toast ya se maneja en FirebaseAuthService, pero puedes añadir lógica adicional si es necesario
            console.error("Login failed:", error);
        } finally {
            setIsLoading(false);
        }
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    


    return (
        <div>
        <div className="login-container">
            <div className="login-image"></div>

            <form 
                onSubmit={handleSubmit}
                style={{ width: '100%', padding: '2rem 1.5rem' }}
            >
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img 
                    src="https://merakiui.com/images/logo.svg" 
                    alt="Logo" 
                    style={{ height: '2rem' }} 
                />
                </div>

                <p style={{ 
                marginTop: '0.75rem', 
                fontSize: '1.25rem', 
                lineHeight: '1.75rem', 
                textAlign: 'center', 
                color: '#6b7280' 
                }}>
                Welcome back!
                </p>

                <a href="#" className="google-login-button">
                <div style={{ padding: '0.5rem' }}>
                    <svg style={{ width: '1.5rem', height: '1.5rem' }} viewBox="0 0 40 40">
                    <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107" />
                    <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00" />
                    <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50" />
                    <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2" />
                    </svg>
                </div>
                <span style={{ 
                    width: '83.333333%', 
                    padding: '0.75rem 1rem', 
                    fontWeight: '700', 
                    textAlign: 'center' 
                }}>
                    Sign in with Google
                </span>
                </a>

                <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginTop: '1rem' 
                }}>
                <span className="divider-line"></span>
                <span style={{ 
                    padding: '0 0.5rem', 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    color: '#6b7280'
                }}>
                    or login with email
                </span>
                <span className="divider-line"></span>
                </div>

                <div style={{ marginTop: '1rem' }}>
                <label htmlFor="email" style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#6b7280' 
                }}>
                    Email Address
                </label>
                <input 
                    id="email"
                    className="input-field"
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />
                </div>

                <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label htmlFor="password" style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#6b7280' 
                    }}>
                    Password
                    </label>
                    <a href="#" style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280',
                    textDecoration: 'none'
                    }}>
                    Forget Password?
                    </a>
                </div>
                <input 
                    id="password"
                    className="input-field"
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                />
                </div>

                <button type="submit" className="login-button">
                Sign In
                </button>

                <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginTop: '1rem' 
                }}>
                <span className="divider-line"></span>
                <a href="#" style={{ 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    color: '#6b7280',
                    textDecoration: 'none'
                }}>
                    or sign up
                </a>
                <span className="divider-line"></span>
                </div>
            </form>
            </div>
        );




        <form onSubmit={handleSubmit}>
            <h2>Iniciar Sesión</h2>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Contraseña:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
            {/* Aquí podrías añadir enlaces para "Olvidé mi contraseña" y "Crear cuenta" */}
            </form>
    </div>
    );
};

export default LoginForm;