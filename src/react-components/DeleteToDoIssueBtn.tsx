import * as React from 'react'
import * as Router from 'react-router-dom';

import { TrashIcon } from './icons';
import { MessagePopUp, type MessagePopUpProps } from '../react-components'

import { deleteDocument, deleteToDoWithSubcollections } from '../services/firebase';

import { ToDoIssue } from '../classes/ToDoIssue'
import { ProjectsManager } from '../classes/ProjectsManager'

interface Props {
    //toDoIssueToBeDeleted: ToDoIssue
    projectId: string
    todoToBeDeleted: ToDoIssue
    onDeleteToDoIssue: (projectId: string, todoToBeDeletedId: string) => Promise<void>
    onClose: () => void
}

export function DeleteToDoIssueBtn({
    projectId,
    todoToBeDeleted,
    onDeleteToDoIssue,
    onClose
}: Props): JSX.Element {

    const navigateTo = Router.useNavigate()

    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)


    function handleDeleteToDoIssue(e: React.FormEvent) {
        e.preventDefault()
        console.log("Button delete project clicked")

        if (!todoToBeDeleted.id) {
            console.error("Not found project ID")
            return
        }

        setMessagePopUpContent({
            type: "warning",
            title: "Confirm TO-DO Deletion",
            message: `Are you sure you want to delete the TO-DO Issue: "${todoToBeDeleted.title }"?
                    All its contents will be deleted too.This action cannot be undone.`,
            actions: ["Delete", "Cancel"],
            onActionClick: {
                "Delete": async () => {
                    try {
                        // //Delete in the DB
                        // await deleteToDoWithSubcollections(projectId, todoToBeDeleted.id)
                        

                        // Remove from local state
                        await onDeleteToDoIssue(projectId, todoToBeDeleted.id)

                        // Close popup and details window
                        setShowMessagePopUp(false)
                        onClose()

                    } catch (error) {
                        console.error("Error deleting project:", error);
                        setMessagePopUpContent({
                            type: "error",
                            title: "Error Deleting TO-DO Issue",
                            message: "Failed to delete the TO-DOproject. Please try again.",
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
        })
        setShowMessagePopUp(true)
        e.preventDefault()
    }


    return (
        <>
        <button
                title="Delete To-Do"
                className="todo-icon-edit"
                onClick={handleDeleteToDoIssue}
                id="delete-todoIssue-btn"
                style={{
                    display: "flex",
                    borderRadius: "var(--br-circle)",
                    aspectRatio: 1,
                    padding: 0,
                    justifyContent: "center"
                }}
            >
                <TrashIcon size={30} className="todo-icon-edit" color="var(--color-fontbase)" />

            </button>
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
        </>
    )
}


//todoManager.onToDoIssuedeleted