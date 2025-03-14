import * as React from 'react'
import * as Router from 'react-router-dom';


import { TrashIcon } from './icons';
import { MessagePopUp, type MessagePopUpProps } from '../react-components'

import { deleteDocument, deleteProjectWithSubcollections } from '../services/firebase';

import { ProjectsManager } from '../classes/ProjectsManager'
import { IProject, Project } from '../classes/Project';

interface Props {
    updateProject: Project
    projectsManager: ProjectsManager
}

export function DeleteProjectBtn({ updateProject, projectsManager }: Props): JSX.Element {

    const navigateTo = Router.useNavigate()
    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)


    // projectsManager.onProjectDeleted = async (name) => {
    //     await deleteDocument("/projects", name)
    //     navigateTo("/")
    // }

    // projectsManager.onProjectDeleted = async (projectId: string) => {
    //     try {
    //         await deleteProjectWithSubcollections(projectId);            
    //     } catch (error) {
    //         console.error("Error in onProjectDeleted:", error);
    //         setMessagePopUpContent({
    //             type: "error",
    //             title: "Error Deleting Project",
    //             message: "Failed to delete project. Please try again.",
    //             actions: ["Ok"],
    //             onActionClick: {
    //                 "Ok": () => setShowMessagePopUp(false)
    //             },
    //             onClose: () => setShowMessagePopUp(false)
    //         });
    //         setShowMessagePopUp(true);
    //     }
    // }


    function handleDeleteProject(e: React.FormEvent) {
        e.preventDefault()
        console.log("Button delete project clicked")

        if (!updateProject.id) {
            console.error("Not found project ID")
            return
        }

        const confirmConfig = {
            type: "warning" as const,
            title: "Confirm Project Deletion",
            message: updateProject.todoList.length > 0
                ?
                <>
                    This project has <span style={{ color: 'var(--color-warning2)' }}>
                        {updateProject.todoList.length}
                    </span> associated To-Do issues, pending to be resolved. Are you sure you want to delete it?
                    This action cannot be undone.
                </>
                :
                <>
                    `Are you sure you want to delete the project: "${updateProject.name}"?
                    All its contents will be deleted too. This action cannot be undone.`
                </>,
            actions: ["Delete", "Cancel"],
            onActionClick: {
                "Delete": async () => {
                    try {
                        //Delete in the DB
                        await deleteProjectWithSubcollections(updateProject.id!)
                        //update projectsManager. Here is the onDeletedProject method
                        projectsManager.deleteProject(updateProject.id!)
                        setShowMessagePopUp(false)
                        navigateTo('/')

                    } catch (error) {
                        console.error("Error deleting project:", error);
                        setMessagePopUpContent({
                            type: "error",
                            title: "Error Deleting Project",
                            message: "Failed to delete project. Please try again.",
                            actions: ["Ok"],
                            onActionClick: {
                                "Ok": () => setShowMessagePopUp(false)
                            },
                            onClose: () => setShowMessagePopUp(false)
                        });
                    }
                },
                "Cancel": () => {
                    console.log("Delete project cancelled");
                    setShowMessagePopUp(false)
                }
            },
            onClose: () => setShowMessagePopUp(false)
        }


        setMessagePopUpContent(confirmConfig)
        setShowMessagePopUp(true)
        e.preventDefault()





        // if (updateProject.todoList.length > 0) {
        //     // Project has To-Do issues, show confirmation popup
        //     setMessagePopUpContent({
        //         ...confirmConfig,
        //         actions: ["Delete", "Cancel"],
        //         onActionClick: {
        //             "Delete": async () => {
        //                 try {
        //                     await deleteProjectWithSubcollections(updateProject.id!)
        //                     //update projectsManager. Here is the onDeletedProject method
        //                     projectsManager.deleteProject(updateProject.id!)
        //                     setShowMessagePopUp(false)
        //                 } catch (error) {
        //                     console.error("Error deleting project:", error);
        //                     setMessagePopUpContent({
        //                         type: "error",
        //                         title: "Error Deleting Project",
        //                         message: "Failed to delete project. Please try again.",
        //                         actions: ["Ok"],
        //                         onActionClick: {
        //                             "Ok": () => setShowMessagePopUp(false)
        //                         },
        //                         onClose: () => setShowMessagePopUp(false)
        //                     });                            
        //                 }
        //             },
        //             "Cancel": () => {
        //                 console.log("Delete project cancelled");
        //                 setShowMessagePopUp(false)
        //             }
        //         },
        //         onClose: () => setShowMessagePopUp(false)
        //     })
        //     setShowMessagePopUp(true)
        //     e.preventDefault()
        //     return

        // } else {
        //     // Project hasn´t got To-Do issues, proceed with the options for deletion
        //     // Create and show the MessagePopUp for confirmation
        //     setMessagePopUpContent({
        //         type: "warning",
        //         title: "Confirm Project Deletion",
        //         message: `Are you sure you want to delete the project: "${updateProject.name}".All its contents will be deleted too. This action cannot be undone.`,
        //         actions: ["Yes,go on", "Cancel"],
        //         onActionClick: {
        //             "Yes,go on": () => {
        //                 if (!updateProject) {
        //                     console.error("Not found project ID")
        //                     return
        //                 }
        //                 updateProject.id && projectsManager.deleteProject(updateProject.id)
        //             },
        //             "Cancel": () => {
        //                 console.log("Delete project cancelled")
        //             }
        //         },
        //         onClose: () => setShowMessagePopUp(false)
        //     })
        //     setShowMessagePopUp(true)
        //     e.preventDefault()
        //     return
        // }
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
                <TrashIcon size={30} color="var(--color-fontbase)" className="todo-icon-edit" />
            </button>
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
        </>
    )
}

