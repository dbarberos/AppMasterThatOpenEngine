import * as React from 'react';
import * as Icons from '../react-components/icons'


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
    
    const [modalHeight, setModalHeight] = React.useState<string | undefined>(messageHeight)
    
    // React.useEffect(() => {
    //     const messageRowsCount = message?.split("<tr>").length;
    //     const calculatedHeight = `calc(${messageRowsCount} * 3.5rem + 5rem)`; // Example calculation
    //     setModalHeight(customHeight || calculatedHeight); // Use customHeight if provided
    // }, [message, customHeight]);

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
            case 'error': return 'Report';
            case 'warning': return 'Warning';
            case 'success': return 'CheckCircle';
            case 'info': return 'NotificationsActive';
            case 'update': return 'Update';
            case 'message': return 'Message';
            case 'clock': return 'Clock';
            case 'arrowup': return 'ArrowUpward';
            default: return 'RadioButtonUnchecked';
        }
    };
    //Recover the icon for the message
    const iconName = getIcon()
    const IconComponent = Icons[`${iconName}Icon`]
    ;
    const nameClass = `popup-${type}`



    const renderButtons = () => {
        // If no actions, render the default button for closing the message
        if (actions.length === 0) {
            return (
                <button key="close" className="message-btn" onClick={handleClose}>
                    <span className="message-btn-text">Close</span>
                </button>
            );
        }

        // Render action buttons
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
                        {IconComponent && <IconComponent size={100} className="message-icon-svg" color="#dfd9d9" />}
                        {/* <svg className="message-icon-svg" role="img" aria-label={icon} width="100px" height="100px">
                            <use href={`#${icon}`} />
                        </svg> */}
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







