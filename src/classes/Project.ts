import { v4 as uuidv4 } from 'uuid'

export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"


export interface IProject {
    name: string
    description: string
    status: ProjectStatus
    userRole: UserRole
    finishDate: Date
}
// const dummyProject: IProject = {
//     name: "",
//     description: "",
//     status: "Active",
//     userRole: "Developer",
//     finishDate: new Date()
// }
// You can simplify the code by using the IProject interface to get the property keys.
// const projectKeys = Object.keys({} as IProject)
// instead of
// const projectKeys = Object.keys(dummyProject)


export class Project implements IProject {
    // To satisfy IProject
    name: string
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
            this[key] = data[key]
        }
        
        this.setUi();
        if (!this.id) { this.id = uuidv4() } //In order to not change the ID when we import projects from JSON file
        console.log(data);
        
    }
    
    setUi() {
        if (this.ui && this.ui instanceof HTMLElement) {return}
        this.ui = document.createElement("div")
        this.ui.className = "project-card"
        this.ui.innerHTML = `
            <div class="card-header">
                <p style="background-color: #ca8134; padding: 10px; border-radius: 8px; aspect-ratio: 1; ">HC</p>
                <div>
                    <h5>${this.name}</h5>
                    <p>${this.description}</p>
                </div>
            </div>
            <div class="card-content">
                <div class="card-property">
                    <p style="color: #969696;">Status</p>
                    <p>${this.status}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Status</p>
                    <p>${this.userRole}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Status</p>
                    <p>$${this.cost}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Status</p>
                    <p>${this.progress * 100}%</p>
                </div>
            </div>
                    `
    }

}