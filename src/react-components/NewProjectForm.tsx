import React, { useState } from 'react';
import { useProjectsManager } from './ProjectsManagerContext';


import { BusinessUnit, IProject, Project, ProjectStatus, UserRole } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { closeModal, toggleModal } from '../classes/UiManager';
import { MessagePopUp } from '../classes/MessagePopUp';


interface NewProjectFormProps {
    onClose: () => void;
    projectsManager: ProjectsManager;
}


export function NewProjectForm({ onClose, projectsManager }: NewProjectFormProps) {
    //const projectsManager = useProjectsManager(); // Access projectsManager

    const handleClose = () => {
        onClose();
    };
        
    const handleNewProjectFormSubmit = (e: React.FormEvent) => {
        
        const projectForm = document.getElementById("new-project-form")
        const cancelForm: Element | null = document.getElementById("cancel-project-btn")
        const submitFormButton = document.getElementById("accept-project-btn")

        if (!(projectForm && projectForm instanceof HTMLFormElement)) { return }

        // submitFormButton?.addEventListener("click", (e) => {
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
                    todoList: []
                };

                try {
                    const project = projectsManager.newProject(projectDetails);
                    onCloseNewProjectForm(e)
                    // projectForm.reset()
                    // closeModal("new-project-modal")
                } catch (err) {
                    const errorPopUp = document.querySelector(".message-popup")
                    const contentError = {
                        contentDescription: err.message,
                        contentTitle: "Error",
                        contentClass: "popup-error",
                        contentIcon: "report"
                    }
                    if (errorPopUp) {
                        const text = errorPopUp.querySelector("#message-popup-text p")
                        const title = errorPopUp.querySelector("#message-popup-text h5")
                        const icon = errorPopUp.querySelector("#message-popup-icon span")

                        if (text) text.textContent = contentError.contentDescription
                        if (title) title.textContent = contentError.contentTitle
                        if (icon) icon.textContent = contentError.contentIcon

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
                        const projectToUpdate = projectsManager.getProject(projectIdNumber) as Project

                        const projectDetailsToUpdate =new Project ({
                            name: formDataToUpdate.get("name") as string,
                            acronym: formDataToUpdate.get("acronym") as string,
                            businessUnit: BusinessUnit[formDataToUpdate.get("businessUnit") as keyof typeof BusinessUnit],
                            description: formDataToUpdate.get("description") as string,
                            status: formDataToUpdate.get("status") as ProjectStatus,
                            userRole: formDataToUpdate.get("userRole") as UserRole,
                            finishDate: finishProjectDate as Date,
                            cost: formDataToUpdate.get("cost") ? parseFloat(formDataToUpdate.get("cost") as string) : 0,
                            // id: projectIdNumber as string,
                            // ui: projectsManager.updateProjectUi(projectToUpdate) as HTMLDivElement,
                            // progress: projectToUpdate.progress as number,
                            todoList: projectToUpdate.todoList,
                            // backgroundColorAcronym: Project.calculateBackgroundColorAcronym(BusinessUnit[formDataToUpdate.get("businessUnit") as keyof typeof BusinessUnit])
                        }) 
                        projectDetailsToUpdate.id = projectIdNumber as string
                        projectDetailsToUpdate.ui = projectsManager.updateProjectUi(projectToUpdate) as
                            HTMLDivElement
                        projectDetailsToUpdate.progress = projectToUpdate.progress as number
                        projectDetailsToUpdate.backgroundColorAcronym = Project.calculateBackgroundColorAcronym(projectDetailsToUpdate.businessUnit)
                        
                        
                        if (projectToUpdate) {
                            let changesInProject = projectsManager.getChangedProjectDataForUpdate(projectToUpdate, projectDetailsToUpdate)
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
                                                <div style="width: 95%; word-break: break-all; overflow: auto; scrollbar-width: none;">
                                                    From: <i>${changesInProject[key][0]}</i><br>
                                                    To: <i style="color: var(--popup-warning);">${changesInProject[key][1]}</i>
                                                </div
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
                                        const updatedProject = projectsManager.updateProject(projectIdNumber, projectDetailsToUpdate);
                                        console.log(updatedProject);

                                        // Update the UI to reflect the changes
                                        if (updatedProject) {
                                            projectToUpdate.ui = projectsManager.updateProjectUi(projectToUpdate);
                                        }
                                        //Render again the list of projects with the new data uddated
                                        projectsManager.renderProjectList()


                                        projectForm.reset()
                                        changesInProject = {}
                                        
                                        updateConfirmationPopup.closeMessageModal();
                                        closeModal("new-project-modal"); // Close the edit form modal
                                        console.log("Project updated", updatedProject)
                                        console.log(projectsManager.list)

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
        // }   
        
        onCloseNewProjectForm(e);
    }



    const onCloseNewProjectForm = (e: React.FormEvent) => {
        const projectForm = document.getElementById("new-project-form") as HTMLFormElement
        e.preventDefault()
            projectForm.reset()
            // Delete the data-projectId attribute with the unique ID of the proyect in the button of "Save Changes"
            const projectDatasetAttributeIdInForm = document.getElementById("accept-project-btn")
            if (projectDatasetAttributeIdInForm) {
                projectDatasetAttributeIdInForm.dataset.projectId = ""
            }
        //toggleModal("new-project-modal");
        onClose() // Close the form after the accept button is clicked
    }
    

    return (
        <div className="dialog-container">
            <div className="custom-backdrop">
                <dialog id="new-project-modal" open>
                    <form onSubmit={(e) => { handleNewProjectFormSubmit(e) }} id="new-project-form" action="" name="new-project-form" method="post" > 
                        <h2
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div id="modal-project-title">New Project</div>
                            <div id="titleModalNewProject" />
                        </h2>
                        <div className="input-list">
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">apartment</span>Name
                                </label>
                                <input
                                    data-form-value="name"
                                    name="name"
                                    type="text"
                                    size={30}
                                    placeholder="What´s the name of your project"
                                    required={true}
                                    minLength={5}
                                    title="Please enter at least 5 characters"
                                    autoComplete="off"
                                />
                                <details>
                                    <summary>Tip</summary>
                                    <p>Give it a short name</p>
                                </details>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">text_fields</span>Acronym
                                </label>
                                <input
                                    data-form-value="acronym"
                                    name="acronym"
                                    type="text"
                                    size={30}
                                    placeholder="Enter a brief acronym for the project"
                                    required={true}
                                    maxLength={5}
                                    data-uppercase="acronym"
                                    title="Please do not enter more than 5 characters"
                                    autoComplete=""
                                />
                                <details>
                                    <summary>Tip</summary>
                                    <p>No more than five characters</p>
                                </details>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">article</span>Decription
                                </label>
                                <textarea
                                    data-form-value="description"
                                    name="description"
                                    id=""
                                    cols={50}
                                    rows={5}
                                    placeholder="Give your project a nice description! So people is jealous about it"
                                    defaultValue={""}
                                />
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">engineering</span>Business Unit
                                </label>
                                <select data-form-value="businessUnit" name="businessUnit">
                                    <option value="Edification">Edification</option>
                                    <option value="Civil">Civil</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Bridge">Bridge</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round"></span>Rol
                                </label>
                                <select data-form-value="userRole" name="userRole">
                                    <option>Architect</option>
                                    <option>Engineer</option>
                                    <option>Developer</option>
                                </select>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">not_listed_location</span>
                                    Status
                                </label>
                                <select data-form-value="status" name="status">
                                    <option>Pending</option>
                                    <option>Active</option>
                                    <option>Finished</option>
                                </select>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">paid</span>Cost
                                </label>
                                <input
                                    data-form-value="cost"
                                    name="cost"
                                    type="number"
                                    size={30}
                                    placeholder="Enter the budget for the project"
                                    inputMode="numeric"
                                    title="Please enter only numbers"
                                    autoComplete="off"
                                />
                                <details>
                                    <summary>Tip</summary>
                                    <p>Only allow numbers</p>
                                </details>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">calendar_month</span>Finish
                                    Date
                                </label>
                                <input
                                    data-form-value="finishDate"
                                    name="finishDate"
                                    type="date"
                                    id="finisProjecthDate"
                                    placeholder="Enter a Finish date for the project"
                                />
                            </div>
                        </div>
                        <div id="buttonEndRight">
                            <button id="cancel-project-btn" type="button" className="buttonC" onClick={onCloseNewProjectForm}>
                                Cancel
                            </button>
                            <button id="accept-project-btn" type="submit" className="buttonB">
                                Accept
                            </button>
                        </div>
                    </form>
                </dialog>
            </div>
        </div >
            
    )
}

export default NewProjectForm;