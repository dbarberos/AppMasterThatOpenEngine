import { updateAsideButtonsState } from "../index.ts"
import { ProjectsManager } from "./ProjectsManager";
import { Project } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"


import { renderToDoIssueListInsideProject, renderToDoIssueList, getProjectByToDoIssueId, setDetailsIssuePage, deleteToDoIssue } from "./ToDoManager";
import { ToDoIssue, IToDoIssue } from "./ToDoIssue"
import { MessagePopUp } from "./MessagePopUp"
import { setupProjectSelect } from "./DragAndDropManager.ts";



//Select a project for the ToDoBoard with the select input element inside the header
export function setUpUserPage(selectedProjectId?) {
    // Get the project list
    const projectManager = ProjectsManager.getInstance()
    const projectsList = projectManager.list
    const storedProject = projectsList.find((project) => project.id === selectedProjectId)

    const selectProjectForUsersPage = document.getElementById("projectSelectedUsersPage") as HTMLSelectElement

    setupProjectSelectUsersPage(projectsList, selectedProjectId)
}



function setupProjectSelectUsersPage(projectsList: Project[], selectedProjectId?: string) {
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