import { IProject, ProjectStatus, UserRole, BusinessUnit, Project } from "./classes/Project";
import { IToDoIssue, ToDoIssue } from "./classes/ToDoIssue"
import { ProjectsManager } from "./classes/ProjectsManager";
import { showModal, closeModal, toggleModal, changePageContent } from "./classes/UiManager";
import "./classes/HTMLUtilities.ts";
import "./classes/LightMode.ts";
import { MessagePopUp } from "./classes/MessagePopUp"
import { newToDoIssue } from "./classes/ToDoManager"


import { DragAndDrop } from '@formkit/drag-and-drop';

const projectListUI = document.getElementById("project-list") as HTMLElement 
ProjectsManager.setContainer(projectListUI)
const projectManager = ProjectsManager.getInstance()


//Set the initial view of the APP with the projects page, hidding the rest of sections
document.addEventListener('DOMContentLoaded', () => {
    changePageContent('project-page', 'block'); 
});

// Create a new project from de button
const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn) {

    newProjectBtn.addEventListener("click", () => {
        showModal("new-project-modal")

         const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
        if (projectForm) {

            // *** RESET THE FORM ***
            // 1. Target specific input types
            const inputsToReset = projectForm.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], textarea, select');

            // 2. Loop through and reset each element
            inputsToReset.forEach(element => {
                (element as HTMLInputElement).value = ''; // Reset to empty string

                // Additional handling for select elements:
                if (element instanceof HTMLSelectElement) {
                    element.selectedIndex = 0; // Reset to the first option
                }
            });
        }

        // Set Modal in case previously we updated a project
        // Update Modal Title
        const modalProjectTitle = document.getElementById("modal-project-title");
        if (modalProjectTitle) {
            modalProjectTitle.textContent = "New Project";
        }
        // Update Button Text and remove dataset -projectID from it
        const submitButton = document.getElementById("accept-project-btn");
        if (submitButton) {
            submitButton.textContent = "Accept"
            submitButton.dataset.projectId= ""
        }

        const discardButton = document.getElementById("cancel-project-btn");
        if (discardButton) {
            discardButton.textContent = "Cancel";
        }
        //Remove the delete project button from the modal in case previously we updated a prject
        const parentDeleteBtn = document.getElementById("titleModalNewProject")
        if (parentDeleteBtn) {
            const deleteButton = document.getElementById("delete-project-btn")
            if (deleteButton) {
                parentDeleteBtn.removeChild(deleteButton)
            }
        }
        
    })
    
} else {
    console.warn("New project button was not found")
}


//Obtaining data project from the form via giving an id to the form and using FormData
const projectForm = document.getElementById("new-project-form")
const cancelForm: Element | null = document.getElementById("cancel-project-btn");
const submitFormButton = document.getElementById("accept-project-btn")

if (projectForm && projectForm instanceof HTMLFormElement) {
    
    // projectForm.addEventListener("submit", (event) => {
    submitFormButton?.addEventListener("click", (e) => {
        e.preventDefault()
        const formData = new FormData(projectForm)
        const checkProjectID = submitFormButton?.dataset.projectId

        if (projectForm.checkValidity()) {

            // Form is valid, proceed with data processing
            if (!checkProjectID) {
                //When the form is for a new Project

                // *** Get the finishDate from the form data ***
                let finishProjectDate: Date | null = null // Allow null initially
                const finishProjectDateString = formData.get("finishDate") as string
                // Try to create a Date object, handling potential errors
                if (finishProjectDateString) {
                    finishProjectDate = new Date(finishProjectDateString)
                    // Check if the Date object is valid
                    if (isNaN(finishProjectDate.getTime())) {
                        // Handle invalid date input (e.g., show an error message)
                        console.error("Invalid date input:", finishProjectDateString);
                        finishProjectDate = null; // Reset to null if invalid
                    }
                }
                // Set to current date if no valid date was provided
                if (!finishProjectDate) {
                    finishProjectDate = new Date("2026-12-31"); // Create a new Date object for today
                }
                // Now you can safely use finishProjectDate as a Date object


                const projectDetails: IProject = {
                    name: formData.get("name") as string,
                    acronym: formData.get("acronym") as string,
                    businessUnit: BusinessUnit[formData.get("businessUnit") as keyof typeof BusinessUnit],
                    description: formData.get("description") as string,
                    status: formData.get("status") as ProjectStatus,
                    userRole: formData.get("userRole") as UserRole,
                    finishDate: finishProjectDate,
                    cost: formData.get("cost") ? parseFloat(formData.get("cost") as string) : 0,
                    

                };

                try {
                    const project = projectManager.newProject(projectDetails);
                    projectForm.reset()
                    closeModal("new-project-modal")
                } catch (err) {
                    const errorPopUp = document.querySelector(".message-popup")
                    const contentError = {
                        contentDescription: err.message,
                        contentTitle: "Error",
                        contentClass: "popup-error",
                        contentIcon: "report"
                    }
                    if (err) {
                        const text = document.querySelector("#message-popup-text p")
                        text.textContent = contentError.contentDescription
                        const title = document.querySelector("#message-popup-text h5")
                        title.textContent = contentError.contentTitle
                        const icon = document.querySelector("#message-popup-icon span")
                        icon.textContent = contentError.contentIcon
                        errorPopUp?.classList.add(contentError.contentClass)
                        toggleModal("message-popup")
                    }
                    const closePopUp: Element | null = document.querySelector(".btn-popup")
                    if (closePopUp) {
                        const closePopUpHandler = () => {
                            toggleModal("message-popup");
                            closePopUp.removeEventListener("click", closePopUpHandler);
                        }
                        closePopUp.addEventListener("click", closePopUpHandler);
                    }
                }

            } else {
                //When the form is for update an existing Project

                console.log("Button submit clicked in the edit project mode");
                e.preventDefault()

                // Get the project ID from the data attribute
                const projectFormId = (e.currentTarget as HTMLElement).closest('[data-project-id]') as HTMLElement
                console.log("Button with the ID selected");

                if (projectFormId) {
                    const projectIdNumber = projectFormId.dataset.projectId
                    if (projectIdNumber) {
                        // You now have the project ID!
                        console.log("Saving project with ID:", projectIdNumber);
                        
                        // Get all the data from the Form. The data to be updated and the others.
                        const formDataToUpdate = new FormData(projectForm)

                        // *** Get the finishDate from the form data ***
                        let finishProjectDate: Date | null = null // Allow null initially
                        const finishProjectDateString = formDataToUpdate.get("finishDate") as string
                        // Try to create a Date object, handling potential errors
                        if (finishProjectDateString) {
                            finishProjectDate = new Date(finishProjectDateString)
                            // Check if the Date object is valid
                            if (isNaN(finishProjectDate.getTime())) {
                                // Handle invalid date input (e.g., show an error message)
                                console.error("Invalid date input:", finishProjectDateString);
                                finishProjectDate = null; // Reset to null if invalid
                            }
                        }
                        const projectToUpdate = projectManager.getProject(projectIdNumber) as Project

                        const projectDetailsToUpdate: Project = {
                            name: formDataToUpdate.get("name") as string,
                            acronym: formDataToUpdate.get("acronym") as string,
                            businessUnit: BusinessUnit[formDataToUpdate.get("businessUnit") as keyof typeof BusinessUnit],
                            description: formDataToUpdate.get("description") as string,
                            status: formDataToUpdate.get("status") as ProjectStatus,
                            userRole: formDataToUpdate.get("userRole") as UserRole,
                            finishDate: finishProjectDate as Date,
                            cost: formDataToUpdate.get("cost") ? parseFloat(formDataToUpdate.get("cost") as string) : 0,
                            id: projectIdNumber as string,
                            ui: projectManager.updateProjectUi(projectToUpdate) as HTMLDivElement,
                            progress: projectToUpdate.progress as number,
                            todoList: projectToUpdate.todoList,
                        }
                        projectDetailsToUpdate.backgroundColorAcronym = Project.calculateBackgroundColorAcronym(projectDetailsToUpdate.businessUnit)
                        
                        
                        if (projectToUpdate) {
                            let changesInProject = projectManager.getChangedProjectDataForUpdate(projectToUpdate, projectDetailsToUpdate)
                            // Check if there are any changes
                            if (Object.keys(changesInProject).length > 0) {
                                // Construct the message for using later in the MessagePopUp
                                let messageContent = `The following project details will be updated in the project:<br><br>
                                <table style="width:100%; border-collapse: collapse;">
                                    <tr>
                                        <th style="border-bottom: 1px solid #ccc;">Property</th>
                                        <th style="border-bottom: 1px solid #ccc;">Changes</th>
                                    </tr>                            
                                `
                                for (const key in changesInProject) {
                                    messageContent += `
                                        <tr>
                                            <td style="border-bottom: 1px solid #ccc;"><b>${key}</b></td>
                                            <td style="border-bottom: 1px solid #ccc; line-height: 1.5; border-spacing 0 10px;">
                                                From: <i>${changesInProject[key][0]}</i><br>
                                                To: <i style="color: var(--popup-warning);">${changesInProject[key][1]}</i>
                                            </td>
                                        </tr>
                                    `
                                }
                                messageContent += `</table>`

                                // Calculate the number of rows in the messageContent table
                                const messageRowsCount = messageContent.split("<tr>").length
                                // Calculate the desired message height
                                const messageHeight = `calc(${messageRowsCount} * 3.5rem + 5rem)`


                                // Create and show the MessagePopUp and show the message above
                                const updateConfirmationPopup = new MessagePopUp(
                                    document.body,
                                    "info",
                                    "Confirm Project Update",
                                    messageContent,
                                    ["Confirm update", "Cancel"],
                                    messageHeight
                                );

                                // Define button callbacks
                                const buttonCallbacks = {
                                    "Confirm update": () => {

                                        // You don need anymore the project ID! delete from the form button
                                        projectFormId.dataset.projectId = ""

                                        // User confirmed, proceed with updating the project
                                        console.log("User confirmed the update. Proceed with saving changes.");
                                        const updatedProject = projectManager.updateProject(projectIdNumber, projectDetailsToUpdate);
                                        console.log(updatedProject);

                                        // Update the UI to reflect the changes
                                        if (updatedProject) {
                                            projectToUpdate.ui = projectManager.updateProjectUi(projectToUpdate);
                                        }
                                        //Render again the list of projects with the new data uddated
                                        projectManager.renderProjectList()


                                        projectForm.reset()
                                        changesInProject = {}
                                        
                                        updateConfirmationPopup.closeMessageModal();
                                        closeModal("new-project-modal"); // Close the edit form modal
                                        console.log("Project updated", updatedProject)
                                        console.log(projectManager.list)

                                    },
                                    "Cancel": () => {
                                        // User cancelled, do nothing or provide feedback
                                        console.log("User cancelled the update.");
                                        changesInProject = {}
                                        updateConfirmationPopup.closeMessageModal();
                                    }
                                };

                                updateConfirmationPopup.showNotificationMessage(buttonCallbacks);
                            } else {
                                // No changes detected, show a new MessagePopUp with this information
                                const noChangesPopup = new MessagePopUp(
                                    document.body,
                                    "info",
                                    "No Changes Detected",
                                    "No changes were detected in the project details. Sorry there is nothing to update.",
                                    ["Got it"]
                                );

                                // Define button callback
                                const buttonCallbacks = {
                                    "Got it": () => {
                                        noChangesPopup.closeMessageModal();
                                        console.log("No changes to update in the project.");
                                    }
                                }
                                
                                noChangesPopup.showNotificationMessage(buttonCallbacks);
                                
                            }
                        }
                    }
                } else {
                    console.log("No Element found with retrieved ID data ");
                }
            }
        } else {

            // Form is invalid, let the browser handle the error display
            projectForm.reportValidity()
        }



    })       

    if (cancelForm) {
        cancelForm.addEventListener("click", (e) => {
            e.preventDefault()
            projectForm.reset()
            // Delete the data-projectId attribute with the unique ID of the proyect in the button of "Save Changes"
            const projectDatasetAttributeIdInForm = document.getElementById("accept-project-btn")
            if (projectDatasetAttributeIdInForm) {
                projectDatasetAttributeIdInForm.dataset.projectId = ""
            }
            toggleModal("new-project-modal")
        })
    } else {
        console.log("The cancel button was not found. Check the ID!")
    }
    
}


// Export projects to a JSON
document.addEventListener("DOMContentLoaded", () => {
    const exportProjectsBtn = document.getElementById("export-projects-JSON-btn")
    if (exportProjectsBtn) {
        exportProjectsBtn.addEventListener("click", () => {
            projectManager.exprtToJSON()
        })
    } else {
        console.log("The export button was not found. Check the ID!")
    }
})

// Import projects from a JSON
document.addEventListener("DOMContentLoaded", () => {
    const importProjectsBtn = document.getElementById("import-projects-JSON-btn")
    if (importProjectsBtn) {
        importProjectsBtn.addEventListener("click", () => {
            projectManager.imprtFromJSON()
        })
    } else {
        console.log("The import button was not found. Check the ID!")
    }
})
    
//Main button of project(aside) return to the projects list
const btnMainProjects = document.querySelector("#asideBtnProjects")
btnMainProjects?.addEventListener("click", (e) => {
    e.preventDefault()
    changePageContent("project-page", "flex")

})

//Button for editing Project Details.
const btnEditProjectDetails = document.querySelector("#edit-project-details")
if (btnEditProjectDetails) {
    btnEditProjectDetails?.addEventListener("click", (e) => {
        console.log("Button edit project details clicked");
        e.preventDefault()

        // Get the project ID from the data attribute
        const projectCardId = (e.currentTarget as HTMLElement).closest('[data-project-id]') as HTMLElement
        console.log("Div with the ID selected");
        
        if (projectCardId) {
            const projectId = projectCardId.dataset.projectId
        
            if (projectId) {
                // You now have the project ID!
                console.log("Editing project with ID:", projectId);

                // Fetch the project data using the ID and the funtion getProject inside ProjectsManager class
                const projectToEdit = projectManager.getProject(projectId);
                if (projectToEdit) {
                    console.log("Project to edit", projectToEdit);
                    
                    // Populate the form fields with project data
                    projectManager.populateProjectDetailsForm(projectToEdit)
                    // Populate the form fields with projectToEdit data
                    // ... your existing form population logic ...
                    console.log("Form populated", document.getElementById("new-project-form"));
                    

                    showModal("new-project-modal")
                    console.log("Showed Modal Windows:", document.getElementById("new-project-modal"));
                    
                    // Set Edit Mode
                    // Update Modal Title                    
                    const modalProjectTitle = document.getElementById("modal-project-title");
                    if (modalProjectTitle) {
                        modalProjectTitle.textContent = "Update Project";
                    }

                    // Update Button Text
                    const submitButton = document.getElementById("accept-project-btn");
                    if (submitButton) {
                        submitButton.textContent = "Save Changes";
                    }
                    const discardButton = document.getElementById("cancel-project-btn");
                    if (discardButton) {
                        discardButton.textContent = "Discard Changes";
                    }

                    //Create delete-project button                    
                    
                    // Comprobar si ya existe un botón de borrar proyecto
                    const existingDeleteButton = document.getElementById("delete-project-btn");
                    if (!existingDeleteButton) {

                        //Create delete-project button

                        const parentDeleteBtn = document.getElementById("titleModalNewProject")

                        const deleteProjectButton = document.createElement("button");
                        deleteProjectButton.className = "message-btn";
                        deleteProjectButton.type = "button";
                        deleteProjectButton.setAttribute("id", "delete-project-btn");
                        deleteProjectButton.className = "todo-icon-edit";
                        deleteProjectButton.style.borderRadius = "var(--br-circle)"
                        deleteProjectButton.style.aspectRatio = "1"
                        deleteProjectButton.style.padding = "0px"
                        deleteProjectButton.style.justifyContent = "center"

                        const svgTrash = document.createElement("svg");
                        const deleteButtonIconSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        deleteButtonIconSVG.setAttribute("class", "todo-icon-edit");
                        deleteButtonIconSVG.setAttribute("role", "img");
                        deleteButtonIconSVG.setAttribute("aria-label", "trash");
                        deleteButtonIconSVG.setAttribute("width", "30px");
                        deleteButtonIconSVG.setAttribute("height", "30px");
                        deleteButtonIconSVG.setAttribute("fill", "#08090a");
                        deleteButtonIconSVG.setAttribute("id", "delete-project-btn-svg");
                        deleteProjectButton.appendChild(deleteButtonIconSVG);

                        const deleteButtonIconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                        deleteButtonIconUse.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#trash");
                        deleteButtonIconUse.setAttributeNS("http://www.w3.org/2000/svg", "xlink:href", "#trash");
                        deleteButtonIconSVG.appendChild(deleteButtonIconUse);
            
                        parentDeleteBtn?.appendChild(deleteProjectButton)


                        //    Set the data-projectId attribute with the unique ID of the proyect in the button of "Delete Project"
                        deleteProjectButton.dataset.projectId = projectId.toString()
            

                
                        // const deleteProjectBtn = document.getElementById("delete-project")
                        // if (deleteProjectBtn) {
                        //     deleteProjectBtn.style.display = 'flex'
                        
                    }

                    //Call the function for delete the project only when the btn is clicked
                    const deleteProjectBtn = document.getElementById("titleModalNewProject")

                    if (deleteProjectBtn) {
                        console.log("eventListenind os the delete Project Btn")
                        deleteProjectBtn.addEventListener("click", handleTitleClick);
                    } else {
                        console.error("Delete project button was not found")
                    }
                            
                    
                    

                    // Set the data-projectId attribute with the unique ID of the proyect in the button of "Save Changes"
                    const projectDatasetAttributeIdInForm = document.getElementById("accept-project-btn")
                    if (projectDatasetAttributeIdInForm) {
                        projectDatasetAttributeIdInForm.dataset.projectId = projectId.toString()
                    }
                } else {
                    console.error("Project not found!");
                }
            }
        } else {
            console.error("Project ID not found on the clicked element!");
        }
    })
} else {
    console.warn("Edit project button was not found")
}

function handleTitleClick(event: Event) {
        //Event Delegation: The handleModalClick function now handles clicks on the modal.It uses targetElement.closest('#delete-project-btn-svg') to check if the click originated from the "Delete Project" button or any of its parent elements.
        //Efficiency: With event delegation, you only have one event listener attached to the modal, even if you dynamically add or remove multiple "Delete Project" buttons.

    const targetElement = event.target as HTMLElement

    // Check if the clicked element (or any of its parents) has the ID "delete-project-btn-svg"
    if (targetElement.closest('#delete-project-btn-svg')) {
        handleDeleteProjectButtonClick(event);
    }
}


//

function handleDeleteProjectButtonClick(e: Event) {
    e.preventDefault()
    console.log("Button delete project clicked")

    //Get the button element from the event
    const deleteProjectBtn = (e.target as HTMLElement).closest("#delete-project-btn")

    if (deleteProjectBtn) {
        // Check if the project's todoList is empty    
        const projectIdToDelete = (deleteProjectBtn as HTMLElement)?.dataset.projectId
        console.log("projectId:", projectIdToDelete)
        if (projectIdToDelete) {
            const projectToDelete = projectManager.getProject(projectIdToDelete);
        
            if (projectToDelete) {
                if (projectToDelete.todoList.length > 0) {
                    // Project has To-Do issues, show confirmation popup
                    const popupDeleteProjectConfirmationWithToDoIssues = new MessagePopUp(
                        document.body,
                        "warning",
                        "The Project has pending tasks to be resolved",
                        `This project has <span style="color: var(--color-warning2)">${projectToDelete.todoList.length}</span> associated To-Do issues. Are you sure you want to delete it? This action cannot be undone`,
                        ["Delete anyway", "Cancel"]
                    )
                    //Define button callbacks
                    const buttonCallbacks = {
                        "Delete anyway": () => {
                            console.log("User confirmed deletion even with tasks")
                            projectManager.deleteProject(projectIdToDelete)
                            //Remove the delete project button from the modal
                            if (deleteProjectBtn.parentElement) {
                                deleteProjectBtn.parentElement.removeChild(deleteProjectBtn)
                            }
                            // Close the modals
                            popupDeleteProjectConfirmationWithToDoIssues.closeMessageModal();
                            closeModal("new-project-modal"); // Close the edit form modal

                            // Update the UI (re-render project list)
                            projectManager.renderProjectList()
                            console.log(projectManager.list)

                            // Open project-page
                            changePageContent("project-page", "flex")
                        },
                        "Cancel": () => {
                            // User cancelled, close the popup and do nothing
                            console.log("User cancelled the deletion.");
                            popupDeleteProjectConfirmationWithToDoIssues.closeMessageModal();
                        }
                    }
                    popupDeleteProjectConfirmationWithToDoIssues.showNotificationMessage(buttonCallbacks);
                } else {
                    // Project hasn´t got To-Do issues, proceed with the options for deletion
                    // Create and show the MessagePopUp for confirmation
                    const popupDeleteProjectConfirmation = new MessagePopUp(
                        document.body,
                        "warning",
                        "Confirm Project Deletion",
                        `Are you sure you want to delete the project: "${projectToDelete.name}"? This action cannot be undone.`,
                        ["Yes,go on", "Cancel"],
                    )

                    // Define button callbacks
                    const buttonCallbacks = {
                        "Yes,go on": () => {
                            // User confirmed, proceed with deleting the project
                            console.log("User confirmed the deletion. Proceed with deleting the project.")
                            projectManager.deleteProject(projectIdToDelete)

                            //Remove the delete project button from the modal
                            if (deleteProjectBtn.parentElement) {
                                deleteProjectBtn.parentElement.removeChild(deleteProjectBtn)
                            }

                            // Close the modals
                            popupDeleteProjectConfirmation.closeMessageModal();
                            closeModal("new-project-modal"); // Close the edit form modal

                            // Update the UI (re-render project list)
                            projectManager.renderProjectList()
                            console.log(projectManager.list)

                            // Open project-page
                            changePageContent("project-page", "flex")
                        },
                        "Cancel": () => {
                            // User cancelled, do nothing or provide feedback
                            console.log("User cancelled the deletion.");
                            popupDeleteProjectConfirmation.closeMessageModal();
                        }
                    }
                    popupDeleteProjectConfirmation.showNotificationMessage(buttonCallbacks)
                }
            } else {
                console.error("Project not found for deletion!")
            }
        } else {
            console.error("Project Id not found")
        }
    } else {
        console.error("Delete project button was not found")
    }
} 


//Main button of To-Do Board(aside) open the To-Do Board
const btnToDoIssueBoard = document.querySelector("#asideBtnToDoBoards")
btnToDoIssueBoard?.addEventListener("click", (e) => {
    e.preventDefault()
    changePageContent("todo-page", "block")
})


// Create a new todo from only 1 buttons (in Details page)
const newToDoIssueBtn  = document.querySelector("#new-todo-issue-btn")

if (newToDoIssueBtn) {
    newToDoIssueBtn.addEventListener("click", () => {
        console.log("Button Clicked")

        const checkProjectId = (newToDoIssueBtn as HTMLElement)?.dataset.projectId ?? ""
        console.log(checkProjectId)
        const toDoIssueForm = document.getElementById("new-todo-form") as HTMLFormElement

        if (toDoIssueForm && toDoIssueForm instanceof HTMLFormElement) {

            // *** RESET THE FORM BEFORE OPEN IT***
            // 1. Target specific input types
            const inputsToReset = toDoIssueForm.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], textarea, select');

            // 2. Loop through and reset each element
            inputsToReset.forEach(element => {
                (element as HTMLInputElement).value = ''; // Reset to empty string

                // Additional handling for select elements:
                if (element instanceof HTMLSelectElement) {
                    element.selectedIndex = 0; // Reset to the first option
                }
            })

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
        }

        showModal("new-todo-card-modal")

        
    })
}

//Obtaining data from the form via giving an id to the form and using FormToDoData
const toDoIssueForm = document.getElementById("new-todo-form")
const cancelToDoForm: Element | null = document.getElementById("cancel-todo-btn");
const submitToDoFormButton = document.getElementById("accept-todo-btn")
newToDoIssueBtn

if (toDoIssueForm && toDoIssueForm instanceof HTMLFormElement) {

    const checkProjectId = submitToDoFormButton?.dataset.projectId

    submitToDoFormButton?.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("submitToDoFormButton press") 
        const formToDoData = new FormData(toDoIssueForm)
        console.log(formToDoData)
        const checkToDoId = (newToDoIssueBtn as HTMLButtonElement)?.dataset.toDoIssueDetails
        const checkProjectId = (newToDoIssueBtn as HTMLButtonElement)?.dataset.projectId
        console.log(checkToDoId)
        console.log(checkProjectId)
        
        if (toDoIssueForm.checkValidity()) {

            //Form is valid, proceed with data processing
            if (!checkToDoId) {
                //When the form is for a new To-Do Issue not an update

                // *** Get the dueDate from the form data ***
                let dueDateToDoForm: Date | null = null // Allow null initially
                const dueDateToDoFormString = formToDoData.get("dueDate") as string
                // Try to create a Date object, handling potential errors
                if (dueDateToDoFormString) {
                    dueDateToDoForm = new Date(dueDateToDoFormString)
                    // Check if the Date object is valid
                    if (isNaN(dueDateToDoForm.getTime())) {
                        // Handle invalid date input (e.g., show an error message)
                        console.error("Invalid date input:", dueDateToDoFormString);
                        dueDateToDoForm = null; // Reset to null if invalid
                    }
                }
                // Set to current date if no valid date was provided
                if (!dueDateToDoForm) {
                    dueDateToDoForm = new Date("2024-12-31"); // Create a new Date object for today
                }
                console.log(dueDateToDoFormString)
                // Now you can safely use finishProjectDate as a Date object

                // Get the tags from the tagsList element
                const tagsListElement = document.getElementById('todo-tags-list');
                const tags: string[] = [];
                if (tagsListElement) {
                    const tagElements = tagsListElement.querySelectorAll('li');
                    tagElements.forEach(tagElement => {
                        tags.push(tagElement.textContent || '');
                    });
                }
                console.log(tags)
                // Get the AssignedUsers from the assignedUsersList element
                const assignedUsersListElement = document.getElementById('todo-assignedUsers-list');
                const assignedUsers: string[] = [];
                if (assignedUsersListElement) {
                    const assignedUsersElements = assignedUsersListElement.querySelectorAll('li');
                    assignedUsersElements.forEach(assignedUserElement => {
                        assignedUsers.push(assignedUserElement.textContent || '');
                    });
                }
                console.log(assignedUsers)

                // Get the current Date as the Created Date
                const currentDate = new Date();


                const toDoIssueDetails: IToDoIssue = {
                    title: formToDoData.get("title") as string,
                    description: formToDoData.get("description") as string,
                    statusColumn: formToDoData.get("statusColumn") as string,
                    tags: tags,
                    assignedUsers: assignedUsers,
                    dueDate: dueDateToDoForm,
                    todoProject: checkProjectId as string,
                    createdDate: currentDate,
                    todoUserOrigin: formToDoData.get("todoUserOrigin") as string,
                }

                try {
                    if (checkProjectId) {
                        const toDoListInProject = projectManager.getToDoListForProject(checkProjectId)
                        const toDoIssue = newToDoIssue(checkProjectId, toDoListInProject, toDoIssueDetails)
                        toDoIssueForm.reset()

                        closeModal("new-todo-card-modal")

                        // Log the project details
                        const project = projectManager.getProject(checkProjectId);
                        console.log("Project details:", project);
                    
                    }

                } catch (err) {
                    const errorPopUp = document.querySelector(".message-popup")
                    const contentError = {
                        contentDescription: err.message,
                        contentTitle: "Error",
                        contentClass: "popup-error",
                        contentIcon: "report"
                    }
                    if (err) {
                        const text = document.querySelector("#message-popup-text p")
                        text.textContent = contentError.contentDescription
                        const title = document.querySelector("#message-popup-text h5")
                        title.textContent = contentError.contentTitle
                        const icon = document.querySelector("#message-popup-icon span")
                        icon.textContent = contentError.contentIcon
                        errorPopUp?.classList.add(contentError.contentClass)
                        toggleModal("message-popup")
                    }
                    const closePopUp: Element | null = document.querySelector(".btn-popup")
                    if (closePopUp) {
                        const closePopUpHandler = () => {
                            toggleModal("message-popup");
                            closePopUp.removeEventListener("click", closePopUpHandler);
                        }
                        closePopUp.addEventListener("click", closePopUpHandler);
                    }
                }
            }

        } else {
            // Form is invalid, let the browser handle the error display
            toDoIssueForm.reportValidity()

        }
    })

    if (cancelToDoForm) {
        cancelToDoForm.addEventListener("click", (e) => {
            e.preventDefault()
            toDoIssueForm.reset()
            // Delete the data-ToDoIssueId attribute with the unique ID of the ToDoIssue in the button of "Save Changes"
            const toDoIssueDatasetAttributeIdInForm = document.getElementById("accept-todo-btn")
            if (toDoIssueDatasetAttributeIdInForm) {
                toDoIssueDatasetAttributeIdInForm.dataset.projectId = ""
            }
            toggleModal("new-todo-card-modal")
        })
    } else {
        console.log("The cancel Button was not found")
    }

}
