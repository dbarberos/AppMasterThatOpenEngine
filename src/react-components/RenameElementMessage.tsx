import * as React from 'react';

import { RenameIcon } from '../react-components/icons';
import { MessagePopUp, MessagePopUpProps } from '../react-components';

import { ProjectsManager } from '../classes/ProjectsManager';

interface RenameElementMessageProps {
    projectsManager: ProjectsManager
    elementTitle: string
    previousElementName: string;
    onRename: (newName: string) => void;
    onCancel: () => void;
}

export function RenameElementMessage({ projectsManager, elementTitle, previousElementName, onRename , onCancel }: RenameElementMessageProps) {

    const inputRef = React.useRef<HTMLInputElement>(null);

    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)



    const handleProjectRename = () => {
        const newProjectName = inputRef.current?.value.trim() || ""
        const projectNames = projectsManager.list.map(project => project.name);

        // Basic validation: Check if the name is empty
        if (newProjectName.trim() === "") {
            // Show an error message
            setMessagePopUpContent({
                type: "error",
                title: `A project with a empty name is not allow`,
                message: `Please enter a valid project name.`,
                actions: ["Got it"],
                onActionClick: {
                    "Got it": () => {
                        // Close the message pop-up
                        setShowMessagePopUp(false)
                    }
                },
                onClose: () => setShowMessagePopUp(false)
            })
            setShowMessagePopUp(true)
            return
        }
        if (newProjectName.length < 5) {
            // Show an error message
            setMessagePopUpContent({
                type: "error",
                title: `Invalid Project Name`,
                message: "Please enter a project name that is at least 5 characters long.",
                actions: ["Got it"],
                onActionClick: {
                    "Got it": () => {
                        // Close the message pop-up
                        setShowMessagePopUp(false)
                    }
                },
                onClose: () => setShowMessagePopUp(false)
            })
            setShowMessagePopUp(true)
            
            return
        }
        // Validation: Check if the new name is not in use
        const existingProject = projectNames.find(existingName => existingName.toLowerCase() === newProjectName.toLowerCase())

        // Update the project name
        if (existingProject) {
            setMessagePopUpContent({
                type: "error",
                title: "Duplicate Name",
                message: `A project named "${newProjectName}" already exists. Please choose a different name.`,
                actions: ["Got it"],
                onActionClick: {
                    "Got it": () => {
                        // Close the message pop-up
                    }
                },
                onClose: () => setShowMessagePopUp(false)
            })
            setShowMessagePopUp(true)
            return

        } else {
            //Create a new project with the new name
            
            onRename && onRename(newProjectName)
            // setOnRename(() => { }) // Reset the callback
        }
    }


    const cancelRename = () => {
        onCancel && onCancel()
        //setOnRename(() => { }) // Reset the callback
    };



    

    return (
        <>
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
                    <button className="message-btn" type="button" id="confirmRename" onClick={handleProjectRename}>
                        <span className="message-btn-text">Do it</span>
                    </button>
                    <button className="message-btn" type="button" id="cancelRename" onClick={cancelRename}>
                        <span className="message-btn-text">Cancel</span>
                    </button>
                </div>
            </div>
        </dialog>
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
        </>

    )
}
