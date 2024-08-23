import { v4 as uuidv4 } from 'uuid'

export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"
export type BusinessUnit = "Edification" | "Civil" | "Transport" | "Bridge" | "Other"

export interface IProject {
    name: string
    acronym: string
    businessUnit: BusinessUnit
    description: string
    status: ProjectStatus
    userRole: UserRole
    finishDate: Date
    backgroundColorAcronym:string
}
// const dummyProject: IProject = {
//     name: "",
//     description: "",
//     status: "Active",
//     businessUnit: "Commercial Construction",
//     userRole: "Developer",
//     finishDate: new Date()
// }
// You can simplify the code by using the IProject interface to get the property keys.
// const projectKeys = Object.keys({} as IProject)
// instead of
// const projectKeys = Object.keys(dummyProject)

export enum BusinessUnit {
    Edification = "Edification",
    Civil = "Civil",
    Transport = "Transport",
    Bridge = "Bridge",
    Other = "Other"
}
export class Project implements IProject {
    // To satisfy IProject
    name: string
    acronym: string
    businessUnit: "Edification" | "Civil" | "Transport" | "Bridge" | "Other"
    description: string
    status: "Pending" | "Active" | "Finished"
    userRole: "Architect" | "Engineer" | "Developer"
    finishDate: Date
    
    // Class internals
    id: string
    ui: HTMLDivElement
    cost: number = 0
    progress: number = 0
    backgroundColorAcronym: string

    constructor(data: IProject) {
        // const projectKeys = Object.keys(dummyProject)
        for (const key in data) {  
            
            if (key === "businessUnit") {
                this[key] = BusinessUnit[data[key] as keyof typeof BusinessUnit]
            } else if (key === "finishDate") {
                this.finishDate = new Date(data.finishDate)
            } else {
                this[key] = data[key]
            }
        }

        this.backgroundColorAcronym = this.calculateBackgroundColorAcronym()
        this.setUi();
        if (!this.id) { this.id = uuidv4() } //In order to not change the ID when we import projects from JSON file
        console.log(data);
        
        // I have passed the eventListener of the click over the UI because problems with the overwrite, since the event listener that I am trying to attach to the UI element is being added before the element actually exists in the DOM. In this new way, with the event listener attachment inside the Project constructor, it's added as soon as the UI element is created.
        // this.ui.addEventListener("click", () => {
        //     changePageContent("project-details", "flex")
        //     ProjectsManager.setDetailsPage(this) // Pass 'this' to refer to the current project
        //     console.log("Details page set in a new window")
        // })
    }

    private calculateBackgroundColorAcronym(): string {
        switch (this.businessUnit) {
            case "Edification":
                return "#f08080"; // Light red
            case "Civil":
                return "#90ee90"; // Light green
            case "Transport":
                return "#add8e6"; // Light blue
            case "Bridge":
                return "#c8a2c8"; // Light yellow
            case "Other":
                return "#d3d3d3"; // Light grey
            default:
                return "#ca8134"; // Default color
        }
    }
    
    setUi() {
        if (this.ui && this.ui instanceof HTMLElement) {return}
        this.ui = document.createElement("div")
        this.ui.className = "project-card"
        
        this.ui.innerHTML = `
            <div class="card-header">
                <p style="background-color: ${this.backgroundColorAcronym}; padding: 10px; border-radius: 8px; aspect-ratio: 1; display: flex; align-items: center; ">${this.acronym}</p>
                <div>
                    <h5>${this.name}</h5>
                    <p>${this.description}</p>
                </div>
            </div>
            <div class="card-content">
                <div class="card-property">
                    <p style="color: #969696;">Business Unit</p>
                    <p>${this.businessUnit}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Status</p>
                    <p>${this.status}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">User Role</p>
                    <p>${this.userRole}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Cost</p>
                    <p>$${this.cost}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Progress</p>
                    <p>${this.progress * 100}%</p>
                </div>
            </div>
                    `
    }

}