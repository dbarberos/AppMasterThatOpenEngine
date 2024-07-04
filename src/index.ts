import { IProject, ProjectStatus, UserRole } from "./classes/Project"
import { ProjectsManager} from "./classes/ProjectsManager"
import { MessagePopUP} from "./classes/MessagePopUp"


export function showModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
        modal.showModal()
    } else {
        console.warn("No modal found related with the provided ID", id) 
    }
}
export function closeModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
        modal.close()
    } else {
        console.warn("No modal found related with the provided ID", id)
    }
}
 

export function toggleModal(id: string,) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
        modal.open ? modal.close() : modal.showModal() 
        } else {
        console.warn("No modal found related with the provided ID", id)
    }
}


const projectListUI = document.getElementById("project-list") as HTMLElement 
const projectManager = new ProjectsManager(projectListUI)


// This document object is provided by the browser, and its main purpose is to help us interact with the DOM
const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn) {
    newProjectBtn.addEventListener("click", () => {showModal("new-project-modal")})
} else {
    console.warn("New project button was not found")
}



//Obtaining data from the form via giving an id to the form and using FormData
const projectForm = document.getElementById("new-project-form")
const cancelForm: Element | null = document.getElementById("cancel-project-btn");
let closePopUpHandler: () => void
if (projectForm && projectForm instanceof HTMLFormElement) {
    projectForm.addEventListener("submit", (event) => {
        event.preventDefault()
        const formData = new FormData(projectForm)
        const projectDetails: IProject = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            status: formData.get("status") as ProjectStatus,
            userRole: formData.get("userRole") as UserRole,
            finishDate: new Date(formData.get("finishDate") as string)
        };
        try {
            const project = projectManager.newProject(projectDetails);
            projectForm.reset()
            closeModal("new-project-modal")
        } catch (err) {
            const errorPopUp = document.querySelector(".message-popup")
            const contentError = {
                contentDescription : err.message,
                contentTitle : "Error",
                contentClass : "popup-error",
                contentIcon : "report"
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
    
    if (cancelForm) {
        cancelForm.addEventListener("click", (e) => {
            e.preventDefault()
            projectForm.reset()
            toggleModal("new-project-modal")
        })
    } else {
        console.log("The cancel button was not found. Check the ID!")
    }
    } else {
    console.log("The project form was not found. Check the ID!")
}
