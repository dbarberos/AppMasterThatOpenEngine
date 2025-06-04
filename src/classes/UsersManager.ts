// import { updateAsideButtonsState } from "../index.tsx"
import { ProjectsManager } from "./ProjectsManager";
import { Project } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"
import { updateAsideButtonsState } from "./HTMLUtilities.ts";

import { renderToDoIssueListInsideProject, renderToDoIssueList, getProjectByToDoIssueId, setDetailsIssuePage, deleteToDoIssue } from "./ToDoManager";
import { ToDoIssue} from "./ToDoIssue"
import { IToDoIssue } from '../types.d.ts'
import { MessagePopUp } from "./MessagePopUp"



export class UsersManager {

    book: Project[] = []
    //ui: HTMLElement
    onProjectCreated = (project: Project) => { }
    onProjectDeleted = (name: string) => { }
    onProjectUpdated = (id: string) => { }
    //onToDoUpdated = (projectId: string, todoId: string) => { }
    onToDoIssueDeleted = (todoIssueId: string) => { }

    //Select a project for the ToDoBoard with the select input element inside the header
    // setUpUserPage(selectedProjectId?) {
    //     // Get the project list
    //     const projectManager = ProjectsManager.getInstance()
    //     const projectsList = projectManager.list
    //     const storedProject = projectsList.find((project) => project.id === selectedProjectId)

    //     const selectProjectForUsersPage = document.getElementById("projectSelectedUsersPage") as HTMLSelectElement

    //     setupProjectSelectUsersPage(projectsList, selectedProjectId)
    // }



    setupProjectSelectUsersPage(projectsList: Project[], selectedProjectId?: string) {
        const select = document.getElementById("projectSelectedUsersPage") as HTMLSelectElement;

        if (!select) {
            console.log("Error in getting the select ToDo Board")
            return
        }

        select.innerHTML = ""

        // Add a default option to select a project
        const option = document.createElement("option");
        option.value = "";
        option.text = "Select a project"
        // option.disabled = true
        option.style.color = "var(--color-fontbase-dark)"
        select.appendChild(option);

        // Populate the select element with project options
        projectsList.forEach((project) => {
            const option = document.createElement("option");
            option.value = project.id;
            option.text = project.name;
            select.appendChild(option)

            // Get the stored project ID and project from local storage
            const storedProjectId = localStorage.getItem("selectedProjectId");


            // Select the project corresponding to the stored project ID
            if (storedProjectId) {
                select.value = storedProjectId
                // selectedProject = projectsList.find((project) => project.id === storedProjectId)
            }
        })

            
        //Listen when the user change the Project inside the ToDo Board

        select.addEventListener("change", () => {
            const changedProjectId = select.value

            //Save the Id of the selected project in the local storage
            localStorage.setItem("selectedProjectId", changedProjectId)
            updateAsideButtonsState()


            // Now you can use the selectedProjectId variable, it is updated using the setUpToDoBoard function
            console.log("selectedProjectId", changedProjectId)
        })
    }



    //  *** USED INSIDE NewProjectForm *** 
    static populateUserDetailsForm (user: Project) {
        const projectDetailsForm = document.getElementById("new-project-form")
        if (!projectDetailsForm) { return }


        for (const key in user) {
            const inputField = projectDetailsForm.querySelectorAll(`[data-form-value="${key}"]`)
            if (inputField.length > 0) {
                if (key === "finishDate") {
                    // Format date for input type="date"
                    const date = new Date(user.finishDate);
                    date.setHours(12, 0, 0, 0)
                    const formattedDate = date.toISOString().split('T')[0]


                    // const formattedDate = project.finishDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

                    inputField.forEach(element => {
                        (element as HTMLInputElement).value = formattedDate
                        console.log(`${user[key]}`);

                    })
                } else {
                    inputField.forEach(element => {
                        // Handle different input types                        
                        if (element instanceof HTMLInputElement) {
                            element.value = user[key] // For text, date inputs
                        } else if (element instanceof HTMLTextAreaElement) {
                            element.value = user[key] // For textareas
                        } else if (element instanceof HTMLSelectElement) {
                            // For select elements, set the selected option
                            const options = element.options
                            for (let i = 0; i < options.length; i++) {
                                if (options[i].value === user[key]) {
                                    options[i].selected = true
                                    break
                                }
                            }
                        }
                    })
                }
            }
        }
}
    


}