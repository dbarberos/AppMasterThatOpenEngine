import React, { useState } from 'react'
import * as Router from 'react-router-dom';
import * as Firestore from 'firebase/firestore';


import { TrashIcon } from './icons';
import { MessagePopUp, MessagePopUpProps } from '../react-components'

import { deleteDocument } from '../services/Firebase';

import { ProjectsManager } from '../classes/ProjectsManager'
import { IProject, Project } from '../classes/Project';

interface Props {
    updateProject: Project
    projectsManager: ProjectsManager
}

export function DeleteProjectBtn({ updateProject, projectsManager }:Props): JSX.Element {

    const navigateTo = Router.useNavigate()
    const [showMessagePopUp, setShowMessagePopUp] = useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = useState<MessagePopUpProps | null>(null)


    projectsManager.onProjectDeleted = async (name) => {
        await deleteDocument("/projects", name)
        navigateTo("/")
    }


    function handleDeleteProject(e: React.FormEvent) {
        e.preventDefault()
        console.log("Button delete project clicked")
        
        if (updateProject.id) {
            if (updateProject.todoList.length > 0) {
                // Project has To-Do issues, show confirmation popup
                setMessagePopUpContent({
                    type: "warning",
                    title: "The project has pending task to be resolved",
                    message: `This project has <span style="color: var(--color-warning2)">${updateProject.todoList.length}</span> associated To-Do issues. Are you sure you want to delete it? This action cannot be undone`,
                    actions: ["Delete anyway", "Cancel"],
                    onActionClick: {
                        "Delete anyway": () => {
                            updateProject.id && projectsManager.deleteProject(updateProject.id)
                            setShowMessagePopUp(false)
                        },
                        "Cancel": () => {
                            console.log("Delete project cancelled");
                            setShowMessagePopUp(false)
                        }
                    },
                    onClose: () => setShowMessagePopUp(false)
                })
                setShowMessagePopUp(true)
                e.preventDefault()
                return

            } else {
                // Project hasn´t got To-Do issues, proceed with the options for deletion
                // Create and show the MessagePopUp for confirmation
                setMessagePopUpContent({
                    type: "warning",
                    title: "Confirm Project Deletion",
                    message: `Are you sure you want to delete the project: "${updateProject.name}".All its contents will be deleted too. This action cannot be undone.`,
                    actions: ["Yes,go on", "Cancel"],
                    onActionClick: {
                        "Yes,go on": () => {
                            if (!updateProject) {
                                console.error("Not found project ID")
                                return
                            } 
                            updateProject.id && projectsManager.deleteProject(updateProject.id)
                        },
                        "Cancel": () => {
                            console.log("Delete project cancelled")
                        }
                    },
                    onClose: () => setShowMessagePopUp(false)
                })
                setShowMessagePopUp(true)
                e.preventDefault()
                return
            }

        } else {
            console.error("Not found project ID")
        }
    }

    return (
        <>
            <button
                id="delete-project-btn"
                type="button"
                className="message-btn todo-icon-edit"
                onClick={handleDeleteProject}
                style={{
                    borderRadius: "var(--br-circle)",
                    padding: "0px",
                    justifyContent: "center"
                }}
            >
            <TrashIcon size={30} color="var(--color-fontbase)" className="todo-icon-edit"/>
            </button>
            {showMessagePopUp && messagePopUpContent && ( <MessagePopUp {...messagePopUpContent} />)}
            </>
    )
}

