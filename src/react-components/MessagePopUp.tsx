import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Icons from '../react-components/icons'


export interface MessagePopUpProps {
    type: 'error' | 'warning' | 'info' | 'success' | 'update' | 'message' | 'clock' | 'arrowup';
    title: string;
    message: string | React.ReactNode;
    actions?: string[]; //The interrogation symbol make actions optional
    messageHeight?: string;
    onActionClick?: Record<string, () => void>;
    onClose: () => void;     
}

export const MessagePopUp: React.FC<MessagePopUpProps> = ({ type, title, message, actions = [], messageHeight = "200", onActionClick, onClose }) => {
    

    const handleActionClick = (action: string) => {
        onActionClick?.[action]?.();
        onClose();
    }
    const handleClose = () => {
        onClose()
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
                    console.log(`Botón ${action} clickeado`)
                    handleActionClick(action)
                }}
                disabled={!onActionClick}// Disable if onActionClick is undefined as advise
            >
                <span className="message-btn-text">{action}</span>
            </button>
        ));
    };
 
    React.useEffect(() => {
    console.log ("MessagePopUp montado")

    return () => {    
    }
    }, [])



    React.useEffect(() => {
        console.log("MessagePopUp montado");
        // Opcional: Añadir una clase al body mientras el popup está abierto para deshabilitar scroll
        document.body.style.overflow = "hidden";
        return () => {
            console.log("MessagePopUp desmontado");
            // Limpiar la clase del body al cerrar
            document.body.style.overflow = "auto";
        };
    }, []);





    return ReactDOM.createPortal (
    
        <>
            <div className= "message-popup-backdrop"/>
        <dialog className={`${nameClass} popup`} id="message-error-popup" open>
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
        </>,
        document.body
    )

};

// Add display name for debugging purposes
MessagePopUp.displayName = 'MessagePopUp'



//https://www.joshwcomeau.com/snippets/react-components/in-portal/
//InPortal_React Portals_MessagePopUp aparece centrado en toda la pantalla y por encima de todo lo demás.
//Un Portal te permite renderizar un componente hijo en un nodo DOM diferente, fuera de la jerarquía del componente padre. Normalmente, se renderiza directamente en document.body