import { IProject, ProjectStatus, UserRole, BusinessUnit, Project } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager";
import { showModal, closeModal, toggleModal, changePageContent } from "./classes/UiManager";
import "./classes/HTMLUtilities.ts";
import "./classes/LightMode.ts";
import { MessagePopUp } from "./classes/MessagePopUp"

const projectListUI = document.getElementById("project-list") as HTMLElement 
const projectManager = new ProjectsManager(projectListUI)


//Set the initial view of the APP with the projects page, hidding the rest of sections
document.addEventListener('DOMContentLoaded', () => {
    changePageContent('project-page', 'flex'); 
});

// This document object is provided by the browser, and its main purpose is to help us interact with the DOM
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

        // Set Modal in case previously we update a project
        // Update Modal Title
        const modalProjectTitle = document.getElementById("modal-project-title");
        if (modalProjectTitle) {
            modalProjectTitle.textContent = "New Project";
        }
        // Update Button Text
        const submitButton = document.getElementById("accept-project-btn");
        if (submitButton) {
            submitButton.textContent = "Accept";
        }
        const discardButton = document.getElementById("cancel-project-btn");
        if (discardButton) {
            discardButton.textContent = "Cancel";
        }
    })
    
} else {
    console.warn("New project button was not found")
}


//Obtaining data from the form via giving an id to the form and using FormData
const projectForm = document.getElementById("new-project-form")
const cancelForm: Element | null = document.getElementById("cancel-project-btn");
const submitFormButton = document.getElementById("accept-project-btn")

if (projectForm && projectForm instanceof HTMLFormElement) {
    
    // projectForm.addEventListener("submit", (event) => {
    submitFormButton.addEventListener("click", (e) => {
        e.preventDefault()
        const formData = new FormData(projectForm)
        const checkProjectID = submitFormButton?.dataset.projectId

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
                finishProjectDate = new Date("2112-10-21"); // Create a new Date object for today
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
                cost: formData.get("cost") as Number,
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
                    projectFormId.dataset.projectId = ""


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
                    }
                    projectDetailsToUpdate.backgroundColorAcronym = Project.calculateBackgroundColorAcronym(projectDetailsToUpdate.businessUnit)
                    
                    
                    if (projectToUpdate) {
                        const changesInProject = projectManager.getChangedProjectDataForUpdate(projectToUpdate, projectDetailsToUpdate)
                        // Check if there are any changes
                        if (Object.keys(changesInProject).length > 0) {

                            // Construct the message for using later in the MessagePopUp
                            let messageContent = "The following project details will be updated in the project:<br><br>";
                            for (const key in changesInProject) {
                                messageContent += `<b>${key}:</b><br>From: <i>${changesInProject[key][0]}</i><br>To: <i style="color: var(--popup-warning);">${changesInProject[key][1]}</i><br><br>`;
                            }

                            // Create and show the MessagePopUp and show the message above
                            const updateConfirmationPopup = new MessagePopUp(
                                document.body,
                                "info",
                                "Confirm Project Update",
                                messageContent,
                                ["Confirm update", "Cancel"]
                            );

                            // Define button callbacks
                            const buttonCallbacks = {
                                "Confirm update": () => {

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
                                    
                                    updateConfirmationPopup.closeMessageModal();
                                    closeModal("new-project-modal"); // Close the edit form modal
                                    console.log("Project updated", updatedProject)
                                    console.log(projectManager.list) 

                                },
                                "Cancel": () => {
                                    // User cancelled, do nothing or provide feedback
                                    console.log("User cancelled the update.");
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
const importProjectsBtn = document.getElementById("import-projects-JSON-btn")
if (importProjectsBtn) {
    importProjectsBtn.addEventListener("click", () => {
        projectManager.imprtFromJSON()
    })
} else {
    console.log("The import button was not found. Check the ID!")
}

//Main button of project(aside) return to the projects list
const btnMainProjects = document.querySelector("#asideBtnProjects")
btnMainProjects?.addEventListener("click", (e) => {
    e.preventDefault()
    changePageContent("project-page", "flex")

})

//Button for edit Project Details.
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
                    // Set the data-projectId attribute with the unique ID of the proyect in the button of "Save Changes"
                    const projectDatasetAttributeIdInForm = document.getElementById("accept-project-btn")
                    if (projectDatasetAttributeIdInForm) {
                        projectDatasetAttributeIdInForm.dataset.projectId = projectId.toString()
                    }                    
                } else {
                    console.error("Project not found!");
                }
            } else {
                console.error("Project ID not found on the clicked element!");
            }
        }
        })
} else {
    console.warn("Edit project button was not found")
}
    
    
