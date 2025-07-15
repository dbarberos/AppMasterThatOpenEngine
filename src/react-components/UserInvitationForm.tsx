import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { toast } from 'sonner';

interface UserInvitationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSendInvitation: (email: string) => Promise<void>;
}

export const UserInvitationForm: React.FC<UserInvitationFormProps> = ({
    isOpen,
    onClose,
    onSendInvitation,
}) => {
    const [email, setEmail] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dialogRef = React.useRef<HTMLDialogElement>(null);

    // Función para manejar clics en el formulario
    const handleFormMouseDown = (e: React.MouseEvent<HTMLFormElement>) => {
        // Solo actuar si el clic no fue en un botón o en el input
        const target = e.target as HTMLElement;
        if (target.tagName !== 'BUTTON' && target !== inputRef.current) {
            e.preventDefault();
            inputRef.current?.focus();
        }
    };


    // Enfocar el input cuando el modal se abre
    React.useEffect(() => {
        if (isOpen) {
            // Usamos un pequeño timeout para asegurar que el DOM esté listo
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Efecto para "atrapar" el foco dentro del modal y manejar la tecla Escape
    React.useEffect(() => {
        if (!isOpen) return;

        const dialogNode = dialogRef.current;
        if (!dialogNode) return;

        // 1. Encontrar todos los elementos enfocables dentro del diálogo
        const focusableElements = dialogNode.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // 2. Crear el manejador de eventos de teclado
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            if (e.key === 'Tab') {
                if (e.shiftKey) { // Navegando hacia atrás (Shift + Tab)
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else { // Navegando hacia adelante (Tab)
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        // 3. Añadir y quitar el listener
        dialogNode.addEventListener('keydown', handleKeyDown);

        return () => {
            dialogNode.removeEventListener('keydown', handleKeyDown);


        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSending) return;

        // Validación simple de email
        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setIsSending(true);

        // Usamos toast.promise para dar feedback al usuario sobre el proceso
        toast.promise(onSendInvitation(email), {
            loading: 'Sending invitation...',
            success: () => {
                onClose(); // Cierra el modal en caso de éxito
                return `Invitation sent to ${email}!`;
            },
            error: (err) => {
                // El error vendrá de la función onSendInvitation
                return err.message || 'Failed to send invitation.';
            },
            finally: () => {
                setIsSending(false);
                setEmail('');
            }
        });
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="dialog-container">
            <div className="custom-backdrop" style={{ pointerEvents: 'none' }}  />
            <dialog
                ref={dialogRef}
                open
                className="popup-default"
                style={{ zIndex: 1501, top: '30%' }}
                
            >
                <form
                    onSubmit={handleSubmit}
                    className="message-content toast"
                    style={{ height: 'auto', padding: '2rem' }}
                    onMouseDown={handleFormMouseDown} 
                >
                    <div
                        className="message_text"
                        style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 'var(--gap-base)' }}
                    >
                        <h5 className="message-text-title">Invite New User</h5>
                        <p className="message-text-message">
                            Enter the email address of the user you want to invite. They will receive a link to create their account.
                        </p>
                        <input
                            ref={inputRef}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                            className="toast-input-text"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div
                        className="message-btns"
                        style={{
                            marginTop: 'var(--gap-m)',
                            gap: 'var(--gap-base)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <button
                            type="button"
                            className="buttonC"
                            onClick={onClose}
                            disabled={isSending}
                            style={{
                                background: 'linear-gradient(90deg, #1f2333, #22232b)',
                                border: 'none',
                                boxShadow: 'none',
                                
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="buttonB"
                            disabled={isSending}
                            style={{ boxShadow: 'inset 0 0 0.5rem 0 #1d1e26' }}
                        >
                            {isSending ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </dialog>
        </div>,
        document.body
    );
};

UserInvitationForm.displayName = 'UserInvitationForm';

