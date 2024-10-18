import { ProjectsManager } from "./ProjectsManager";
import { Project } from "./Project"

import { reactive, html } from "@arrow-js/core";
import { dragAndDrop } from "@formkit/drag-and-drop";
import { renderToDoIssueListInsideProject } from "./ToDoManager";



localStorage.setItem("selectedProjectId", "") 
//Recover the selectedProjectForToDoBoard fom the localstorage for set up the ToDo Board.
document.addEventListener("DOMContentLoaded", () => {
    const storedProjectId = localStorage.getItem("selectedProjectId");
    
    if (storedProjectId) {
        const selectProjectForToDoBoard = document.getElementById("projectSelectedToDoBoard") as HTMLSelectElement;
        if (selectProjectForToDoBoard) {
            const projectManager = ProjectsManager.getInstance();
            const projectsList = projectManager.list;
            const valueInsideSelectedProject = projectsList.find((project) => project.id === storedProjectId)
            if (valueInsideSelectedProject) {
                const selectProjectForToDoBoard = document.getElementById("projectSelectedToDoBoard") as HTMLSelectElement
                selectProjectForToDoBoard.value = storedProjectId;
                console.log("Project Recover:", storedProject);
            }
        }
    }
})



//Select a project for the ToDoBoard with the select element inside the header


export function setUpToDoBoard(selectedProjectId?) {
// Get the project list
const projectManager = ProjectsManager.getInstance()
const projectsList = projectManager.list
const storedProject = projectsList.find((project) => project.id === selectedProjectId)
    
    const selectProjectForToDoBoard = document.getElementById("projectSelectedToDoBoard") as HTMLSelectElement

    if (selectProjectForToDoBoard) {
        selectProjectForToDoBoard.innerHTML = ""

        // Add a default option to select a project
        const option = document.createElement("option");
        option.value = "";
        option.text = "Select a project"
        // option.disabled = true
        option.style.color = "var(--color-fontbase-dark)"
        selectProjectForToDoBoard.appendChild(option);

        // Populate the select element with project options
        projectsList.forEach((project) => {
            const option = document.createElement("option");
            option.value = project.id;
            option.text = project.name;
            selectProjectForToDoBoard.appendChild(option)

            // Get the stored project ID and project from local storage
            const storedProjectId = localStorage.getItem("selectedProjectId");
            

            // Select the project corresponding to the stored project ID
            if (storedProjectId) {
                selectProjectForToDoBoard.value = storedProjectId
                // selectedProject = projectsList.find((project) => project.id === storedProjectId)
            }
        })

    } else {
        console.log("Error in getting the select ToDo Board")
    }
    //Clean the columns of previous ToDo Issues 
    const columnas = document.querySelectorAll(".todo-column-list");
    columnas.forEach((column) => {
        column.innerHTML = ""
        })
    //*** Get the list of todoIssue from the project an organize it ***
    // Get the stored project ID and project from local storage
    const storedProjectId = localStorage.getItem("selectedProjectId");
    if (storedProjectId) {        
        organizeToDoIssuesByStatusColumns(storedProjectId)
    }


    //






    //Listen when the user change the Project inside the ToDo Board

    selectProjectForToDoBoard.addEventListener("change", () => {
        const changedProjectId = selectProjectForToDoBoard.value        
                
        //Save the Id of the selected project in the local storage
        localStorage.setItem("selectedProjectId", changedProjectId)        
        
        // Ahora puedes utilizar la variable selectedProjectId
        console.log("selectedProjectId", changedProjectId)

        

        //Get the list of todoIssue from the project an organize it
        organizeToDoIssuesByStatusColumns(changedProjectId)
        //Render the columns of Issues
        
    })


    //Create diferents arrays of todoIssues according to the statusColum value

    function organizeToDoIssuesByStatusColumns(projectId) {
        
        const projectObject = projectsList.find((project) => project.id === projectId)
        if (projectObject) {
            console.log("I am inside organize and render todolist")
            console.log("ProjectId", projectId)
            const toDoIssues = projectObject.todoList

            //Clean the columns of previous ToDo Issues 
            const columns = document.querySelectorAll(".todo-column-list");
            columns.forEach((column) => {
                column.innerHTML = ""
            })
        
            // Create an object to store the arrays for each status column
            const statusColumns = {}
            // Iterate over the todoList and group them by status column
            toDoIssues.forEach((toDoIssue) => {
                // Check if statusColumn is null, undefined, or empty
                const status = toDoIssue.statusColumn === null ? "notassigned" : toDoIssue.statusColumn;
                // If the array for the status column doesn't exist, create it
                if (!statusColumns[status]) {
                    statusColumns[status] = [];
                }

                // Add the toDoIssue to the array for its status column
                statusColumns[status].push(toDoIssue);
            })

            console.log("Organized ToDoIssues by statusColumns: ", statusColumns)

            // Render the UI for each toDoIssue in its respective column
            Object.keys(statusColumns).forEach((status) => {
                const columnId = `todo-column-${status.toLowerCase()}`;
                const column = document.getElementById(columnId);
                if (!column) {return}
                statusColumns[status].forEach((toDoIssue) => {
                    renderToDoIssueListInsideProject(toDoIssue)
                    column.appendChild(toDoIssue.ui);
                });
            });
        } else {
            console.error("project not found for ID:", projectId )
        }



    }
}










