import * as React from 'react';
import { Project } from '../classes/Project';



export function usePrepareToDoForm(project: Project) {


    React.useEffect(() => {
        const toDoIssueForm = document.getElementById("new-todo-form") as HTMLFormElement

        if (!toDoIssueForm) return
    
        // *** RESET THE FORM BEFORE OPEN IT***
        // 1. Target specific input types
        const inputsToReset = toDoIssueForm.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input[type="text"], input[type="date"], input[type="number"], textarea, select');

        // 2. Loop through and reset each element
        inputsToReset.forEach(element => {
            // Additional handling for select elements:
            if (element instanceof HTMLSelectElement) {
                element.selectedIndex = 0; // Reset to the first option
            } else {
                (element as HTMLInputElement).value = ''; // Reset to empty string
            }
        })

        //3.Reset list of users and tags
        const listsToReset = [
            document.getElementById("todo-tags-list"),
            document.querySelector("#todo-assignedUsers-list")
        ];

        listsToReset.forEach(list => {
            if (list) {
                while (list.firstChild) {
                    list.removeChild(list.firstChild);
                }
            }
        })
    
        // Update modal elements
        // const modalElements = {
        //     title: { id: "modal-todoIssue-title", text: "New To-Do Issue" },
        //     acceptBtn: { id: "accept-todo-btn", text: "Accept" },
        //     cancelBtn: { id: "cancel-todo-btn", text: "Cancel" }
        // };

        // Object.values(modalElements).forEach(({ id, text }) => {
        //     const element = document.getElementById(id);
        //     if (element) element.textContent = text;
        // })

    }, [project])
    /*
    //3.Delete de tags stored in the form
    const tagsListToReset = document.getElementById("todo-tags-list") as HTMLElement
    while (tagsListToReset.children.length > 0) {
        tagsListToReset.removeChild(tagsListToReset.children[0])
    }

    //4.Delete de assignedUsers stored in the form
    const assignedUsersListToReset = document.querySelector("#todo-assignedUsers-list") as HTMLElement
    while (assignedUsersListToReset.children.length > 0) {
        assignedUsersListToReset.removeChild(assignedUsersListToReset.children[0])
    }
    

    // 5.Set Modal in case previously we updated a To-Do Issue
    // Update Modal Title
    const modalToDoIssueTitle = document.getElementById("modal-todoIssue-title");
    if (modalToDoIssueTitle) {
        modalToDoIssueTitle.textContent = "New To-Do Issue";
    }
    // Update Button Text
    const submitButton = document.getElementById("accept-todo-btn");
    if (submitButton) {
        submitButton.textContent = "Accept";
    }
    const discardButton = document.getElementById("cancel-todo-btn");
    if (discardButton) {
        discardButton.textContent = "Cancel";
    }
    */

    /* Set the data-projectId attribute with the unique ID of the proyect in the button of submit new To-Do

    // Set the data-projectId attribute with the unique ID of the proyect in the button of submit new To-Do
    const projectToDoDatasetAttributeId = document.getElementById("accept-todo-btn")
    if (checkProjectId !== undefined && projectToDoDatasetAttributeId) {
        projectToDoDatasetAttributeId.dataset.projectId = checkProjectId.toString()
    }
    //Completed the data fixed for this new ToDoIssu as create date or Origin Project (Origin User sould be amended later)
    const todoProjectElement = document.querySelector('span[id="todo-project-name"]');
    const createDateElement = document.querySelector('span[id="todo-creation-date"]');
    

    if (checkProjectId) {
        const project = projectManager.getProject(checkProjectId)
        if (project && todoProjectElement) {
            todoProjectElement.textContent = project?.name; // Mostrar nombre del proyecto
        } else {
            console.error(`Project not found with ID ${checkProjectId} or todoProjectEleemnt is null`)
        }

        const currentDate = new Date()
        if (createDateElement) {
            createDateElement.textContent = currentDate.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).replace(/\//g, "-");
        } else {
            console.error("createDataElement is null")
        }

    }
    */
}    
//showModal("new-todo-card-modal")//**Old call to the Form**



