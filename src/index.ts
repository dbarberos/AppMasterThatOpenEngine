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
    //When the form is for a new Project
    if (!projectForm.dataset.edit) {
        projectForm.addEventListener("submit", (event) => {
            event.preventDefault()
            const formData = new FormData(projectForm)

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



                // finishDate: new Date(formData.get("finishDate") as string)
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
            /* catch (err) {
                const errorDisp = new MessagePopUp(ProjectForm, error, error)
                errorDisp.showError()
            }
            */
        })
    }
    //when the form is for update data of an existing Project
    if (projectForm.dataset.edit === "true") {
        projectForm.addEventListener("submit", (event) => {
            event.preventDefault()
            const formData = new FormData(projectForm)

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

            const projectDetails: IProject = {
                name: formData.get("name") as string,
                acronym: formData.get("acronym") as string,
                businessUnit: BusinessUnit[formData.get("businessUnit") as keyof typeof BusinessUnit],
                description: formData.get("description") as string,
                status: formData.get("status") as ProjectStatus,
                userRole: formData.get("userRole") as UserRole,
                finishDate: finishProjectDate,
                cost: formData.get("cost") as Number,
            }

            try {
                const project = projectManager.newProject(projectDetails);
                projectForm.reset()
                closeModal("new-project-modal")
            } catch (err) {



            }



        })
    }




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
    
    
