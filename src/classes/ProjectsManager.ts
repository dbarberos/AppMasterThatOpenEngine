import { Project, IProject, ProjectStatus, UserRole, BusinessUnit } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject , changePageContent} from "./UiManager"
import { MessagePopUp } from "./MessagePopUp"

// let confirmBtnClickListener: EventListener | null = null   //Managing the EVENTLISTENER
// let cancelExportProjectBtnClickListener: EventListener | null = null  //GMAnaging the EVENTLISTENER

export class ProjectsManager {
    list: Project[] = []
    ui: HTMLElement
    defaultProjectCreated: boolean = false
    
    constructor(container: HTMLElement) {
        this.ui = container
        this.defaultProjectCreated = false
        this.createDefaultProject()
    }
    
    newProject(data: IProject) {
        const projectNames = this.list.map((project) => {
            return project.name
        })
        if (projectNames.includes(data.name)) {
            throw new Error(`A project with the name [ ${data.name} ] already exists`)
        }
        const project = new Project(data)
        project.ui.addEventListener("click", () => {
            changePageContent("project-details", "flex")
            this.setDetailsPage(project)
            console.log(" details pages set in a new window");
            
        })
        
        this.ui.append(project.ui)
        this.list.push(project)
        this.removeDefaultProject();
        return project
    }
    
    private setDetailsPage(project: Project) {
        const detailPage = document.getElementById("project-details")
        if (!detailPage) { return }
        
        for (const key in project) {
            const dataElement = detailPage.querySelectorAll(`[data-project-info="${key}"]`)
            if (dataElement) {
                if (key === "finishDate") {
                    const formattedDate = project.finishDate.toLocaleDateString("en-US", { year: "numeric", month:"long", day:"numeric"})
                    dataElement.forEach(element => {
                        element.textContent = formattedDate
                    })                       
                } else {
                dataElement.forEach(element => {
                    element.textContent = project[key]
                })
                }
                
            }
        }
        // Update the background color of the acronym in the dashboard-card
        const acronymElement = detailPage.querySelector('[data-project-info="acronym"]');
        if (acronymElement) {
            acronymElement.style.backgroundColor = project.backgroundColorAcronym;
        }
    } 
        
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
            progress: 1
        }
        
        const defaultProject = new Project(defaultData)
        defaultProject.ui.classList.add("default-project") //making the default special for easy removing 
        this.ui.append(defaultProject.ui)
        this.list.push(defaultProject)
        this.defaultProjectCreated = true
    }
    
    removeDefaultProject() {
        if (this.defaultProjectCreated && this.list.length > 1) {
            // Remove the defautl project from the Ui and from the array list
            const defaultProjectUI = this.ui.querySelector(".default-project");
            if (defaultProjectUI) {
                this.ui.removeChild(defaultProjectUI);
            }
            this.list = this.list.filter(project => project.ui !== defaultProjectUI)
            this.defaultProjectCreated = false;
        }
    }
    
    getProject(id: string) {
        const project = this.list.find((project) => {
            return project.id === id
        })
        return project
    }
    
    getProjectByName(name: string) {
        const project = this.list.find((project) => {
            return project.name === name
        })
        return project
    }
    
    totalProjectsCost() {
        const TotalBudget = this.list.reduce((acumulative, Project) => acumulative + Project.cost, 0)
        return TotalBudget
    }
    
    deleteProject(id: string) {
        const project = this.getProject(id)
        if (!project) { return }
        project.ui.remove()
        const remain = this.list.filter((project) => {
            return project.id !== id
        })
        this.list = remain
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
                        questionMarkIcon.addEventListener("click",  async () => {
                            const messagePopUp = new MessagePopUp(
                                document.body,
                                "info",
                                "This Project already exists",
                                "A project with that name already exists and cannot be imported.Please delete the project with the same name before trying to import.",
                                ["Got it"]
                            )                            

                            // Define ALL your button callbacks for the messagePopUp created
                            const buttonCallbacks = {
                                "Got it": () => {
                                    console.log("Got it button clicked!");
                                    messagePopUp.closeMessageModal();// ... logic for "Got it" button ...
                                },
                                
                                // Add more callbacks for other buttons as needed
                            };
                            
                            // *** Wait for the buttons to be rendered and event listeners attached ***
                            await messagePopUp.showNotificationMessage(buttonCallbacks); 
                             
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
            

        this.confirmBtnClickListener = (e: Event) => {
            e.preventDefault()

            //Get the selected projects from the checkboxes
            const selectedProjects: IProject[] = []
            projectListJson?.querySelectorAll("li > label > input[type='checkbox']:checked").forEach((checkbox) => {
                const parentNode = checkbox.closest("li")
                if (parentNode) {
                    const projectName = parentNode.textContent
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

                //Import the selected projects
                for (const project of selectedProjects)
                    try {
                        this.newProject(project)
                    } catch (error) {
                        console.log("Error importing project: " + project.name)
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
            closeModalProject("modal-list-of-projects-json",this)  
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
    
}




