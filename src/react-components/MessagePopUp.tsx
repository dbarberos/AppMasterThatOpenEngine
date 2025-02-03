import * as React from 'react';


interface MessagePopUpProps {
    type: 'error' | 'warning' | 'info' | 'success' | 'update' | 'message' | 'clock' | 'arrowup';
    title: string;
    message: string | React.ReactNode;
    actions?: string[]; //The interrogation symbol make actions optional
    messageHeight?: string;
    onActionClick?: (action: string) => void;
    onClose?: () => void;
}

export const MessagePopUp: React.FC<MessagePopUpProps> = ({ type, title, message, actions = [], messageHeight = "200", onActionClick, onClose }) => {
    
    const [isOpen, setIsOpen] = React.useState(true);
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    
    React.useEffect(() => {
        if (dialogRef.current && isOpen) {
            dialogRef.current.showModal();
            // dialogRef.current.focus();

            // Prevent Escape key from closing the dialog
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.code === 'Escape') {
                    event.stopPropagation();
                    event.preventDefault();
                }
            };
            dialogRef.current.addEventListener('keydown', handleKeyDown);

            return () => {
                if (dialogRef.current?.open) {
                    dialogRef.current.close();
                }
                dialogRef.current?.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, dialogRef]);


    const handleActionClick = (action: string) => {
        onActionClick?.(action)
        setIsOpen(false)
    };

    const handleClose = () => {
        onClose?.()
        setIsOpen(false)        
    }

    const getIcon = () => {
        switch (type) {
            case 'error': return 'report';
            case 'warning': return 'warning';
            case 'success': return 'check_circle';
            case 'info': return 'notifications_active';
            case 'update': return 'update';
            case 'message': return 'message';
            case 'clock': return 'clock';
            case 'arrowup': return 'arrowup';
            default: return 'radio_button_unchecked';
        }
    };
    const icon = getIcon();
    const nameClass = `popup-${type}`



const renderButtons = () => {
        // Si no hay acciones, mostrar botón de cierre por defecto
        if (actions.length === 0) {
            return (
                <button key="close" className="message-btn" onClick={handleClose}>
                    <span className="message-btn-text">Close</span>
                </button>
            );
        }

        // Renderizar botones de acciones
        return actions.map((action) => (
            <button 
                key={action} 
                className="message-btn" 
                onClick={() => {
                    console.log(`Botón ${action} clickeado`);
                    handleActionClick(action);
                }}
            >
                <span className="message-btn-text">{action}</span>
            </button>
        ));
    };

        
    if (!isOpen) {
        return null; // Don't render anything if closed
    }
    


    return (
        <dialog ref={dialogRef} className={nameClass} id="message-error-popup">
            <div className="message-popup" >
                <div className={`message-content toast toast-${nameClass}`} style={{ height: messageHeight }}>
                    <div id="message-popup-icon" className="message-icon toast-icon" >
                        <svg className="message-icon-svg" role="img" aria-label={icon} width="100px" height="100px">
                            <use href={`#${icon}`} />
                        </svg>
                    </div>
                    <div className="message_text" id="message-popup-text" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', rowGap: 'var(--gap-5xs)' }}>
                        <h5 className="message-text-title">{title}</h5>
                        <div className="message-text-message">{message}</div>
                    </div>
                    <div className="message-btns">
                        {renderButtons()}
                    </div>
                </div>
            </div>
        </dialog>
    );
};







