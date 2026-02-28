import * as React from 'react'
import * as Router from 'react-router-dom';


import { TrashIcon } from './icons';
import { MessagePopUp, type MessagePopUpProps } from '../react-components'

import { deleteDocument, deleteProjectWithSubcollections } from '../services/Firebase';

import { ProjectsManager } from '../classes/ProjectsManager'
import { IProject, Project } from '../classes/Project';
import { STORAGE_KEY } from '../const';

interface Props {
    updateProject: Project
    projectsManager: ProjectsManager
}

export function DeleteProjectBtn({ updateProject, projectsManager }: Props): JSX.Element {

    const navigateTo = Router.useNavigate()
    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)



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
                "Delete": handleProjectDelete,
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

    const handleProjectDelete = async () => {
        try {
            // Delete from Firebase
            await deleteProjectWithSubcollections(updateProject.id!)

            // Delete from ProjectsManager
            projectsManager.deleteProject(updateProject.id!)

            // Update localStorage cache
            const cachedProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const updatedProjects = cachedProjects.filter(
                (project: Project) => project.id !== updateProject.id
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));

            console.log('Project deleted successfully:', {
                projectId: updateProject.id,
                remainingProjects: updatedProjects.length
            });

            setShowMessagePopUp(false)
            navigateTo('/', { replace: true })
            //window.location.reload() // Temporal reload in order to clean the state


            // La recarga de página(window.location.reload()) es una solución temporal.En una implementación ideal, deberías usar un estado global(como React Context o Redux) para propagar los cambios sin recargar.


        } catch (error) {
            console.error("Error deleting project:", error)
            setMessagePopUpContent({
                type: "error",
                title: "Error Deleting Project",
                message: "Failed to delete project. Please try again.",
                actions: ["Ok"],
                onActionClick: {
                    "Ok": () => setShowMessagePopUp(false)
                },
                onClose: () => setShowMessagePopUp(false)
            })
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
                <TrashIcon size={30} color="var(--color-fontbase)" className="todo-icon-edit" />
            </button>
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
        </>
    )
}

