import * as React from 'react';
import { MessagePopUp } from '../react-components';

interface MessagePopUpOptions {
    type: 'error' | 'warning' | 'info' | 'success' | 'update' | 'message' | 'clock' | 'arrowup';
    title: string;
    message: string | React.ReactNode;
    actions?: string[]; //The interrogation symbol make actions optional
    messageHeight?: string;
    callbacks?: Record<string, () => void>; // Callbacks for actions. Typescript restriction of a generic type
}
/*
export function useMessagePopUp() {

    const [messagePopUp, setMessagePopUp] = React.useState<React.ReactNode | null>(null)
    const [showMessage, setShowMessage] = React.useState(false)
    


    function handleMessagePopUp(options: MessagePopUpOptions) {
        setMessagePopUp(
            <MessagePopUp
                type={options.type}
                title={options.title}
                message={options.message}
                actions={options.actions || []}
                messageHeight={options.messageHeight}
                onActionClick={(action) => {
                    options.callbacks?.[action]?.(); //Call the appropriate callback
                    setMessagePopUp(null); //Close the message after action
                }}
                onClose={() => {
                    setMessagePopUp(null); //Close the message popup
                }}
            />
        );
        setShowMessage(true); // Show the message popup
    }
        
    return { messagePopUp, showMessage, handleMessagePopUp }
}
*/