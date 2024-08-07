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
    
    constructor(data: IProject) {
        // const projectKeys = Object.keys(dummyProject)
        for (const key in data) {  
            
            if (key === "businessUnit") {
                this[key] = BusinessUnit[data[key] as keyof typeof BusinessUnit]
            } else {
                this[key] = data[key]
            }
        }
        
        this.setUi();
        if (!this.id) { this.id = uuidv4() } //In order to not change the ID when we import projects from JSON file
        console.log(data);
        
    }
    
    setUi() {
        if (this.ui && this.ui instanceof HTMLElement) {return}
        this.ui = document.createElement("div")
        this.ui.className = "project-card"

        let backgroundColorAcronym = "#ca8134";

        switch (this.businessUnit) {
            case "Edification":
                backgroundColorAcronym = "#f08080"; //Light red
                break;
            case "Civil":
                backgroundColorAcronym = "#90ee90"; //Light green
                break;
            case "Transport":
                backgroundColorAcronym = "#add8e6"; //Light blue
                break;
            case "Bridge":
                backgroundColorAcronym = "#c8a2c8"; //Light yellow
                break;
            case "Other":
                backgroundColorAcronym = "#d3d3d3"; // Light grey
                break;
        }

        this.ui.innerHTML = `
            <div class="card-header">
                <p style="background-color: ${backgroundColorAcronym}; padding: 10px; border-radius: 8px; aspect-ratio: 1; display: flex; align-items: center;  ">${this.acronym}</p>
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