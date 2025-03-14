import { Project, IProject, ProjectStatus, UserRole, BusinessUnit } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent } from "./UiManager"
import { MessagePopUp } from "./MessagePopUp"
import { v4 as uuidv4 } from 'uuid'
import { IToDoIssue, ToDoIssue } from "./ToDoIssue"
import { newToDoIssue, clearSearchAndResetList, renderToDoIssueListInsideProject, resetSearchState, setupProjectDetailsSearch } from "./ToDoManager"

import { updateAsideButtonsState } from "./HTMLUtilities.ts"

import { useProjectsManager } from '../react-components/ProjectsManagerContext'

export class ProjectsManager {

    list: Project[] = []
    //ui: HTMLElement
    onProjectCreated = (project: Project) => { }
    onProjectDeleted = (id: string) => { }
    onProjectUpdated = (id:string) => { }


    //defaultProjectCreated: boolean = false

    /* SINGLETON PATTERN ProjectManager
    //Applying the singleton design pattern to the ProjectsManager class. This ensures that only one instance of ProjectsManager exists throughout the application, providing a global access point to its functionality.

    static instance: ProjectsManager
    static container: HTMLElement | null = null

    public static setContainer(container: HTMLElement) {
        ProjectsManager.container = container
    }

    public static getInstance(): ProjectsManager {
        if (!ProjectsManager.instance) {
            if (!ProjectsManager.container) {
                throw new Error("Container not established")
            }
            ProjectsManager.instance = new ProjectsManager(ProjectsManager.container)
        }
        return ProjectsManager.instance
    }
    //above finished the singleton pattern
    */

    /*REMOVED CREATION OF DEFAULT PROJECT
    constructor() {
        
        this.defaultProjectCreated = false
        //this.createDefaultProject()
    }
    */
    
    //ESTA FUCNION ESTA CREADA PARA LA CREACIÓN DE PROYECTOS AL RERENDERIZAR EL COMPONENTE DE REAC PROJECTPAGE
    newProject(data: Project, id?: string): Project | undefined{
        const projectNames = this.list.map((project) => {
            return project.name
        })
        
        if (projectNames.includes(data.name)) {
            // Find and remove the existing project from the ui & list since you are going to use it later
            const existingProjectIndex = this.list.findIndex(project => project.name === data.name);
            if (existingProjectIndex !== -1) {
                //It is clare that there is an index, since there is a project with that name
                // 1. Remove the existing project from the list
                this.list = this.list.filter((project) => project.name !== data.name);

                // 2. Create a new project with the imported data
                const newProject = new Project(data, id);

                // 3. Process todo list if exists
                if (data.todoList && Array.isArray(data.todoList)) {
                    newProject.todoList = data.todoList.map(todoData => {
                        return ToDoIssue.createFromData({
                            ...todoData,
                            todoProject: newProject.id || '' 
                        });
                    });
                }

                // 4. Add the new project to the list
                this.list.push(newProject);
                this.onProjectCreated(newProject);
                return newProject;

            } else {
                console.error("Project to overwrite not found in the list.")
                return undefined
            }

        } else {
            //Create a new proyect  
            const newProject = new Project(data, id)
            if (data.todoList && Array.isArray(data.todoList)) {
                newProject.todoList = data.todoList.map(todoData => {
                    return ToDoIssue.createFromData({
                        ...todoData,
                        todoProject: newProject.id || ''
                    });
                });
            }
            this.list.push(newProject)
            this.onProjectCreated(newProject)
            return newProject
        }
    }
    

/*OLD NEWpROJECT FUNCTION
    OLDnewProject(data: IProject): Project | undefined {
        const projectNames = this.list.map((project) => {
            return project.name
        })
        if (projectNames.includes(data.name)) {
            console.log(`A project with the name [ ${data.name} ] already exists`)
            //Create a Confirmation Modal to prompt the user about the duplication and offer options
            return new Promise<Project | undefined>((resolve) => {// Return a Promise
                const popupDuplicateProject = new MessagePopUp(
                    document.body,
                    "warning",
                    `A project with the name "${data.name}" already exist`,

                    `<b><u>Overwrite:</b></u> Replace the existing project with the imported data.<br>
                <b><u>Skip:</b></u> Do not import the duplicated project.<br>
                <b><u>Rename:</b></u> Enter a new name for the imported project.`,
                    ["Overwrite", "Skip", "Rename"],
                )

                // Define ALL your button callbacks for the messagePopUp created
                const buttonCallbacks = {
                    "Overwrite": () => {
                        console.log("Overwrite button clicked!");
                        popupDuplicateProject.closeMessageModal();

                        // Find and remove the existing project from the ui & list since you are going to use it later
                        const existingProjectIndex = this.list.findIndex(project => project.name === data.name);
                        if (existingProjectIndex !== -1) {

                            // 1. Remove the existing project's UI from the display
                            this.ui.removeChild(this.list[existingProjectIndex].ui);
                            console.log("Old project removed fromthe UI");

                            // 2. Remove the existing project from the list
                            this.list = this.list.filter((project) => project.name !== data.name);
                            console.log("Removed the oLd Project name from the List of names");


                            // 3. Create a new project with the imported data
                            const newProject = new Project(data);

                            ATTACH THE EVENT LISTENER HERE
                            newProject.ui.addEventListener("click", () => {
                                changePageContent("project-details", "flex")

                                //Set the funcionality of search between todoIssues
                                setupProjectDetailsSearch()

                                // Set the localStorage value for pageWIP to "project-details"
                                localStorage.setItem("pageWIP", "project-details")
                                localStorage.setItem("selectedProjectId", newProject.id)

                                ProjectsManager.setDetailsPage(newProject)
                                console.log(" details pages set in a new window")
                                
                                updateAsideButtonsState()
                            })
                            


                            // 4. Add the new project to the list and UI
                            this.list.push(newProject);
                            this.onProjectCreated(newProject);
                            console.log("Added new project to the List of names")
                            // this.ui.append(newProject.ui)
                            //console.log("Added new project to the UI")

                            // 5. Resolve with the newly created project
                            resolve(newProject);

                        } else {
                            // Handle the case where the project is not found (shouldn't happen, just in case
                            console.error("Project to overwrite not found in the list.")
                            resolve(undefined); // Or resolve with an appropriate error value
                        }
                    },
                    "Skip": () => {
                        console.log("Skip button clicked!")
                        popupDuplicateProject.closeMessageModal()
                        resolve(undefined); // Resolve with undefined to indicate skipping
                    },
                    "Rename": () => {
                        console.log("Rename button clicked!")
                        // **Get the project name BEFORE creating the dialog**
                        const projectToRename = this.list.find((project) => project.name === data.name);
                        const existingProjectName = projectToRename ? projectToRename.name : "Project Name";

                        // 1. Create the rename dialog
                        const renameDialog = document.createElement("dialog");
                        // renameDialog.id = id;
                        renameDialog.className = "popup-default";
                        document.body.insertBefore(renameDialog, document.body.lastElementChild);

                        const box = document.createElement("div");
                        box.className = "message-content toast toast-popup-default";
                        renameDialog.appendChild(box);

                        const renameIcon = document.createElement("div");
                        renameIcon.className = "message-icon";
                        box.appendChild(renameIcon);

                        const renameIconSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        renameIconSVG.setAttribute("class", "message-icon-svgDark");
                        renameIconSVG.setAttribute("role", "img");
                        renameIconSVG.setAttribute("aria-label", "rename");
                        renameIconSVG.setAttribute("width", "24px");
                        renameIconSVG.setAttribute("height", "24px");
                        renameIconSVG.setAttribute("fill", "#08090a");
                        renameIcon.appendChild(renameIconSVG);

                        const renameIconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                        renameIconUse.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#rename");
                        renameIconUse.setAttributeNS("http://www.w3.org/2000/svg", "xlink:href", "#rename");
                        renameIconSVG.appendChild(renameIconUse);


                        const content = document.createElement("div");
                        content.className = "toast-column";
                        box.appendChild(content);


                        const text = document.createElement("div");
                        text.className = "message-text";
                        content.appendChild(text);

                        const renameTitle = document.createElement("h5");
                        renameTitle.className = "message-text-title";
                        renameTitle.textContent = "Project name";
                        text.appendChild(renameTitle);


                        const renameSubtitle = document.createElement("p");
                        renameSubtitle.className = "message-text-message";
                        renameSubtitle.textContent = "Select the text field and populate it with a new name";
                        text.appendChild(renameSubtitle);

                        const boxInput = document.createElement("div");
                        boxInput.className = "message-text";
                        content.appendChild(boxInput);


                        const renameInputName = document.createElement("input");
                        renameInputName.className = "toast-input-text";
                        renameInputName.type = "text";
                        renameInputName.setAttribute("id", "newProjectName");
                        renameInputName.setAttribute("placeholder", existingProjectName);
                        renameInputName.setAttribute("autofocus", "");
                        renameInputName.setAttribute("required", "");
                        renameInputName.setAttribute("minlength", "5");
                        renameInputName.setAttribute("autocomplete", "off");
                        boxInput.appendChild(renameInputName);


                        const renameInputLabel = document.createElement("label");
                        renameInputLabel.className = "toast-input-text";
                        renameInputLabel.textContent = existingProjectName
                        renameInputLabel.setAttribute("autofocus", "false");
                        boxInput.appendChild(renameInputLabel);


                        const renameBtns = document.createElement("div");
                        renameBtns.className = "message-btns";
                        box.appendChild(renameBtns);

                        const rBtnA = document.createElement("button");
                        rBtnA.className = "message-btn";
                        rBtnA.type = "button";
                        rBtnA.setAttribute("id", "confirmRename");
                        renameBtns.appendChild(rBtnA)

                        const rBtnText = document.createElement("span");
                        rBtnText.className = "message-btn-text";
                        rBtnText.textContent = "Do it";
                        rBtnA.appendChild(rBtnText);

                        const rBtnC = document.createElement("button");
                        rBtnC.className = "message-btn";
                        rBtnC.type = "button";
                        rBtnC.setAttribute("id", "cancelRename");
                        renameBtns.appendChild(rBtnC)

                        const btnTextC = document.createElement("span");
                        btnTextC.className = "message-btn-text";
                        btnTextC.textContent = "Cancel";
                        rBtnC.appendChild(btnTextC);



                        // 2. Append the dialog to the body and show it
                        document.body.appendChild(renameDialog)
                        renameDialog.showModal()

                        // 3. Handle Confirm and Cancel buttons
                        const confirmRenameBtn = renameDialog.querySelector('#confirmRename')
                        const cancelRenameBtn = renameDialog.querySelector('#cancelRename')
                        const newProjectNameInput = renameDialog.querySelector('#newProjectName') as HTMLInputElement;

                        if (confirmRenameBtn && cancelRenameBtn && newProjectNameInput) {
                            confirmRenameBtn.addEventListener('click', () => {
                                const newName = newProjectNameInput.value.trim()

                                // Basic validation: Check if the name is empty
                                if (newName === "") {
                                    const popupEnterNewName = new MessagePopUp(
                                        document.body,
                                        "error",
                                        `A project with a empty name is not allow`,

                                        "Please enter a valid project name.",
                                        ["Got it"],
                                    )
                                    // Define ALL your button callbacks for the messagePopUp created
                                    const buttonCallbacks = {
                                        "Got it": () => {
                                            console.log("Got it button clicked!")
                                            popupEnterNewName.closeMessageModal()
                                        },
                                    }
                                    popupEnterNewName.showNotificationMessage(buttonCallbacks);

                                    return;
                                }

                                // Validation: Check if the minimun length is 5 characters
                                if (newName.length < 5) {
                                    const popupEnter5CharactersName = new MessagePopUp(
                                        document.body,
                                        "error",
                                        "Invalid Project Name",
                                        "Please enter a project name that is at least 5 characters long.",
                                        ["Got it"],
                                    )
                                    // Define ALL your button callbacks for the messagePopUp created
                                    const buttonCallbacks = {
                                        "Got it": () => {
                                            console.log("Got it button clicked!")
                                            popupEnter5CharactersName.closeMessageModal()
                                        },
                                    }
                                    popupEnter5CharactersName.showNotificationMessage(buttonCallbacks);

                                    return;
                                }

                                // Validation: Check if the mame does not exist
                                const existingProject = projectNames.find(existingName => existingName.toLowerCase() === newName.toLowerCase())

                                if (existingProject) {
                                    // Name already exists, show error message
                                    const existProjectName = new MessagePopUp(
                                        document.body,
                                        "error",
                                        "Duplicate Name",
                                        `A project named "${newName}" already exists. Please choose a different name.`,
                                        ["Got it"]
                                    );
                                    // Define button callback
                                    const buttonCallbacks = {
                                        "Got it": () => {
                                            existProjectName.closeMessageModal();
                                        }
                                    }
                                    existProjectName.showNotificationMessage(buttonCallbacks);
                                    const deleteNameInput = document.querySelector("#newProjectName") as HTMLInputElement | null
                                    if (deleteNameInput) {
                                        deleteNameInput.value = ""
                                    }
                                } else {



                                    // Update the project name
                                    data.name = newName;

                                    //Assign a new Id to the project
                                    (data as any).id = uuidv4()

                                    //Assign a new id to each todoIssue 
                                    data.todoList.forEach((toDoIssue) => {
                                        toDoIssue.id = uuidv4()
                                    })


                                    // Create the new project and resolve the Promise
                                    const newProject = new Project(data);

                                    // ATTACH THE EVENT LISTENER HERE
                                    newProject.ui.addEventListener("click", () => {
                                        changePageContent("project-details", "flex")

                                        //Set the funcionality of search between todoIssues
                                        setupProjectDetailsSearch()

                                        // Set the localStorage value for pageWIP to "project-details"
                                        localStorage.setItem("pageWIP", "project-details")
                                        localStorage.setItem("selectedProjectId", newProject.id)

                                        ProjectsManager.setDetailsPage(newProject);
                                        console.log("Details page set in a new window");
                                        
                                        updateAsideButtonsState()
                                    });
                                    

                                    this.list.push(newProject)
                                    // this.ui.append(newProject.ui)
                                    this.onProjectCreated(newProject)
                                    resolve(newProject)

                                    // Close the dialog
                                    renameDialog.close()
                                }
                            });

                            cancelRenameBtn.addEventListener('click', () => {
                                renameDialog.close()
                                resolve(undefined); // Resolve as undefined to indicate renaming was cancelled
                            });
                        }
                        popupDuplicateProject.closeMessageModal()
                    }
                }
                popupDuplicateProject.showNotificationMessage(buttonCallbacks);
            })

        } else {
            // No duplicate, create the project
            const project = new Project(data)

            console.log(project.todoList)

            // this.ui.append(project.ui)
            this.list.push(project)
            //this.removeDefaultProject();
            this.onProjectCreated(project)
            return project
        }

    }
*/

    filterProjects(value: string) {
        const filteredProjects = this.list.filter((project) => {
            return project.name.toLowerCase().includes(value.toLowerCase())
        })
        return filteredProjects
    }

    /* //setDetailsPage function
    static setDetailsPage(project: Project) {
        const detailPage = document.getElementById("project-details")
        if (!detailPage) { return }


        //Set up counter of the search input in the todo-list
        const counterElement = document.getElementById('todolist-search-counter') as HTMLElement
        if (counterElement) {
            resetSearchState(counterElement);
        }

        
        for (const key in project) {
            const dataElement = detailPage.querySelectorAll(`[data-project-info="${key}"]`)
            if (dataElement) {
                if (key === "finishDate") {
                    const formattedDate = project.finishDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    dataElement.forEach(element => {
                        element.textContent = formattedDate
                    })
                } else if (key === "cost") {
                    const costElement = detailPage.querySelector(`[data-project-info="cost"]`)
                    if (costElement) {
                        costElement.textContent = `${project["cost"]}`
                    }
                } else {
                    dataElement.forEach(element => {
                        element.textContent = project[key]
                    })
                }
                
            }
        }
        // Update the background color of the acronym in the dashboard-card
        const acronymElement = detailPage.querySelector('[data-project-info="acronym"]') as HTMLElement
        if (acronymElement) {
            acronymElement.style.backgroundColor = project.backgroundColorAcronym;
        }

        // Set the data-projectId attribute with the unique ID of the proyect 
        const projectDatasetAttributeId = document.getElementById("edit-project-details")
        if (projectDatasetAttributeId) {
            projectDatasetAttributeId.dataset.projectId = project.id.toString()
        }

        // Set the data-projectId attribute with the unique ID of the proyect in the button of new To-Do
        const projectToDoDatasetAttributeId = document.getElementById("new-todo-issue-btn")
        if (projectToDoDatasetAttributeId) {
            projectToDoDatasetAttributeId.dataset.projectId = project.id.toString()
        }

        //****Create de list of ToDo cards for that specifict project****
        //We have to manage new project and imported projects from Json. Tose last project don´t have ui HTML elements imported.

        //Get the target element
        const projectListToDosUI = document.querySelector("#details-page-todo-list") as HTMLElement

        // Clear any existing content in the container 
        while (projectListToDosUI.firstChild) {
            projectListToDosUI.removeChild(projectListToDosUI.firstChild);
        }
        // Iterate through the todoList and append each UI element
        project.todoList.forEach(toDoIssue => {
            if (!toDoIssue.ui) {
                renderToDoIssueListInsideProject(toDoIssue)
            }

            // Append the new div to the todoListContainer
            projectListToDosUI.appendChild((toDoIssue as any).ui);
            
        })

        //SetUp the selection intput of existing projects showing the stored inside the local storage selectedProjectId
        console.log("setUpSelectionProject", project.id)
        ProjectsManager.setUpSelectionProject("projectSelectedProjectDetailPage", project.id)
        
        //Setup the todo-header column with the name of the project
        const todoHeader = document.querySelector("#todo-project-header-name") as HTMLElement

        if (todoHeader) {
            todoHeader.textContent = ""
            todoHeader.textContent = project.name
        }
        
    
    }
*/


    static setUpSelectionProject(idElementSelection?, projectIdSelected?) {
        // Get the project list
        //const projectManager = ProjectsManager.getInstance()
        const projectsManager = useProjectsManager();
        const projectsList = projectsManager.list
        const selectionProjectForProjectDetailPage = document.getElementById(idElementSelection) as HTMLSelectElement

        if (selectionProjectForProjectDetailPage) {
            selectionProjectForProjectDetailPage.innerHTML = ""

            // Add a default option to select a project
            const option = document.createElement("option");
            option.value = "";
            option.text = "Select a project"
            // option.disabled = true
            option.style.color = "var(--color-fontbase-dark)"
            selectionProjectForProjectDetailPage.appendChild(option);

            // Populate the select element with project options
            projectsList.forEach((project) => {
                const option = document.createElement("option");
                option.value = project.id;
                option.text = project.name;
                selectionProjectForProjectDetailPage.appendChild(option)

                // Select the project corresponding to the stored project ID

                selectionProjectForProjectDetailPage.value = projectIdSelected
            })
        }

        //Listen when the user change the Project inside the ToDo Board
        selectionProjectForProjectDetailPage.addEventListener("change", () => {
            const changedProjectId = selectionProjectForProjectDetailPage.value

            // Reset the number of task in the counter of todo Issues 
            const counterElementProjectDetails = document.getElementById('todolist-search-counter') as HTMLElement
            if (counterElementProjectDetails) {
                resetSearchState(counterElementProjectDetails)
            }

            //Clean the search input
            clearSearchAndResetList()

            //Save the Id of the selected project in the local storage
            localStorage.setItem("selectedProjectId", changedProjectId)
            updateAsideButtonsState()

            // Now you can use the selectedProjectId variable, it is updated using the setUpToDoBoard function
            console.log("selectedProjectId", changedProjectId)

            // Recover the project with this ID
            const selectedProject = projectsList.find(project => project.id === changedProjectId);


            const storedPageWIP = localStorage.getItem("pageWIP")

            if (storedPageWIP === "project-details" && selectedProject) {
                ProjectsManager.setDetailsPage(selectedProject)
            }
        })

    }

    /* USED INSIDE INDEX.TSX */

    updateReactProjects(dataToUpdate: Project) {
        const projectIndex = this.list.findIndex(p => p.id === dataToUpdate.id)

        if (projectIndex !== -1) {
            //Preserve the original ID
            dataToUpdate.id = this.list[projectIndex].id

            //Create a new list with the updated project
            const updatedProjectsList = this.list.map((project, index) =>
                index === projectIndex ? new Project({
                    ...project, // Keep existing properties
                    ...dataToUpdate // Add new properties
                }) : project
            );
            //Update the list reference
            this.list = updatedProjectsList

            //Return the entire updated list of projects
            return updatedProjectsList

            /*  
            Update the Project Data in the Array.
            this.list[projectIndex] = new Project({
                ...this.list[projectIndex], // Keep existing properties
                ...dataToUpdate // Update with new values
            })

            //ProjectsManager.setDetailsPage(this.list[projectIndex])
            return this.list
          // return true; // Indicate successful update
          */

        } else {
            console.error("Project not found in the list!")
            return false
        }
    }

    /* USED INSIDE NEWPROJECTFORM.TSX */

    updateProject(projectId: string, dataToUpdate: Project) {
        const projectIdString = projectId.toString().trim()
        const projectIndex = this.list.findIndex(p => p.id?.toString().trim() === projectIdString) //Convert to string and trim for the comparing the same type of data

        if (projectIndex !== -1) {
            //  Update the existing project object directly (instead of creating a new one)
            const projectToUpdate = this.list[projectIndex];

            // Update properties of the existing project
            for (const key in dataToUpdate) {
                if (key !== "id") { // Explicitly exclude the ID to prevent it from being overwritten.
                    projectToUpdate[key] = dataToUpdate[key];
                }
            }

            this.onProjectUpdated(projectId);
            return projectToUpdate;


            // //Preserve the original ID
            // dataToUpdate.id = this.list[projectIndex].id

            // // Update the Project Data in the Array. Clone the project previously stored in the list and update the properties with the new values
            // const updatedProjectCloned = new Project(dataToUpdate)


            // this.list[projectIndex] = {
            //     ...this.list[projectIndex], // Keep existing properties
            //     ...dataToUpdate // Update with new values
            // }

            // this.onProjectUpdated(projectId)
            
            // return this.list[projectIndex]
            
        } else {
            console.error("Project not found in the list!")
            return null
        }
    }


    //FOR UPDATING THE TODO LIST INSIDE DE PROHJECTS.MANAGER WHEN IT SHOULD BE UPDATED
    updateProjectToDoList(projectId: string, todo: ToDoIssue) {
        const project = this.list.find(p => p.id === projectId);
        if (project) {
            //Check if the todo already exists to avoid duplicate toDos
            const existingTodoIndex = project.todoList.findIndex(t => t.id === todo.id);

            // Only add if it doesn't exist
            if (existingTodoIndex === -1) {
                project.todoList.push(todo);
                this.onProjectUpdated(projectId);
            } else {
                console.warn(`ToDoIssue with ID ${todo.id} already exists in project ${projectId}. It will not be added again.`);
            
            }
        } else {
            console.error(`Project with ID ${projectId} not found.`);
        }
    }

    // Add this method to handle todo updates
    updateToDoIssue(projectId: string, todoId: string, updatedTodo: ToDoIssue) {
        const project = this.list.find(p => p.id === projectId);
        if (project) {
            const todoIndex = project.todoList.findIndex(t => t.id === todoId);
            if (todoIndex !== -1) {
                project.todoList[todoIndex] = updatedTodo;
                this.onProjectUpdated(projectId);
            }
        }
    }



    //  *** USED INSIDE NewProjectForm *** 
    static populateProjectDetailsForm(project: Project) {
        const projectDetailsForm = document.getElementById("new-project-form")
        if (!projectDetailsForm) { return }


        for (const key in project) {
            const inputField = projectDetailsForm.querySelectorAll(`[data-form-value="${key}"]`)
            if (inputField.length > 0) {
                if (key === "finishDate") {
                    // Format date for input type="date"
                    const formattedDate = project.finishDate.toISOString().split('T')[0]


                    // const formattedDate = project.finishDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

                    inputField.forEach(element => {
                        (element as HTMLInputElement).value = formattedDate
                        console.log(`${project[key]}`);

                    })
                } else {
                    inputField.forEach(element => {
                        // Handle different input types                        
                        if (element instanceof HTMLInputElement) {
                            element.value = project[key] // For text, date inputs
                        } else if (element instanceof HTMLTextAreaElement) {
                            element.value = project[key] // For textareas
                        } else if (element instanceof HTMLSelectElement) {
                            // For select elements, set the selected option
                            const options = element.options
                            for (let i = 0; i < options.length; i++) {
                                if (options[i].value === project[key]) {
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


      //*** USED INSIDE NewProjectForm *** *
    static getChangedProjectDataForUpdate(existingProject: Project | null, updatedProject: Project): Record<string, [any, any]> {
            const changedData: { [key: string]: [string, string] } = {};
    
            if (!existingProject) return changedData;
    
            for (const key in existingProject) {
                // Avoid 'backgroundColorAcronym' property from the comparation
                if (key === "backgroundColorAcronym") {
                    continue;
                }
                // Avoid 'createdAt' property from the comparation
                if (key === "createdAt") {
                    continue;
                }
                // Avoid 'todoList' property from the comparation
                if (key === "todoList") {
                    continue;
                }

    
                const currentProjectValue = existingProject[key];
                const valueToUpdate = updatedProject[key];
    
                console.log(`Comparing ${key}:`, currentProjectValue, valueToUpdate); // Línea de depuración
    
                // Comparar y almacenar la diferencia (manejando las fechas adecuadamente)
                if (key === "finishDate" && currentProjectValue instanceof Date && valueToUpdate instanceof Date) {
                    if (currentProjectValue.getTime() !== valueToUpdate.getTime()) {
                        changedData[key] = [currentProjectValue.toLocaleDateString(), valueToUpdate.toLocaleDateString()];
                    }
                } else if (currentProjectValue !== valueToUpdate) {
                    changedData[key] = [String(currentProjectValue), String(valueToUpdate)];
                }
            }
    
            console.log("Changed Data:", changedData); 
            return changedData;
        };
    
    
    renderProjectList(): void {
        const projectListUiElements = document.getElementById('project-list');
        if (projectListUiElements) {

            // Clear the existing elements inside the #project-list div
            projectListUiElements.innerHTML = ""

            // Re-render the project list with the updated data
            this.list.forEach(project => {
                const projectUiElement = this.updateProjectUi(project);
                projectListUiElements.appendChild(projectUiElement);

                // // Remove any existing click listeners (optional but recommended)
                // projectUiElement.removeEventListener("click", this.handleProjectClick);

                // Attach the click listener 
                projectUiElement.addEventListener("click", () => {
                    changePageContent("project-details", "flex");

                    //Set the funcionality of search between todoIssues
                    setupProjectDetailsSearch()
                    localStorage.setItem("selectedProjectId", project.id)

                    ProjectsManager.setDetailsPage(project);
                    console.log("Details page set in a new window");

                    updateAsideButtonsState()
                });


            });
        }
    }

    /*REMOVED THE CREATION OF DEFAULT PROJECT
    createDefaultProject() {
        if (this.defaultProjectCreated) { return }
        const defaultData = {
            name: "Example Project",
            acronym: "EP",
            description: "This is a A Big Building",
            businessUnit: "Edification" as BusinessUnit,
            status: "Active" as ProjectStatus,
            userRole: "Developer" as UserRole,
            finishDate: new Date("2022-02-03"),
            cost: 0,
            progress: 1,
            id: "default-project",
            todoList: [],
            backgroundColorAcronym: "#ccc"

        }
        
        const defaultProject = new Project(defaultData)
        defaultProject.ui.classList.add("default-project") //making the default special for easy removing 
        this.list.push(defaultProject)
        this.defaultProjectCreated = true
    }
    */

    /*REMOVED THE ERASE OF DEFAULT PROJECT
    removeDefaultProject() {
        if (this.defaultProjectCreated && this.list.length > 1) {
            // Remove the defautl project from the Ui and from the array list
            const defaultProjectUI = this.ui.querySelector(".default-project");
            if (defaultProjectUI) {
                this.ui.removeChild(defaultProjectUI);
            }
            // this.list = this.list.filter(project => project.ui !== defaultProjectUI)
            this.defaultProjectCreated = false;
        }
    }
    */

    /* USED INSIDE ProjectDetailsPage */


    getProject(id: string) {
        const project = this.list.find((project) => {
            return project.id === id
        })
        return project
    }

    getProjectByName(name: string) {
        const project = this.list.find((project) => {
            return project.name.toLowerCase() === name.toLowerCase()
        })
        return project
    }

    getToDoListForProject(projectId: string): IToDoIssue[] {
        const project = this.getProject(projectId)
        if (project) {
            return project.todoList
        } else {
            return []
        }
    }



    totalProjectsCost() {
        const TotalBudget = this.list.reduce((acumulative, Project) => acumulative + Project.cost, 0)
        return TotalBudget
    }

    deleteProject(id: string) {
        const project = this.getProject(id)
        if (!project) { return }
        //project.ui.remove()
        const remain = this.list.filter((project) => {
            return project.id !== id
        })
        this.list = remain
        this.onProjectDeleted(project.name)
    }


    exprtToJSON(fileName: string = "projects") {
        console.log("Inside exprtToJSON")
        const projects: IProject[] = this.list
        console.log("Projects:", projects)
        this.showExportJSONModal(projects, fileName)
        console.log("After showExportJSONModal")
    }

    imprtFromJSON() {
        // Create a file input element to allow the user to select a JSON file
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "application/json"
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            // Get the JSON data from the file 
            const json = reader.result
            if (!json) { return }
            const projects: IProject[] = JSON.parse(json as string)


            //Check that each project is assigned a unique ID.
            projects.forEach((project) => {
                if (!project.id) {
                    console.warn(`Project "${project.name}" is missing an ID. Generating a new one...`)
                    const messagePopUp = new MessagePopUp(
                        document.body,
                        "warning",
                        "ID missing",
                        `Project "${project.name}" is missing an ID. Generating a new one...`,
                        ["Got it"]
                    )

                    // Define ALL your button callbacks for the messagePopUp created
                    const buttonCallbacks = {
                        "Got it": () => {
                            console.log("Got it button clicked!");
                            messagePopUp.closeMessageModal();// ... logic for "Got it" button ...
                        },
                    }
                    project.id = uuidv4(); // Genera un nuevo ID si no existe
                }
            })

            // Fire the dialog where you select the projects you want to import
            this.showImportJSONModal(projects)

            /* // ESTE CODIGO HA SIDO TRANSLADADO A LA FUNCIÓN QUE MUESTRA EL LISTADO PARA SELECCIONAR
                        // for (const project of projects) {
                        //     try {
                        //         this.newProject(project)
                        //     } catch (error) {
                        //         console.log(error)
                        //     }
            */

        })

        input.addEventListener("change", () => {
            const filesList = input.files
            if (!filesList) { return }
            reader.readAsText(filesList[0])
        })
        input.click()
    }

    confirmBtnClickListener: EventListener | null = null
    cancelImportProjectBtnClickListener: EventListener | null = null
    cancelExportProjectBtnClickListener: EventListener | null = null

    showImportJSONModal(projects: IProject[]) {
        // Create a modal dialog element
        const modalListOfProjectsJson = document.getElementById("modal-list-of-projects-json")
        if (modalListOfProjectsJson) {
            toggleModal("modal-list-of-projects-json")
        } else {
            throw new Error("Modal dialog element not found")

        }
        // Generate the list of projects
        const projectListJson = document.querySelector("#json-projects-list")
        if (projectListJson) {
            this.generateProjectList(projects, projectListJson)
        } else {
            throw new Error("Project list element not found")
        }

        // Change the Modal Title
        const title = document.querySelector("#modal-header-title h4")
        if (title) {
            title.textContent = "SELECT PROJECT/S TO IMPORT"
        } else {
            throw new Error("Title element not found")
        }

        // Button to select all the projects at once
        const selectAllBtn = document.querySelector("#selectAllBtn")
        if (selectAllBtn) {
            selectAllBtn.textContent = "Select all"
            selectAllBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.selectAllCheckboxes(projectListJson)
            })
        } else {
            throw new Error("Select all button not found")
        }

        // Button to deselect all the projects at once
        const deselectAllBtn = document.querySelector("#deselectAllBtn")
        if (deselectAllBtn) {
            deselectAllBtn.textContent = "Deselect all"
            deselectAllBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.deselectAllCheckboxes(projectListJson)
            })
        } else {
            throw new Error("Deselect all button not found")
        }

        //Prevent the use of the keydown Escape
        modalListOfProjectsJson.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') {
                event.stopPropagation()
                event?.preventDefault()
            }
        })

        // Confirmation-Cancellation button for taking the selection
        const confirmBtn = document.querySelector("#confirm-json-list")
        if (!confirmBtn) {
            throw new Error("Confirm button not found")
        }

        const checkmarkSymbol = String.fromCharCode(0x2713)
        confirmBtn.textContent = checkmarkSymbol

        //Disable checkboxes for existing project
        projectListJson?.querySelectorAll("li > label > input[type='checkbox']").forEach(async (checkbox) => {
            const parentNode = checkbox.closest("li")
            if (parentNode) {
                const projectName: string | null = parentNode.textContent
                if (projectName) {
                    const existingProject = this.getProjectByName(projectName)
                    if (existingProject) {
                        (checkbox as HTMLInputElement).disabled = true;
                        // Add visual cues to the disabled checkbox
                        (parentNode as HTMLElement).classList.add("disabled-checkbox"); // Add a CSS class for styling
                        //Add question mark icon 
                        const questionMarkIcon = document.createElement("span");
                        questionMarkIcon.textContent = String.fromCharCode(0x003F);
                        questionMarkIcon.style.fontSize = "1.2rem";
                        questionMarkIcon.style.marginLeft = "5px";
                        parentNode.appendChild(questionMarkIcon);

                        //Create the MessagePopUp instance outside the eventlistener in order to pass the info to the instance
                        // const messagePopUp = new MessagePopUp(
                        //     document.body,
                        //     "info",
                        //     "A project with that name already exists and cannot be imported. Please delete the project with the same name before trying to import.",
                        // );
                        //Add the CSS class to the Got it button to apply the mask for animation
                        // const gotItBtn = this.ui.querySelector("#btn-popup")
                        // gotItBtn?.classList.add("message-popup-mask-over-btn")



                        // Add event listener to the question mark icon
                        questionMarkIcon.addEventListener("click", async () => {
                            const projectExistingID = existingProject.id
                            const messagePopUp = new MessagePopUp(
                                document.body,
                                "info",
                                "This Project already exists",
                                'The specified project name is already in use. To import this project and replace the existing data, select the button "Allow overwrite"',
                                ["Got it", "Allow overwrite"]
                            )

                            // Define ALL your button callbacks for the messagePopUp created
                            const buttonCallbacks = {
                                "Got it": () => {
                                    console.log("Got it button clicked!");
                                    messagePopUp.closeMessageModal();// ... logic for "Got it" button ...
                                },
                                "Allow overwrite": () => {
                                    console.log("Overwrite button clicked!");

                                    //The logic for enabling the checkbox of the project
                                    if (projectExistingID) {
                                        console.log(`the project ID is: ${projectExistingID}`);
                                        (checkbox as HTMLInputElement).disabled = false;
                                        (parentNode as HTMLElement).classList.remove("disabled-checkbox");
                                        // Add visual clues to the overwrite checkbox
                                        (parentNode as HTMLElement).classList.add("overwrite-checkbox");
                                    } else {
                                        console.log("Errror:Could not find the project ID.");

                                    }
                                    messagePopUp.closeMessageModal();
                                }

                            };

                            // *** Wait for the buttons to be rendered and event listeners attached ***
                            await messagePopUp.showNotificationMessage(buttonCallbacks,);
                        });

                        //change cursor to pointer on hover
                        questionMarkIcon.addEventListener("mouseover", () => {
                            questionMarkIcon.style.cursor = "pointer"
                        });
                        //Reset cursor on mouseout
                        questionMarkIcon.addEventListener("mouseout", () => {
                            questionMarkIcon.style.cursor = "default"
                        });
                    }
                }
            }
        })


        this.confirmBtnClickListener = async (e: Event) => {
            e.preventDefault()

            //Get the selected projects from the checkboxes
            const selectedProjects: IProject[] = []
            projectListJson?.querySelectorAll("li > label > input[type='checkbox']:checked").forEach((checkbox) => {
                const parentNode = checkbox.closest("li")
                if (parentNode) {
                    // Get the first child node, which should be the text node
                    // the fisrt child is de checkbox
                    // the second child is the proper name
                    // the third child is the question mark
                    const projectName = parentNode.childNodes[1].textContent?.trim()
                    const project = projects.find((project) => project.name === projectName)
                    if (project) {
                        selectedProjects.push(project)
                    } else {
                        console.log("Project not found:  " + projectName)
                    }
                } else {
                    console.log("Parent node not found for the checkbox")
                }
            })

            //Check whether any project is selecter before confirm
            //if none project is selected, close the modal the same way cancel button
            if (selectedProjects.length > 0) {
                console.log(selectedProjects);


                //Import the selected projects
                for (const project of selectedProjects) {
                    try {
                        const newProjectResult = await this.newProject(project); // Wait for the Promise
                        if (newProjectResult) { // Check if a project was created (not skipped)
                            console.log("Project imported successfully:", newProjectResult.name);
                        } else {
                            console.log("Project import skipped:", project.name);
                        }
                    } catch (error) {
                        console.error("Error importing project:", project.name, error);
                    }
                }

            }
            this.clearProjectCheckList("#json-projects-list")
            closeModalProject("modal-list-of-projects-json", this)
        }

        const cancelImportProjectBtn: Element | null = document.getElementById("cancel-json-list-btn")
        if (!cancelImportProjectBtn) {
            throw new Error("Cancel button not found")
        }

        const cancelSymbol = String.fromCharCode(0x274C)
        cancelImportProjectBtn.textContent = cancelSymbol
        this.cancelImportProjectBtnClickListener = (e: Event) => {
            e.preventDefault()
            this.clearProjectCheckList("#json-project-list")
            closeModalProject("modal-list-of-projects-json", this)
        }

        //Remove existing event listener
        confirmBtn.removeEventListener("click", this.confirmBtnClickListener);
        cancelImportProjectBtn?.removeEventListener("click", this.cancelImportProjectBtnClickListener);

        //Add new event listener
        confirmBtn.addEventListener("click", this.confirmBtnClickListener)
        cancelImportProjectBtn?.addEventListener("click", this.cancelImportProjectBtnClickListener)
    }

    showExportJSONModal(projects: IProject[], fileName: string) {

        // Show the modal dialog element
        const modalListOfProjectsJson = document.getElementById("modal-list-of-projects-json")
        if (modalListOfProjectsJson) {
            toggleModal("modal-list-of-projects-json")
            console.log("After show the modal")
        } else {
            throw new Error("Modal dialog element not found")
        }

        // Generate the list of projects
        const projectListJson = document.querySelector("#json-projects-list")
        this.generateProjectList(projects, projectListJson)
        console.log("After display the list of projects")
        // Change the Modal Title
        const title = document.querySelector("#modal-header-title h4")
        if (title) {
            title.textContent = "SELECT PROJECT/S TO EXPORT"
        } else {
            throw new Error("Title element not found")
        }
        console.log("cambio de titulo del modal");

        // Button to select all the projects at once
        const selectAllBtn = document.querySelector("#selectAllBtn")
        if (selectAllBtn) {
            selectAllBtn.textContent = "Select all"
            selectAllBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.selectAllCheckboxes(projectListJson)
            })
        } else {
            throw new Error("Selected all button not found")
        }

        // Button to deselect all the projects at once
        const deselectAllBtn = document.querySelector("#deselectAllBtn")
        if (deselectAllBtn) {
            deselectAllBtn.textContent = "Deselect all"
            deselectAllBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.deselectAllCheckboxes(projectListJson)
            })
        } else {
            throw new Error("Deselected all button not found")
        }
        // Prevent the use of the keydown Escape
        modalListOfProjectsJson.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') {
                event.stopPropagation()
                event?.preventDefault()
            }
        })
        // Confirmation-Cancellation button for taking the selection
        const confirmBtn = document.getElementById("confirm-json-list")
        if (!confirmBtn) {
            throw new Error("Confirm button not found")
        }

        const checkmarkSymbol = String.fromCharCode(0x2713)
        confirmBtn.textContent = checkmarkSymbol

        this.confirmBtnClickListener = (e: Event) => {
            e.preventDefault()

            // Get the selected projects from the checkboxes
            const selectedProjects: IProject[] = []
            projectListJson?.querySelectorAll("li > label > input[type='checkbox']:checked").forEach((checkbox) => {
                const parentNode = checkbox.closest("li")
                if (parentNode) {
                    const projectName = parentNode.textContent
                    const project = projects.find((project) => project.name === projectName)
                    if (project) {
                        selectedProjects.push(project)
                    } else {
                        console.log("Project not found: " + projectName)
                    }
                } else {
                    console.log("Parent node not found for the checkbox")
                }
            })

            // Check whether any project is selecter before confirm
            // if none project is selected, close the modal the same way cancel button                
            if (selectedProjects.length > 0) {

                // Export the selected projects

                //function for the second argument of the STRINGIFY
                function removeUIfromExport(key, value) {
                    if (key === "ui") {
                        return undefined
                    }
                    return value
                }

                const json = JSON.stringify(selectedProjects, removeUIfromExport, 2) //remove null from the second argument
                const blob = new Blob([json], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${fileName}_${new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })}.json`
                a.click()
                URL.revokeObjectURL(url)
            }
            this.clearProjectCheckList("#json-projects-list")
            closeModalProject("modal-list-of-projects-json", this)

        }

        const cancelExportProjectBtn: Element | null = document.getElementById("cancel-json-list-btn")
        if (!cancelExportProjectBtn) {
            throw new Error("Cancel button not found")
        }
        const cancelSymbol = String.fromCharCode(0x274C)
        cancelExportProjectBtn.textContent = cancelSymbol
        this.cancelExportProjectBtnClickListener = (e: Event) => {
            e.preventDefault()
            this.clearProjectCheckList("#json-projects-list")
            closeModalProject("modal-list-of-projects-json", this)
        }
        // cancelExportProjectBtn.removeEventListener("click", cancelExportProjectBtnClickListener)

        //Remove existing event listeners
        confirmBtn.removeEventListener("click", this.confirmBtnClickListener)
        cancelExportProjectBtn?.removeEventListener("click", this.cancelExportProjectBtnClickListener)

        //Add new event listeners
        confirmBtn.addEventListener("click", this.confirmBtnClickListener)
        cancelExportProjectBtn?.addEventListener("click", this.cancelExportProjectBtnClickListener)
    }

    generateProjectList(projects: IProject[], projectListJson: Element | null) {
        // const projectListJson = document.querySelector("#json-projects-list")
        if (!projectListJson) {
            throw new Error("Project list element not found")
        }
        projectListJson.innerHTML = "" //This clear the list befor adding the projects
        console.log("Before display the list of projects")
        projects.forEach((project) => {
            const listItems = document.createElement("li")

            // Create the checkbox with a custom label and checkmark
            const checkboxLabel = document.createElement("label")
            checkboxLabel.classList.add("radio") //Added "radio" class for stiling
            // Append the checkbox label to the list item
            listItems.appendChild(checkboxLabel)

            const checkbox = document.createElement("input")
            checkbox.type = "checkbox"
            checkboxLabel.appendChild(checkbox)

            const checkmark = document.createElement("span")
            checkmark.classList.add("checkmark")
            checkboxLabel.appendChild(checkmark)



            // const listItems = document.createElement("li")

            // const checkbox = document.createElement("input")
            // checkbox.type = "checkbox"
            // listItems.appendChild(checkbox)

            const projectNametext = document.createTextNode(project.name)
            listItems.appendChild(projectNametext)
            listItems.classList.add("checkbox-json")
            projectListJson?.appendChild(listItems)

        })
    }

    clearProjectCheckList(list: string) {
        const cleanCheckList = document.querySelector(list);
        if (cleanCheckList) {
            cleanCheckList.innerHTML = "";
        } else {
            console.log("Error: cleanCheckList is null")
        }
    }

    selectAllCheckboxes(list: Element | null) {
        if (!list) {
            throw new Error("List element not found");
        }
        list.querySelectorAll("input[type='checkbox']:not(:disabled)").forEach((checkbox) => {
            (checkbox as HTMLInputElement).checked = true;
        });
    }

    deselectAllCheckboxes(list: Element | null) {
        if (!list) {
            throw new Error("List element not found");
        }
        list.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
            (checkbox as HTMLInputElement).checked = false;
        });
    }

    //Method for get all the selected projects in the export and import modals
    getSelectedProjects(projectListJson, projects): IProject[] {
        const selectedProjects: IProject[] = []
        projectListJson.querySelectorAll("li > label > input[type='checkbox']").forEach((checkbox) => {
            if ((checkbox as HTMLInputElement).checked) {
                // Add the project to the selectedProjects array
                const parentNode = checkbox.closest("li")
                if (!parentNode) {
                    console.error("Error: parentNode not found")
                    return
                }
                const projectName = parentNode.textContent?.trim()

                // Get the project object from the projects array using the project name
                const selectedProject = projects.find(project => project.name === projectName)

                if (selectedProject) {
                    selectedProjects.push(selectedProject)
                } else {
                    console.error(`Error: Project with name "${projectName}" not found in projects array.`)
                }
            }
        })
        return selectedProjects
    }










}




