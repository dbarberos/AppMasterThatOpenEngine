import { Project, IProject, ProjectStatus, UserRole } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject } from "./ModalManager"

let confirmBtnClickListener: EventListener | null = null   //GESTION DE LOS EVENTLISTENER
let cancelExporProjectBtnClickListener: EventListener | null = null  //GESTION DE LOS EVENTLISTENER
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
        this.ui.append(project.ui)
        this.list.push(project)
        this.removeDefaultProject();
        return project
    }
    createDefaultProject() {
        if (this.defaultProjectCreated) { return }
        const defaultData = {
            name: "Example Project",
            description: "This is a A Big Building",
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


    /* // ESTE CODIGO HA SIDO TRANSLADADOPASADO A LA FUNCIÓN QUE MUESTRA EL LISTADO PARA SELECCIONAR
        // const json = JSON.stringify(this.list, null, 2)
        // const blob = new Blob([json], { type: "application/json" })
        // const url = URL.createObjectURL(blob)
        // const a = document.createElement("a")
        // a.href = url
        // a.download = `${fileName}_${new Date().toLocaleDateString('es-ES', {
        //     year: 'numeric',
        //     month: '2-digit',
        //     day: '2-digit',
        //     hour: '2-digit',
        //     minute: '2-digit',
        //     second: '2-digit'
        // })}.json`
        // a.click()
        // URL.revokeObjectURL(url)
    }
*/
        
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
            // Fire the dialog where you select the projects you whant to import
            this.showImportJSONModal(projects)

/* // ESTE CODIGO HA SIDO TRANSLADADOPASADO A LA FUNCIÓN QUE MUESTRA EL LISTADO PARA SELECCIONAR
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

    showImportJSONModal(projects: IProject[]) {
        // Create a modal dialog element
        const modal = document.getElementById("modal-list-of-projects-json")
        if (!modal) {
            throw new Error("MOdal element not found")
        }
        const projectListJson = modal?.querySelector("#json-project-list")
        projects.forEach((project) => {
            const listItems = document.createElement("li")
            listItems.textContent = project.name
            const checkbox = document.createElement("input")
            checkbox.type = "checkbox"
            listItems.appendChild(checkbox)
            projectListJson?.appendChild(listItems)
        })
        // Change the Modal Title
        const title = document.querySelector("#modal-header-title h4")
        if (title) {
            title.textContent = "Select Projects to Import"
        } else {
            throw new Error("Title element not found")
        }
        
        // Button to select all the projects at once
        const selectAllBtn = document.querySelector("#selectAllBtn")
        if (selectAllBtn) {
            selectAllBtn.textContent = "Select all"
            selectAllBtn.addEventListener("click", () => {
                // select all checkboxes
                projectListJson?.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
                    (checkbox as HTMLInputElement).checked = true
                })
            })
        } else {
            throw new Error("Select all button not found")
        }
                
        // Button to deselect all the projects at once
        const deselectAllBtn = document.querySelector("#deselectAllBtn")
        if (deselectAllBtn) {
            deselectAllBtn.textContent = "Deselect all"
            deselectAllBtn.addEventListener("click", () => {
            // Deselect all checkboxes
                projectListJson?.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
                    (checkbox as HTMLInputElement).checked = false
                })
            })
        } else {
            throw new Error("Deselect all button not found")
        }
        
        // Confirmation button for taking the selection
        const confirmBtn = document.querySelector("#confirm-json-list")
        if (confirmBtn) {
            confirmBtn.textContent = "Confirm"
            confirmBtn.addEventListener("click", (e) => {
                e.preventDefault
                // Get the selected projects from the checkboxes
                const selectedProjects: IProject[] = []
                projectListJson?.querySelectorAll("li input [type='checkbox']:checked").forEach((checkbox) => {
                    const parentNode = checkbox.parentNode
                    if (parentNode) {
                        const projectName = checkbox.parentNode.textContent
                        const project = projects.find((project) => project.name === projectName)
                        if (project) {
                            selectedProjects.push(project)
                        } else {
                            throw new Error("Project not found")
                        }
                    } else {
                        throw new Error("Parent node not found")
                    }
                })
                for (const project of selectedProjects) {
                    try {
                        this.newProject(project)
                    } catch (error) {
                        console.log(error)
                    }
                }
            })
        } else {
            throw new Error("Confirm button not found")
        }
    }
    
    // let confirmBtnClickListener: EventListener | null = null   //GESTION DE LOS EVENTLISTENER
    // let cancelExporProjectBtnClickListener: EventListener | null = null  //GESTION DE LOS EVENTLISTENER
    
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
        // THIS WAS MOVED TO ITS OWN FUNCTION
        // Create a list element to hold the projects
        // const projectListJson = document.querySelector("#json-projects-list")
        // if (!projectListJson) {
        //     throw new Error("Project list element not found")
        // }
        // console.log("Before display the list of projects")
        // projects.forEach((project) => {
        //     const listItems = document.createElement("li")
        //     listItems.textContent = project.name
        //     const checkbox = document.createElement("input")
        //     checkbox.type = "checkbox"
        //     listItems.classList.add("checkbox-json")
        //     listItems.appendChild(checkbox)
        //     projectListJson?.appendChild(listItems)
        // })
        
        console.log("After display the list of projects")
        // Change the Modal Title
        const title = document.querySelector("#modal-header-title h4")
        if (title) {
            title.textContent = "Select Projects to Export"
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
                // select all checkboxes
                projectListJson?.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
                    (checkbox as HTMLInputElement).checked = true
                })
            })
        } else {
            console.log("No select all button found")
        }
        
        // Button to deselect all the projects at once
        const deselectAllBtn = document.querySelector("#deselectAllBtn")
        if (deselectAllBtn) {
            deselectAllBtn.textContent = "Deselect all"
            deselectAllBtn.addEventListener("click", (e) => {
                e.preventDefault()
                // Deselect all checkboxes
                projectListJson?.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
                    (checkbox as HTMLInputElement).checked = false
                })
            })
        } else {
            console.log("deselectAllBtn not found")
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
        
        confirmBtnClickListener = (e: Event) => { //ESTO ES NUEVO PARA MANEJAR LA GESTION DE EVENTOS
            e.preventDefault() // MOVIDO DOS LINEAS ARRIBA PARA GESTIONAS LOS EVENTOS
            // confirmBtn?.addEventListener("click", (e) => {   ESTO SE ELEIMNO PARA GESTIONAR LOS EVENTLISTENER

            // Get the selected projects from the checkboxes
            const selectedProjects: IProject[] = []
            projectListJson?.querySelectorAll("li input[type='checkbox']:checked").forEach((checkbox) => {
                const parentNode = checkbox.parentNode
                if (parentNode) {
                    const projectName = checkbox.parentNode.textContent
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
            // No project selected, close the modal the same way cancel button                
            if (selectedProjects.length === 0) {
                this.clearProjectCheckList("#json-projects-list")
                closeModalProject("modal-list-of-projects-json") 
            }
            
            // Export the selected projects
            const json = JSON.stringify(selectedProjects, null, 2)
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
            this.clearProjectCheckList("#json-projects-list")
            closeModalProject("modal-list-of-projects-json")        
        }
        confirmBtn.removeEventListener("click", confirmBtnClickListener)
        

        const cancelExportProjectBtn: Element | null = document.getElementById("cancel-json-list-btn")
        if (!cancelExportProjectBtn) {
            throw new Error("Cancel button not found")
        }
        const cancelSymbol = String.fromCharCode(0x274C)    
        cancelExportProjectBtn.textContent = cancelSymbol
        cancelExporProjectBtnClickListener = (e: Event) => {            
            // cancelExportProjectBtn.addEventListener("click", (e) => {   LINEA ANTIGUA DE GESTION DE EVENTOS
            e.preventDefault()
            this.clearProjectCheckList("#json-projects-list")
            closeModalProject("modal-list-of-projects-json")  
    }
    cancelExportProjectBtn.removeEventListener("click", cancelExporProjectBtnClickListener)
    
    //Remove existing event listeners
    confirmBtn.removeEventListener("click", confirmBtnClickListener)
    cancelExportProjectBtn?.removeEventListener("click", cancelExporProjectBtnClickListener)

    //Add new event listeners
    confirmBtn.addEventListener("click", confirmBtnClickListener)
    cancelExportProjectBtn?.addEventListener("click", cancelExporProjectBtnClickListener)
    
    }

    generateProjectList(projects: IProject[], projectListJson: Element | null) {
        // const projectListJson = document.querySelector("#json-projects-list")
        if (!projectListJson) {
            throw new Error("Project list element not found")
        }
        projectListJson.innerHTML = "" //This clear the list beffor adding the projects
        console.log("Before display the list of projects")
        projects.forEach((project) => {
            const listItems = document.createElement("li")
            
            const checkbox = document.createElement("input")
            checkbox.type = "checkbox"
            listItems.appendChild(checkbox)
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
    
}




