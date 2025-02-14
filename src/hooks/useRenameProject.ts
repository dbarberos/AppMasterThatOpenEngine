import * as React from 'react';
// import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'

import { MessagePopUp, MessagePopUpProps  } from '../react-components';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';

export const useRenameProject = (projectsManager: ProjectsManager) => {

    const [isRenaming, setIsRenaming] = React.useState(false);
    const [currentProjectName, setCurrentProjectName] = React.useState('')
    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)
    const [onRename, setOnRename] = React.useState<((newName: string) => void) | null>(null);

    const initiateRename = (projectName: string) => {
        setIsRenaming(true);
        setCurrentProjectName(projectName);
        
    };

    const handleProjectRename = (newProjectName: string) => {
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

        }else {

            setIsRenaming(false)
            onRename && onRename(newProjectName)
            setOnRename(() => { }) // Reset the callback
        }
    }
    
    const cancelRename = () => {
        setIsRenaming(false);
        setOnRename(() => { }) // Reset the callback
    };

return { isRenaming, initiateRename, currentProjectName,  handleProjectRename, cancelRename, setOnRename};
};