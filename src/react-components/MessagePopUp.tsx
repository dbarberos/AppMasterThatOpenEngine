import * as React from 'react';

interface MessagePopUpProps {
    type: 'error' | 'warning' | 'info' | 'success' | 'update' | 'message' | 'clock' | 'arrowup';
    title: string;
    message: string;
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
                        <p className="message-text-message">{message}</p>
                    </div>
                    <div className="message-btns">
                        {actions.map((action) => (
                            <button key={action} className="message-btn" onClick={() => handleActionClick(action)}>
                                <span className="message-btn-text">{action}</span>
                            </button>
                        ))}
                        {/* Fallback button for when "actions" is not provided */}
                        {!actions && <button key="close" className="message-btn" onClick={handleClose}>
                        <span className="message-btn-text">close</span>
                        </button>}
                    </div>
                </div>
            </div>
        </dialog>
    );
};







