import * as React from 'react';
import * as ReactDOM from 'react-dom'

import { RenameIcon } from '../react-components/icons';
import { MessagePopUp, MessagePopUpProps } from '../react-components';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';

interface RenameElementMessageProps {
    projectsManager?: ProjectsManager
    project?: Project
    elementType: 'project' | 'todo'
    elementTitle: string
    previousElementName: string;
    onRename: (newName: string) => void;
    onCancel: () => void;
}

export function RenameElementMessage({
    projectsManager,
    project,
    elementType,
    elementTitle,
    previousElementName,
    onRename,
    onCancel
}: RenameElementMessageProps) {

    const inputRef = React.useRef<HTMLInputElement>(null);

    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)


    const validateName = (newName: string): boolean => {        
        // Basic validation: Check if the name is empty
        if (newName.trim() === "") {
            // Show an error message
            showError(`Empty ${elementType} name`, `Please enter a valid ${elementType} name.`)
            return false

                    }
        if (newName.length < 5) {
            // Show an error message
            showError(`Invalid ${elementType} Name`,
                `Please enter a ${elementType} name that is at least 5 characters long.`)
            return false
            
        }
        // Validation: Check for duplicates based on element type
        if (elementType === 'project' && projectsManager) {
            const projectNames = projectsManager.list.map(p => p.name.toLowerCase())
            if (projectNames.includes(newName.toLowerCase())) {
                showError('Duplicate Name', `A project named "${newName}" already exists. Please choose a different name.`)
                return false
            }
        } else if (elementType === 'todo' && project) {
            const todoTitles = project.todoList.map(todo => todo.title.toLowerCase())
            if (todoTitles.includes(newName.toLowerCase())) {
                showError('Duplicate Name', `A todo issue title "${newName}" already exists. Please choose a different title`)
                return false
            }
        }
        return true
    }

    const showError = (title: string, message: string) => {
        setMessagePopUpContent({
            type: "error",
            title,
            message,
            actions: ["Got it"],
            onActionClick: {
                "Got it": () => setShowMessagePopUp(false)
            },
            onClose: () => setShowMessagePopUp(false)
        });
        setShowMessagePopUp(true);
    };


    const handleRename = () => {
        const newName = inputRef.current?.value.trim() || "";
        if (validateName(newName)) {
            onRename(newName);
        }
    }    

    return ReactDOM.createPortal (
        <>
            <div className="custom-backdrop" style={{ position: "fixed",zIndex:1500}} />
            <dialog className="popup-default"  style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1501}} open>
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
                                id="newElementName"
                                placeholder={previousElementName}
                                ref={inputRef}
                                autoFocus
                                required
                                minLength={5}
                                autoComplete="off"
                            />
                            <label className="toast-input-text" htmlFor="newElementName" >
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
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
        </>

    , document.body)
}
