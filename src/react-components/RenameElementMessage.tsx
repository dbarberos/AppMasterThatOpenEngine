import * as React from 'react';

import { RenameIcon } from '../react-components/icons';
import { useMessagePopUp } from '../hooks/useMessagePopUp';

interface RenameDialogProps {
    elementTitle: string
    previousElementName: string;
    onRename: (newName: string) => void;
    onCancel: () => void;
}

export function RenameElementMessage({ elementTitle, previousElementName, onRename, onCancel }: RenameDialogProps) {

    
    const inputRef= React.useRef<HTMLInputElement>(null);
    

    const handleRename = () => {
        const newElementName = inputRef.current?.value.trim() || ""
        onRename(newElementName);
    }
    

    return (
        <dialog className="popup-default">
            <div className="message-content toast toast-popup-default">
                <div className="message-icon">
                    <RenameIcon size={24} color="#08090a" className="message-icon-svgDark" />
                </div>
                <div className="toast-column">
                    <div className="message-text">
                        <h5 className="message-text-title">{elementTitle} definition</h5>
                        <p className="message-text-message">Select the text field and populate it with a new name</p>
                    </div>
                    <div className="message-text">
                        <input
                            className="toast-input-text"
                            type="text"
                            id="newProjectName"
                            placeholder={previousElementName}
                            ref={inputRef}
                            autoFocus
                            required
                            minLength={5}
                            autoComplete="off"
                        />
                        <label className="toast-input-text" htmlFor="newProjectName" >
                            {previousElementName}
                        </label>
                    </div>
                </div>
                <div className="message-btns">
                    <button className="message-btn" type="button" id="confirmRename" onClick={handleRename}>
                        <span className="message-btn-text">Do it</span>
                    </button>
                    <button className="message-btn" type="button" id="cancelRename" onClick={onCancel}>
                        <span className="message-btn-text">Cancel</span>
                    </button>
                </div>
            </div>
        </dialog>
    )
}
