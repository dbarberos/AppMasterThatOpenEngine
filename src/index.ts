
import { Project } from "./classes/Project"

function showModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
        modal.showModal()
    } else {
        console.warn("No modal found related with the provided ID", id) 
    }
}



// This document object is provided by the browser, and its main purpose is to help us interact with the DOM
const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn) {
    newProjectBtn.addEventListener("click", () => {showModal("new-project-modal")})
} else {
    console.warn("New project button was not found")
}

//Obtaining data from the form via giving an id to the form and using FormData
const projectForm = document.getElementById("new-project-form")
if (projectForm && projectForm instanceof HTMLFormElement) {
    projectForm.addEventListener("submit", (event) => {
        event.preventDefault()
        const formData = new FormData(projectForm)
        let projectDetails = {
            name: formData.get("name"),
            description: formData.get("description"),
            status: formData.get("userRole"),
            userRole: formData.get("status"),
            finishDate: formData.get("finishDate")
        };
        const project = new Project(projectDetails);
        console.log(project)
    })
} else {
    console.log("The project form was not found. Check the ID!")
}
